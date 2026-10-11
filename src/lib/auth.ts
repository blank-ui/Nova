import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, twoFactor } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendAuthEmail } from "@/lib/auth-email";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const secret = process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : randomBytes(32).toString("base64url"));
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const discordConfigured = Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);

export const auth = betterAuth({
  appName: "Nova",
  baseURL: appUrl,
  secret,
  trustedOrigins: [appUrl],
  database: prismaAdapter(prisma, { provider: "mysql" }),
  rateLimit: { enabled: true, storage: "database", window: 60, max: 60, modelName: "AuthRateLimit" },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
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
    sendResetPassword: async ({ user, url }) => sendAuthEmail({ to: user.email, subject: "Reset your Nova password", url }),
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => sendAuthEmail({ to: user.email, subject: "Verify your Nova email", url }),
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
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      },
    } : {}),
  },
  user: {
    modelName: "User",
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
    accountLinking: { enabled: true, disableImplicitLinking: true, allowDifferentEmails: false },
  },
  verification: { modelName: "AuthVerification" },
  plugins: [
    admin({ defaultRole: "CLIENT", adminRoles: ["ADMIN"] }),
    twoFactor({ issuer: process.env.ADMIN_MFA_ISSUER ?? "Nova", skipVerificationOnEnable: false, accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 900 }, schema: { twoFactor: { modelName: "AuthTwoFactor" } } }),
  ],
});

export const googleSignInAvailable = googleConfigured;
export const discordSignInAvailable = discordConfigured;
