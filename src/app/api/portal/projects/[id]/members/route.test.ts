import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "./route";

vi.mock("@/lib/auth-guards", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/project-access", () => ({
  getAuthorizedProject: vi.fn(),
}));

vi.mock("@/lib/studio-channels", () => ({
  getProjectMembers: vi.fn(),
  addProjectMember: vi.fn(),
  removeProjectMember: vi.fn(),
}));

import { getCurrentSession } from "@/lib/auth-guards";
import { getAuthorizedProject } from "@/lib/project-access";
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from "@/lib/studio-channels";

describe("Project Members API (/api/portal/projects/[id]/members)", () => {
  const routeParams = { params: Promise.resolve({ id: "proj-1" }) };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null as any);
    const req = new Request("http://localhost/api/portal/projects/proj-1/members");
    const res = await GET(req, routeParams);
    expect(res.status).toBe(401);
  });

  it("returns 404 when project not authorized", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "u-1" } } as any);
    vi.mocked(getAuthorizedProject).mockResolvedValue(null as any);

    const req = new Request("http://localhost/api/portal/projects/proj-1/members");
    const res = await GET(req, routeParams);
    expect(res.status).toBe(404);
  });

  it("returns members for authorized project", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "u-1" } } as any);
    vi.mocked(getAuthorizedProject).mockResolvedValue({ id: "proj-1" } as any);
    vi.mocked(getProjectMembers).mockResolvedValue({
      client: { id: "c-1", name: "Client Inc" },
      members: [
        {
          id: "pm-1",
          userId: "u-dev",
          role: "COLLABORATOR",
          user: { id: "u-dev", name: "Dev One", email: "dev@test.com", role: "DEVELOPER" },
        },
      ],
    } as any);

    const req = new Request("http://localhost/api/portal/projects/proj-1/members");
    const res = await GET(req, routeParams);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.client.name).toBe("Client Inc");
    expect(data.members).toHaveLength(1);
  });

  it("adds collaborator to project", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "u-1" } } as any);
    vi.mocked(getAuthorizedProject).mockResolvedValue({ id: "proj-1" } as any);
    vi.mocked(addProjectMember).mockResolvedValue(true);
    vi.mocked(getProjectMembers).mockResolvedValue({
      client: { id: "c-1", name: "Client Inc" },
      members: [{ id: "pm-1", userId: "u-dev", role: "COLLABORATOR", user: {} as any }],
    } as any);

    const req = new Request("http://localhost/api/portal/projects/proj-1/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "u-dev", role: "COLLABORATOR" }),
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.members).toHaveLength(1);
  });

  it("removes collaborator from project", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "u-1" } } as any);
    vi.mocked(getAuthorizedProject).mockResolvedValue({ id: "proj-1" } as any);
    vi.mocked(removeProjectMember).mockResolvedValue(true);
    vi.mocked(getProjectMembers).mockResolvedValue({
      client: { id: "c-1", name: "Client Inc" },
      members: [],
    } as any);

    const req = new Request("http://localhost/api/portal/projects/proj-1/members?userId=u-dev", {
      method: "DELETE",
    });

    const res = await DELETE(req, routeParams);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.members).toHaveLength(0);
  });
});
