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
      eyebrow={isSetup ? "Account activation" : "Account recovery"}
      title={isSetup ? "Welcome to Nova." : "A fresh start."}
      subtitle={
        isSetup
          ? "Set up your secure password to activate your account and enter your workspace."
          : "Choose a new password. The link can only be used once and expires automatically."
      }
    >
      <ResetPasswordForm token={token} mode={mode} />
    </PublicPage>
  );
}
