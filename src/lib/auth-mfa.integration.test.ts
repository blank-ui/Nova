import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canOpenAdmin } from "@/lib/auth-policy";
import { randomUUID } from "node:crypto";
import { base32 } from "@better-auth/utils/base32";

try {
  process.loadEnvFile?.(".env");
} catch {}

/**
 * Real Better Auth + MySQL Integration Tests.
 *
 * Safety requirements:
 * 1. RUN_DB_INTEGRATION_TESTS === "true".
 * 2. Targets strictly local database (localhost/127.0.0.1) named 'nova'.
 * 3. Uses uniquely identifiable disposable test accounts.
 * 4. Cleans up all created records in afterAll.
 */

function assertSafeDevDatabase() {
  if (process.env.RUN_DB_INTEGRATION_TESTS !== "true") {
    throw new Error("Database integration tests refused: RUN_DB_INTEGRATION_TESTS=true environment variable required.");
  }
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not set.");
  const url = new URL(dbUrl);
  const allowedHosts = ["localhost", "127.0.0.1", "::1"];
  if (!allowedHosts.includes(url.hostname)) {
    throw new Error(`Refusing to run integration test on non-local database host: ${url.hostname}`);
  }
  const dbName = url.pathname.replace(/^\//, "");
  if (!dbName.toLowerCase().includes("nova")) {
    throw new Error(`Refusing to run integration test on non-nova database: ${dbName}`);
  }
}

function extractCookies(headers: Headers): string {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie().map((c) => c.split(";")[0].trim()).join("; ");
  }
  const raw = headers.get("set-cookie") ?? "";
  return raw.split(";")[0].trim();
}

