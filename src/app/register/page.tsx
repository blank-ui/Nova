import { PublicPage } from "@/components/public-page";
import { AuthForm } from "@/components/auth-form";
import { googleSignInAvailable, discordSignInAvailable } from "@/lib/auth";
import { T } from "@/components/language-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Client Account",
  description: "Create a client account on Nova to keep your project conversations and milestones together.",
};

export default function RegisterPage() {
  return (
    <PublicPage
      eyebrow={<T k="register.eyebrow" fallback="Client account" />}
      title={<T k="register.title" fallback="A workspace for good work." />}
      subtitle={<T k="register.subtitle" fallback="Create a client account to keep your project conversations and updates together." />}
    >
      <AuthForm
        mode="register"
        googleAvailable={googleSignInAvailable}
        discordAvailable={discordSignInAvailable}
        callbackURL="/portal"
      />
    </PublicPage>
  );
}
