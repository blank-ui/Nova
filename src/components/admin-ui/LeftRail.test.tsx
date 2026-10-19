import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

let currentPath = "/portal";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPath,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

import { LeftRail } from "./LeftRail";

describe("LeftRail Navigation", () => {
  it("renders Team Discussions navigation item for ADMIN users on admin paths", () => {
    currentPath = "/admin";
    const adminUser = { id: "admin-1", email: "admin@nova.test", name: "Admin", role: "ADMIN" };
    const html = renderToStaticMarkup(<LeftRail user={adminUser} />);
    expect(html).toContain('href="/admin/discussions"');
    expect(html).toContain('aria-label="Team Discussions"');
  });

  it("does not render Team Discussion navigation item for CLIENT users (internal only)", () => {
    currentPath = "/portal";
    const clientUser = { id: "client-1", email: "client@nova.test", name: "Client", role: "CLIENT" };
    const html = renderToStaticMarkup(<LeftRail user={clientUser} />);
    expect(html).not.toContain('href="/portal/discussions"');
    expect(html).not.toContain('aria-label="Team Discussion"');
  });

  it("renders Team Discussion navigation item for DEVELOPER users", () => {
    currentPath = "/developer";
    const devUser = { id: "dev-1", email: "dev@nova.test", name: "Developer", role: "DEVELOPER" };
    const html = renderToStaticMarkup(<LeftRail user={devUser} />);
    expect(html).toContain('href="/portal/discussions"');
    expect(html).toContain('aria-label="Team Discussion"');
  });

  it("renders Team Discussion navigation item for FINANCE users", () => {
    currentPath = "/finance";
    const finUser = { id: "fin-1", email: "fin@nova.test", name: "Finance", role: "FINANCE" };
    const html = renderToStaticMarkup(<LeftRail user={finUser} />);
    expect(html).toContain('href="/portal/discussions"');
    expect(html).toContain('aria-label="Team Discussion"');
  });
});
