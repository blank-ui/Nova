import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { AdminOverview } from "@/components/admin-overview";

export default async function AdminPage() {
  const session = await requireAdmin();

  // Load metrics from database
  const [
    totalInquiries,
    newInquiries,
    qualifiedInquiries,
    totalProjects,
    totalUsers,
    totalGallery,
    recentInquiries,
    dbAdmin,
  ] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count({ where: { status: "QUALIFIED" } }),
    prisma.project.count(),
    prisma.user.count(),
    prisma.galleryItem.count(),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        twoFactorEnabled: true,
      },
    }),
  ]);

  const user = {
    id: session.user.id,
    name: dbAdmin?.name ?? session.user.name ?? "Administrator",
    email: dbAdmin?.email ?? session.user.email,
    role: dbAdmin?.role ?? session.user.role ?? "ADMIN",
    twoFactorEnabled: Boolean(dbAdmin?.twoFactorEnabled ?? session.user.twoFactorEnabled),
    image: dbAdmin?.image ?? session.user.image ?? null,
  };

  const metrics = {
    newInquiries,
    qualifiedInquiries,
    totalUsers,
    totalGallery,
    totalProjects,
    totalInquiries,
  };

  const serializedInquiries = recentInquiries.map((inq) => ({
    id: inq.id,
    name: inq.name,
    email: inq.email,
    service: inq.service,
    budget: inq.budget,
    status: inq.status,
    createdAt: inq.createdAt.toISOString(),
  }));

  return (
    <AdminOverview
      user={user}
      metrics={metrics}
      recentInquiries={serializedInquiries}
    />
  );
}
