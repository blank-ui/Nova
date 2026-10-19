import { PublicPage } from "@/components/public-page";
import { AuthForm } from "@/components/auth-form";
import { googleSignInAvailable, discordSignInAvailable } from "@/lib/auth";
import { T } from "@/components/language-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Nova client space to track project milestones, messages, and invoices.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackURL?: string }> }) {
  const { callbackURL } = await searchParams;
  return (
    <PublicPage
      eyebrow={<T k="login.eyebrow" fallback="Nova space · Secure access" />}
      title={<T k="login.title" fallback="Your space, in view." />}
      subtitle={<T k="login.subtitle" fallback="A calm place to follow progress, manage inquiries, and keep projects together." />}
    >
      <AuthForm
        mode="login"
        googleAvailable={googleSignInAvailable}
        discordAvailable={discordSignInAvailable}
        callbackURL={callbackURL}
      />
    </PublicPage>
  );
}
