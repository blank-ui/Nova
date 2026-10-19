import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/inquiry",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">theme</button>,
}));

vi.mock("@/components/logout-button", () => ({
  LogoutButton: () => <button type="button">logout</button>,
}));

import { TopBar } from "./TopBar";

const admin = { id: "admin-1", email: "admin@nova.test", name: "Admin", role: "ADMIN" };
const client = { id: "client-1", email: "client@nova.test", name: "Client", role: "CLIENT" };

function renderPopover(user = admin) {
  return renderToStaticMarkup(<TopBar user={user} defaultNotificationsOpen />);
}

describe("TopBar notifications popover", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the bell trigger for admins", () => {
    const html = renderToStaticMarkup(<TopBar user={admin} />);
    expect(html).toContain('aria-label="View notifications"');
  });

  it("does not render the popover until it is opened", () => {
    const html = renderToStaticMarkup(<TopBar user={admin} />);
    expect(html).not.toContain("Clear read");
  });

  it("shows the empty state with no notifications", () => {
    const html = renderPopover();
    expect(html).toContain("Notifications");
    expect(html).toContain("All caught up!");
    expect(html).not.toContain("Clear read");
  });

  it("links to the CRM for admins and the projects tracker for clients", () => {
    expect(renderPopover(admin)).toContain('href="/admin/inquiry"');
    expect(renderPopover(client)).toContain('href="/portal/projects"');
  });

  it("hides the appointments shortcut for clients", () => {
    const footer = (html: string) => html.slice(html.indexOf("notification-popover-footer"));
    expect(footer(renderPopover(admin))).toContain('href="/admin/appointments"');
    expect(footer(renderPopover(client))).not.toContain('href="/admin/appointments"');
  });

  it("renders footer links without leaking raw HTML entities", () => {
    const html = renderPopover();
    expect(html).not.toContain("&amp;rarr;");
    expect(html).toContain("View Inquiries CRM");
  });
});
