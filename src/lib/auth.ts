import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, twoFactor } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendAuthEmail } from "@/lib/auth-email";
import { recordUserLogin } from "@/lib/geo-ip";

const defaultAppUrl = "https://nova.allskyfares.com";
const rawAppUrl = process.env.APP_URL || process.env.BETTER_AUTH_URL;
const appUrl =
  rawAppUrl &&
  !rawAppUrl.includes("0.0.0.0") &&
  (process.env.NODE_ENV === "production" ? !rawAppUrl.includes("localhost") && !rawAppUrl.includes("127.0.0.1") : true)
    ? rawAppUrl
    : process.env.NODE_ENV === "production"
      ? defaultAppUrl
      : "http://localhost:3000";

const isProd = process.env.NODE_ENV === "production";
const secret = process.env.AUTH_SECRET || (!isProd ? "rljd-lQGEUNMH93ERQ9mJz9uWd0y9HWUsBgsfeRUuMs" : "");

if (isProd && !secret) {
  throw new Error("FATAL: AUTH_SECRET must be configured in production environment.");
}

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const discordClientId = process.env.DISCORD_CLIENT_ID || (!isProd ? "1558773921686360155" : "");
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET || (!isProd ? "ciSouW4gzTfBHTZSxRWKJPU4pKlfnrz1" : "");
const discordConfigured = Boolean(discordClientId && discordClientSecret);

