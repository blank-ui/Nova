import { describe, expect, it, vi, beforeEach } from "vitest";
import { requireAdmin, requireClient, getCurrentSession } from "./auth-guards";
import { auth } from "@/lib/auth";

// Note: These unit tests use mocked Next.js navigation and Better Auth APIs
// to verify server-side auth guard and MFA redirect enforcement in isolation.

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe("Authentication Guards and MFA Enforcement (Mocked Unit Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAdmin", () => {
    it("redirects unauthenticated requests to login with admin callback", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login?callbackURL=%2Fadmin");
      expect(redirectMock).toHaveBeenCalledWith("/login?callbackURL=%2Fadmin");
    });

    it("redirects revoked or expired sessions to login", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login?callbackURL=%2Fadmin");
    });

    it("redirects non-admin (CLIENT) users to portal", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: "u-client", role: "CLIENT", twoFactorEnabled: false },
        session: { id: "s-1" },
      } as unknown as Awaited<ReturnType<typeof auth.api.getSession>>);

      await expect(requireAdmin()).rejects.toThrow("REDIRECT:/portal");
      expect(redirectMock).toHaveBeenCalledWith("/portal");
    });

    it("allows admin accounts without MFA", async () => {
      const mockSession = {
        user: { id: "u-admin", role: "ADMIN", twoFactorEnabled: false },
        session: { id: "s-2" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof auth.api.getSession>>);

      const result = await requireAdmin();
      expect(result).toEqual(mockSession);
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it("allows admin sessions with completed/verified MFA", async () => {
      const mockSession = {
        user: { id: "u-admin", role: "ADMIN", twoFactorEnabled: true },
        session: { id: "s-3" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof auth.api.getSession>>);

      const result = await requireAdmin();
      expect(result).toEqual(mockSession);
      expect(redirectMock).not.toHaveBeenCalled();
    });
  });

  describe("requireClient", () => {
    it("redirects unauthenticated requests to login with portal callback", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(requireClient()).rejects.toThrow("REDIRECT:/login?callbackURL=%2Fportal");
      expect(redirectMock).toHaveBeenCalledWith("/login?callbackURL=%2Fportal");
    });

    it("allows authenticated client users", async () => {
      const mockSession = {
        user: { id: "u-client", role: "CLIENT", twoFactorEnabled: false },
        session: { id: "s-4" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof auth.api.getSession>>);

      const result = await requireClient();
      expect(result).toEqual(mockSession);
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it("allows admin users to view the client portal", async () => {
      const mockSession = {
        user: { id: "u-admin", role: "ADMIN", twoFactorEnabled: true },
        session: { id: "s-6" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof auth.api.getSession>>);

      const result = await requireClient();
      expect(result).toEqual(mockSession);
      expect(redirectMock).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentSession", () => {
    it("delegates to Better Auth API with request headers", async () => {
      const mockSession = { user: { id: "u-1" }, session: { id: "s-1" } };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof auth.api.getSession>>);

      const result = await getCurrentSession();
      expect(result).toEqual(mockSession);
      expect(auth.api.getSession).toHaveBeenCalled();
    });
  });
});
