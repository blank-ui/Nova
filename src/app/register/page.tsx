import { PublicPage } from "@/components/public-page";
import { AuthForm } from "@/components/auth-form";
import { googleSignInAvailable, discordSignInAvailable } from "@/lib/auth";

export default function RegisterPage() {
  return <PublicPage eyebrow="Client account" title="A workspace for good work." subtitle="Create a client account to keep your project conversations and updates together."><AuthForm mode="register" googleAvailable={googleSignInAvailable} discordAvailable={discordSignInAvailable} callbackURL="/portal"/><p style={{fontSize:11,color:"var(--muted)",marginTop:16,maxWidth:510,lineHeight:1.7}}>Public sign-up always creates a CLIENT account. Administrator access is provisioned separately by an authorized deployment operator.</p></PublicPage>;
}
