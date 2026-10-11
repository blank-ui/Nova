import { PublicPage } from "@/components/public-page";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <PublicPage eyebrow="Account recovery" title="A fresh start." subtitle="Choose a new password. The link can only be used once and expires automatically."><ResetPasswordForm token={token}/></PublicPage>;
}
