import { requireDeveloper } from "@/lib/auth-guards";
import { DeveloperNav } from "@/components/developer-nav";
import { Footer } from "@/components/footer";

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const session = await requireDeveloper();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <DeveloperNav
        userName={session.user.name || "Developer"}
        userEmail={session.user.email || ""}
        userRole={session.user.role || "DEVELOPER"}
      />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  );
}