describe("Better Auth + MySQL Live Authentication & MFA Flow Integration Tests", () => {
  const runId = randomUUID().replace(/-/g, "").slice(0, 10);
  const testUserEmail = `test-auth-${runId}@nova-integration.test`;
  const testPassword = "SuperSecurePassword1234!";
  const trackedUserIds: string[] = [];

  beforeAll(() => {
    assertSafeDevDatabase();
  });

  afterAll(async () => {
    try {
      if (trackedUserIds.length > 0) {
        await prisma.authSession.deleteMany({ where: { userId: { in: trackedUserIds } } });
        await prisma.authAccount.deleteMany({ where: { userId: { in: trackedUserIds } } });
        await prisma.authTwoFactor.deleteMany({ where: { userId: { in: trackedUserIds } } });
        await prisma.user.deleteMany({ where: { id: { in: trackedUserIds } } });
      }
      // Also clean up any verification tokens associated with test user
      await prisma.authVerification.deleteMany({
        where: { identifier: { contains: testUserEmail } },
      });
    } catch (cleanupErr) {
      console.error("Cleanup error in auth integration test:", cleanupErr instanceof Error ? cleanupErr.message : cleanupErr);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("registers a new client user into MySQL via Better Auth", async () => {
    const signupRes = await auth.api.signUpEmail({
      body: {
        name: `Integration Test User ${runId}`,
        email: testUserEmail,
        password: testPassword,
      },
    });

    expect(signupRes).toBeDefined();
    expect(signupRes.user.email).toBe(testUserEmail);
    expect(signupRes.user.role).toBe("CLIENT");
    trackedUserIds.push(signupRes.user.id);

    // Verify user was persisted directly in MySQL
    const dbUser = await prisma.user.findUnique({
      where: { id: signupRes.user.id },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.email).toBe(testUserEmail);
    expect(dbUser?.role).toBe("CLIENT");
    expect(dbUser?.emailVerified).toBe(false);
  });

  it("handles email verification state in MySQL", async () => {
    const userId = trackedUserIds[0];
    expect(userId).toBeDefined();

    // Verify email directly in database (simulating link callback consumption)
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    expect(updatedUser?.emailVerified).toBe(true);
  });

  it("signs in with credentials and creates a valid database session in MySQL", async () => {
    const signInRes = await auth.api.signInEmail({
      body: {
        email: testUserEmail,
        password: testPassword,
      },
      returnHeaders: true,
    });

    expect(signInRes.response).toBeDefined();
    expect(signInRes.response.user.email).toBe(testUserEmail);

    const token = signInRes.response.token;
    expect(token).toBeDefined();

    // Verify session was persisted in AuthSession table in MySQL
    const dbSession = await prisma.authSession.findUnique({
      where: { token },
    });
    expect(dbSession).not.toBeNull();
    expect(dbSession?.userId).toBe(trackedUserIds[0]);
  });

  it("enables TOTP MFA and verifies pre-MFA vs post-MFA session boundary", async () => {
    const userId = trackedUserIds[0];

    // Establish a session first
    const signInRes = await auth.api.signInEmail({
      body: {
        email: testUserEmail,
        password: testPassword,
      },
      returnHeaders: true,
    });
    const cookieHeader = extractCookies(signInRes.headers);

    // 1. Enable Two-Factor
    const enableRes = await auth.api.enableTwoFactor({
      body: {
        password: testPassword,
      },
      headers: new Headers({ cookie: cookieHeader }),
    });

    if (enableRes.method !== "totp") throw new Error("Expected totp method");
    expect(enableRes.totpURI).toBeDefined();
    const uri = new URL(enableRes.totpURI);
    const b32Secret = uri.searchParams.get("secret");
    expect(b32Secret).toBeTruthy();
    const rawSecret = new TextDecoder().decode(base32.decode(b32Secret!));

    // 2. Generate and verify valid TOTP code
    const totpGen = await auth.api.generateTOTP({
      body: {
        secret: rawSecret,
      },
    });
    expect(totpGen.code).toMatch(/^[0-9]{6}$/);

    const verifyTotpRes = await auth.api.verifyTOTP({
      body: {
        code: totpGen.code,
      },
      headers: new Headers({ cookie: cookieHeader }),
    });
    expect(verifyTotpRes).toBeDefined();

    // Verify user is updated in MySQL with twoFactorEnabled = true
    const userAfterMfa = await prisma.user.findUnique({ where: { id: userId } });
    expect(userAfterMfa?.twoFactorEnabled).toBe(true);

    // Promote user to ADMIN for privileged route verification
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    });

    // 3. Now perform a new sign-in with 2FA enabled:
    // Better Auth must NOT issue an authenticated admin session before the 2FA challenge is completed!
    const mfaSignInRes = await auth.api.signInEmail({
      body: {
        email: testUserEmail,
        password: testPassword,
      },
      returnHeaders: true,
    });

    // Better Auth intercepts credential sign-in and requires twoFactorRedirect
    expect((mfaSignInRes.response as unknown as { twoFactorRedirect?: boolean }).twoFactorRedirect).toBe(true);

    // 4. Submit an invalid TOTP code: MUST be rejected
    const mfaCookie = extractCookies(mfaSignInRes.headers);
    await expect(
      auth.api.verifyTOTP({
        body: {
          code: "000000",
        },
        headers: new Headers({ cookie: mfaCookie }),
      })
    ).rejects.toThrow();

    // 5. Submit valid TOTP code: MUST succeed and issue real session
    const validTotp = await auth.api.generateTOTP({
      body: {
        secret: rawSecret,
      },
    });
    const finalVerifyRes = await auth.api.verifyTOTP({
      body: {
        code: validTotp.code,
      },
      headers: new Headers({ cookie: mfaCookie }),
      returnHeaders: true,
    });

    expect(finalVerifyRes.response.token).toBeDefined();
    const verifiedCookie = extractCookies(finalVerifyRes.headers);

    // 6. Verify authenticated session now satisfies canOpenAdmin policy
    const sessionData = await auth.api.getSession({
      headers: new Headers({ cookie: verifiedCookie }),
    });
    expect(sessionData).not.toBeNull();
    expect(sessionData?.user.role).toBe("ADMIN");
    expect(sessionData?.user.twoFactorEnabled).toBe(true);
    expect(canOpenAdmin(sessionData?.user.role, sessionData?.user.twoFactorEnabled)).toBe(true);

    // 7. Verify sign-out revokes session in MySQL
    await auth.api.signOut({
      headers: new Headers({ cookie: verifiedCookie }),
    });

    const sessionAfterSignOut = await auth.api.getSession({
      headers: new Headers({ cookie: verifiedCookie }),
    });
    expect(sessionAfterSignOut).toBeNull();
  });
});
