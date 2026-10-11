import { PublicPage } from "@/components/public-page";
import { AuthForm } from "@/components/auth-form";
import { googleSignInAvailable, discordSignInAvailable } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackURL?: string }> }) {
  const { callbackURL } = await searchParams;
  return <PublicPage eyebrow="Nova space · Secure access" title="Your space, in view." subtitle="A calm place to follow progress, manage inquiries, and keep projects together."><AuthForm mode="login" googleAvailable={googleSignInAvailable} discordAvailable={discordSignInAvailable} callbackURL={callbackURL}/></PublicPage>;
}
