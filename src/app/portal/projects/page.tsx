import { requireClient } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { ClientProfileCRM } from "@/components/client-profile-crm";

export default async function PortalProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ clientId?: string }>;
}) {
  const session = await requireClient();
  const isUserAdmin = session.user.role === "ADMIN";
  const resolvedParams = searchParams ? await searchParams : {};
  const targetId = isUserAdmin && resolvedParams.clientId ? resolvedParams.clientId : session.user.id;

  let clientUser = await prisma.user.findUnique({
    where: { id: targetId },
    include: {
      projects: {
        include: {
          milestones: true,
          tasks: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  // If admin is viewing and no specific client was given, fallback to first CLIENT user or current session user
  if (!clientUser && isUserAdmin) {
    clientUser = await prisma.user.findFirst({
      where: { role: "CLIENT" },
      include: {
        projects: {
          include: {
            milestones: true,
            tasks: true,
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
  }

  if (!clientUser) {
    clientUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        projects: {
          include: {
            milestones: true,
            tasks: true,
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
  }

  if (!clientUser) {
    return (
      <main className="shell" style={{ padding: "40px 0" }}>
        <p>No workspace record found.</p>
      </main>
    );
  }

  // Fetch all inquiries associated with this client's email or name
  const inquiries = await prisma.inquiry.findMany({
    where: {
      OR: [
        { email: clientUser.email },
        ...(clientUser.name ? [{ name: { contains: clientUser.name } }] : []),
        ...(isUserAdmin ? [{}] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const serializedUser = {
    ...clientUser,
    createdAt: clientUser.createdAt.toISOString(),
    projects: clientUser.projects.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      milestones: p.milestones.map((m) => ({
        ...m,
        dueAt: m.dueAt ? m.dueAt.toISOString() : null,
        completedAt: m.completedAt ? m.completedAt.toISOString() : null,
      })),
      tasks: p.tasks.map((t) => ({
        ...t,
        dueAt: t.dueAt ? t.dueAt.toISOString() : null,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      })),
    })),
  };

  const serializedInquiries = inquiries.map((inq) => ({
    ...inq,
    createdAt: inq.createdAt.toISOString(),
  }));

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      <ClientProfileCRM
        user={serializedUser}
        inquiries={serializedInquiries}
        currentAdminId={session.user.id}
        backUrl="/portal"
        pageTitle="Customer Information"
      />
    </div>
  );
}