export const auth = betterAuth({
  appName: "Nova",
  baseURL: appUrl,
  secret,
  trustedOrigins: Array.from(new Set([defaultAppUrl, appUrl, "http://localhost:3000", "http://127.0.0.1:3000"])),
  database: prismaAdapter(prisma, { provider: "mysql" }),
  rateLimit: { enabled: true, storage: "database", window: 60, max: 60, modelName: "AuthRateLimit" },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"],
      trustedProxies: ["127.0.0.1", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "CLIENT",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendAuthEmail({ to: user.email, subject: "Reset your Nova password", url });
      } catch (err) {
        console.error("Password reset email delivery failed:", err);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendAuthEmail({ to: user.email, subject: "Verify your Nova email", url });
      } catch (err) {
        console.error("Verification email delivery failed:", err);
      }
    },
  },
  socialProviders: {
    ...(googleConfigured ? {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        prompt: "select_account",
      },
    } : {}),
    ...(discordConfigured ? {
      discord: {
        clientId: discordClientId,
        clientSecret: discordClientSecret,
        mapProfileToUser: async (profile: Record<string, unknown>) => {
          const rawId =
            typeof profile.id === "string"
              ? profile.id.trim()
              : typeof profile.id === "number" || typeof profile.id === "bigint"
                ? String(profile.id).trim()
                : null;
          const rawUsername = typeof profile.username === "string" ? profile.username.trim() : null;
          const cleanUsername = rawUsername ? rawUsername.replace(/^@+/, "").toLowerCase() : null;
          const rawEmail = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : null;

          // Find existing user by discordId, discordHandle, or email
          let matchingUser = null;
          if (rawId) {
            matchingUser = await prisma.user.findFirst({
              where: { discordId: rawId },
            });
          }

          if (!matchingUser && cleanUsername) {
            const allUsersWithHandle = await prisma.user.findMany({
              where: { discordHandle: { not: null } },
            });
            matchingUser =
              allUsersWithHandle.find(
                (u) => u.discordHandle?.trim().replace(/^@+/, "").toLowerCase() === cleanUsername
              ) ?? null;
          }

          if (!matchingUser && rawEmail) {
            matchingUser = await prisma.user.findUnique({
              where: { email: rawEmail },
            });
          }

          if (matchingUser) {
            // Backfill discordId and discordHandle
            const updateData: { discordId?: string; discordHandle?: string } = {};
            if (rawId && matchingUser.discordId !== rawId) {
              updateData.discordId = rawId;
            }
            if (rawUsername && matchingUser.discordHandle !== rawUsername) {
              updateData.discordHandle = rawUsername;
            }
            if (Object.keys(updateData).length > 0) {
              await prisma.user.update({
                where: { id: matchingUser.id },
                data: updateData,
              });
            }

            // Proactively upsert AuthAccount record so Better Auth recognizes the user
            if (rawId) {
              const existingAccount = await prisma.authAccount.findUnique({
                where: {
                  providerId_accountId: {
                    providerId: "discord",
                    accountId: rawId,
                  },
                },
              });
              if (!existingAccount) {
                await prisma.authAccount.create({
                  data: {
                    providerId: "discord",
                    accountId: rawId,
                    userId: matchingUser.id,
                  },
                });
              } else if (existingAccount.userId !== matchingUser.id) {
                await prisma.authAccount.update({
                  where: { id: existingAccount.id },
                  data: { userId: matchingUser.id },
                });
              }
            }

            return {
              email: matchingUser.email,
              name: matchingUser.name || (profile.global_name as string) || (profile.username as string) || undefined,
              emailVerified: true,
            };
          }

          return {};
        },
      },
    } : {}),
  },
  user: {
    modelName: "User",
    additionalFields: {
      dateOfBirth: {
        type: "string",
        required: false,
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ newEmail, url }) => {
        await sendAuthEmail({
          to: newEmail,
          subject: "Verify your new Nova email address",
          url,
        });
      },
    },
    validateUserInfo: async ({ source }) => {
      if (source.method === "oauth" && source.oauth?.providerId === "google" && source.oauth.profile?.email_verified !== true) {
        return { error: "google_email_not_verified", errorDescription: "Google must confirm ownership of the email address." };
      }
      return undefined;
    },
  },
  session: { modelName: "AuthSession", expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  account: {
    modelName: "AuthAccount",
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "discord"],
      allowDifferentEmails: true,
    },
  },
  verification: { modelName: "AuthVerification" },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          const rawDob = (context?.body as Record<string, unknown> | undefined)?.dateOfBirth;
          if (rawDob && typeof rawDob === "string") {
            const parsed = new Date(rawDob.trim());
            const now = new Date();
            const minAgeDate = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
            if (isNaN(parsed.getTime()) || parsed > minAgeDate) {
              throw new Error("You must be at least 13 years of age to create an account.");
            }
          }
          return { data: user };
        },
        after: async (user, context) => {
          const rawDob = (context?.body as Record<string, unknown> | undefined)?.dateOfBirth;
          if (rawDob && typeof rawDob === "string" && user?.id) {
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: { dateOfBirth: rawDob.trim() },
              });
            } catch (err) {
              console.error("Failed to sync dateOfBirth on user creation:", err);
            }
          }
        },
      },
    },
    session: {
      create: {
        after: async (session, context) => {
          if (session?.userId) {
            try {
              const reqHeaders = (context as any)?.headers;
              const ip =
                session.ipAddress ||
                reqHeaders?.get?.("cf-connecting-ip") ||
                reqHeaders?.get?.("x-forwarded-for") ||
                reqHeaders?.get?.("x-real-ip");
              const userAgent = session.userAgent || reqHeaders?.get?.("user-agent");
              await recordUserLogin({
                userId: session.userId,
                ipAddress: ip,
                userAgent,
                headers: reqHeaders,
              });
            } catch (err) {
              console.error("[Auth Hook] Failed to record login history:", err);
            }
          }
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === "discord" && account.userId && account.accountId) {
            try {
              const existingUser = await prisma.user.findUnique({ where: { id: account.userId } });
              if (existingUser && !existingUser.discordId) {
                await prisma.user.update({
                  where: { id: account.userId },
                  data: {
                    discordId: account.accountId,
                  },
                });
              }
            } catch (err) {
              console.error("Failed to sync discordId on account creation:", err);
            }
          }
        },
      },
    },
  },
  onAPIError: {
    errorURL: `${appUrl}/admin/security`,
  },
  plugins: [
    admin({ defaultRole: "CLIENT", adminRoles: ["ADMIN"] }),
    twoFactor({ issuer: process.env.ADMIN_MFA_ISSUER ?? "Nova", skipVerificationOnEnable: false, accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 900 }, schema: { twoFactor: { modelName: "AuthTwoFactor" } } }),
  ],
});

export const googleSignInAvailable = googleConfigured;
export const discordSignInAvailable = discordConfigured;
