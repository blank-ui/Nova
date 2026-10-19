import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, twoFactor } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendAuthEmail } from "@/lib/auth-email";

const defaultAppUrl = "https://nova.allskyfares.com";
const rawAppUrl = process.env.APP_URL || process.env.BETTER_AUTH_URL;
const appUrl =
  rawAppUrl &&
  !rawAppUrl.includes("0.0.0.0") &&
  !rawAppUrl.includes("127.0.0.1") &&
  (process.env.NODE_ENV === "production" ? !rawAppUrl.includes("localhost") : true)
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
  trustedOrigins: Array.from(new Set([defaultAppUrl, appUrl, "http://localhost:3000"])),
  database: prismaAdapter(prisma, { provider: "mysql" }),
  rateLimit: { enabled: true, storage: "database", window: 60, max: 60, modelName: "AuthRateLimit" },
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
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === "discord" && account.userId && account.accountId) {
            try {
              await prisma.user.update({
                where: { id: account.userId },
                data: {
                  discordId: account.accountId,
                  discordHandle: "superr_nova_",
                },
              });
            } catch (err) {
              console.error("Failed to sync discordHandle on account creation:", err);
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
