import { requireFinance } from "@/lib/auth-guards";
import { FinanceNav } from "@/components/finance-nav";
import { Footer } from "@/components/footer";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  const session = await requireFinance();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <FinanceNav
        userName={session.user.name || "Finance"}
        userEmail={session.user.email || ""}
        userRole={session.user.role || "FINANCE"}
      />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  );
}
