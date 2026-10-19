import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { ClientProfileCRM } from "@/components/client-profile-crm";

interface AdminUserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserProfilePage({ params }: AdminUserProfilePageProps) {
  const session = await requireAdmin();
  const { id } = await params;

  // Query user with their projects, milestones, tasks, and recent sessions
  const user = await prisma.user.findUnique({
    where: { id },
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

  if (!user) {
    notFound();
  }

  // Query inquiries associated with this client's email
  const inquiries = await prisma.inquiry.findMany({
    where: {
      email: user.email,
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component
  const serializedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    projects: user.projects.map((p) => ({
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
    <main style={{ minHeight: "100vh", background: "var(--page-bg)", padding: "24px 0 60px" }}>
      <ClientProfileCRM
        user={serializedUser}
        inquiries={serializedInquiries}
        currentAdminId={session.user.id}
      />
    </main>
  );
}
