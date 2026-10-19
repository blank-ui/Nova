import { PublicPage } from "@/components/public-page";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; mode?: string }>;
}) {
  const { token = "", mode = "" } = await searchParams;
  const isSetup = mode === "setup";

  return (
    <PublicPage
      eyebrow={isSetup ? "Profile & Account Setup" : "Account Recovery"}
      title={isSetup ? "Create your profile." : "A fresh start."}
      subtitle={
        isSetup
          ? "Complete your profile details and set a secure password to activate your workspace."
          : "Choose a new password. The link can only be used once and expires automatically."
      }
    >
      <ResetPasswordForm token={token} mode={mode} />
    </PublicPage>
  );
}
