import { requireClient } from "@/lib/auth-guards";
import { PortalNav } from "@/components/portal-nav";
import { Footer } from "@/components/footer";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireClient();

  return (
    <>
      <PortalNav userName={session.user.name} userRole={session.user.role ?? "CLIENT"} />
      <div style={{ minHeight: "calc(100vh - 76px - 260px)" }}>{children}</div>
      <Footer />
    </>
  );
}
