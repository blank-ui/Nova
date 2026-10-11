import { beforeEach, describe, expect, it } from "vitest";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "@better-auth/memory-adapter";
import { admin } from "better-auth/plugins";

type SentEmail = { to: string; url: string; subject: string; token?: string };
let sent: SentEmail[];
let handleRequest: (request: Request) => Promise<Response>;
let getSession: (headers: Headers) => Promise<unknown>;

beforeEach(() => {
  sent = [];
  const testAuth = betterAuth({
    appName: "Nova test",
    baseURL: "http://localhost:3000",
    secret: "test-secret-with-more-than-thirty-two-bytes",
    database: memoryAdapter({ user: [], session: [], account: [], verification: [], twoFactor: [], rateLimit: [] }),
    rateLimit: { enabled: false },
    emailAndPassword: {
      enabled: true, requireEmailVerification: true, autoSignIn: false, minPasswordLength: 12, maxPasswordLength: 128,
      sendResetPassword: async ({ user, url, token }) => { sent.push({ to: user.email, url, token, subject: "reset" }); },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, url, token }) => { sent.push({ to: user.email, url, token, subject: "verify" }); },
    },
    account: { accountLinking: { enabled: true, disableImplicitLinking: true, allowDifferentEmails: false } },
    plugins: [admin({ defaultRole: "CLIENT", adminRoles: ["ADMIN"] })],
  });
  handleRequest = testAuth.handler;
  getSession = (headers) => testAuth.api.getSession({ headers });
});

async function post(path: string, payload: unknown, cookie?: string) {
  return handleRequest(new Request(`http://localhost:3000/api/auth/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(payload),
  }));
}

describe("Better Auth email flows with an isolated in-memory adapter", () => {
  it("registers verified-by-email client accounts and ignores attempted public admin roles", async () => {
    const attemptedElevation = await post("sign-up/email", { name: "Nova Client", email: "client@example.test", password: "a-long-test-password-123", role: "ADMIN" });
    expect(attemptedElevation.ok).toBe(false);
    expect((await attemptedElevation.json()).code).toBe("FIELD_NOT_ALLOWED");
    const response = await post("sign-up/email", { name: "Nova Client", email: "client@example.test", password: "a-long-test-password-123" });
    expect(response.ok, await response.clone().text()).toBe(true);
    const body = await response.json();
    expect(body.user.role).toBe("CLIENT");
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("client@example.test");
  });

  it("rejects short passwords at the authentication boundary", async () => {
    const response = await post("sign-up/email", { name: "Nova Client", email: "short@example.test", password: "short" });
    expect(response.ok).toBe(false);
  });

  it("uses a single-use reset token and accepts the new password", async () => {
    const email = "reset@example.test";
    const oldPassword = "original-password-123";
    await post("sign-up/email", { name: "Reset Client", email, password: oldPassword });
    const verification = new URL(sent[0].url);
    const token = verification.searchParams.get("token");
    expect(token).toBeTruthy();
    const verify = await handleRequest(new Request(sent[0].url));
    expect([200, 302, 303]).toContain(verify.status);

    const requestReset = await post("request-password-reset", { email, redirectTo: "http://localhost:3000/reset-password" });
    expect(requestReset.ok).toBe(true);
    const resetMail = sent.find((mail) => mail.subject === "reset");
    expect(resetMail).toBeDefined();
    const resetToken = resetMail!.token ?? new URL(resetMail!.url).searchParams.get("token");
    expect(resetToken).toBeTruthy();
    const resetResponse = await post("reset-password", { newPassword: "replacement-password-456", token: resetToken });
    expect(resetResponse.ok).toBe(true);
    const replay = await post("reset-password", { newPassword: "another-replacement-789", token: resetToken });
    expect(replay.ok).toBe(false);
    expect((await post("sign-in/email", { email, password: "replacement-password-456" })).ok).toBe(true);
    expect((await post("sign-in/email", { email, password: oldPassword })).ok).toBe(false);
  });

  it("signs out and invalidates the issued session cookie", async () => {
    const email = "logout@example.test";
    await post("sign-up/email", { name: "Logout Client", email, password: "a-long-test-password-123" });
    await handleRequest(new Request(sent[0].url));
    const signIn = await post("sign-in/email", { email, password: "a-long-test-password-123" });
    expect(signIn.ok).toBe(true);
    const rawCookie = signIn.headers.get("set-cookie");
    expect(rawCookie).toBeTruthy();
    const cookie = rawCookie!.split(";")[0];
    expect(await getSession(new Headers({ cookie }))).toBeTruthy();
    const signOut = await post("sign-out", {}, cookie);
    expect(signOut.ok).toBe(true);
    expect(await getSession(new Headers({ cookie }))).toBeNull();
  });

  it("rejects an OAuth callback without a previously issued state", async () => {
    const oauthAuth = betterAuth({
      appName: "Nova OAuth test", baseURL: "http://localhost:3000", secret: "oauth-test-secret-with-more-than-32-bytes",
      database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
      rateLimit: { enabled: false },
      socialProviders: { google: { clientId: "test-client", clientSecret: "test-secret" } },
    });
    const response = await oauthAuth.handler(new Request("http://localhost:3000/api/auth/callback/google?code=fake&state=not-issued"));
    expect(response.status).not.toBe(200);
    expect(response.headers.get("set-cookie") ?? "").not.toContain("session_token=");
  });

  it("applies a persistent request limit to registration", async () => {
    const limitedAuth = betterAuth({
      appName: "Nova limiter test", baseURL: "http://localhost:3000", secret: "limiter-test-secret-with-more-than-32-bytes",
      database: memoryAdapter({ user: [], session: [], account: [], verification: [], rateLimit: [] }),
      rateLimit: { enabled: true, storage: "database", window: 60, max: 20, customRules: { "/sign-up/email": { window: 60, max: 2 } } },
      emailAndPassword: { enabled: true, autoSignIn: false, minPasswordLength: 12 },
    });
    const signUp = (n: number) => limitedAuth.handler(new Request("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST", headers: { "content-type": "application/json", origin: "http://localhost:3000", "x-forwarded-for": "198.51.100.8" },
      body: JSON.stringify({ name: `Client ${n}`, email: `limited-${n}@example.test`, password: "a-long-test-password-123" }),
    }));
    expect((await signUp(1)).status).toBeLessThan(400);
    expect((await signUp(2)).status).toBeLessThan(400);
    expect((await signUp(3)).status).toBe(429);
  });
});
