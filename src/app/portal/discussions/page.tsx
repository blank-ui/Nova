import { requireClient } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  TeamDiscussionsManager,
  TeamMember,
  ProjectItem,
} from "@/components/team-discussions-manager";

export default async function PortalDiscussionsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    recipientId?: string;
    channel?: string;
    projectId?: string;
    mode?: "project" | "channel" | "direct";
  }>;
}) {
  const session = await requireClient();
  const resolvedParams = searchParams ? await searchParams : {};
  const isInternal =
    session.user.role === "ADMIN" ||
    session.user.role === "DEVELOPER" ||
    session.user.role === "FINANCE";

  // Fetch projects: internal staff sees all studio projects; clients see only their owned projects
  const [projectsRaw, teamMembers]: [any[], TeamMember[]] = await Promise.all([
    prisma.project.findMany({
      where: isInternal ? {} : { clientId: session.user.id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        paymentStatus: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "DEVELOPER", "FINANCE"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const projects: ProjectItem[] = projectsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    paymentStatus: p.paymentStatus,
    client: p.client,
    _count: p._count,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
  }));

  const initialMode: "project" | "channel" | "direct" =
    resolvedParams.mode ||
    (resolvedParams.projectId
      ? "project"
      : resolvedParams.recipientId
      ? "direct"
      : resolvedParams.channel
      ? "channel"
      : isInternal
      ? "project"
      : "project");

  return (
    <TeamDiscussionsManager
      currentUserId={session.user.id}
      currentUserRole={session.user.role ?? (isInternal ? "DEVELOPER" : "CLIENT")}
      teamMembers={teamMembers}
      projects={projects}
      initialProjectId={resolvedParams.projectId}
      initialRecipientId={resolvedParams.recipientId}
      initialChannel={resolvedParams.channel}
      initialMode={initialMode}
    />
  );
}
