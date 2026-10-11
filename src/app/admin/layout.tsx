import { requireAdmin } from "@/lib/auth-guards";
import { AdminNav } from "@/components/admin-nav";
import { Footer } from "@/components/footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin({ allowMfaSetup: true });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AdminNav adminEmail={session.user.email} adminName={session.user.name} />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  );
}
