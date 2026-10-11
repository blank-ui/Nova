import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { AdminUsersManager } from "@/components/admin-users-manager";

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      twoFactorEnabled: true,
      banned: true,
      banReason: true,
      discordHandle: true,
      createdAt: true,
      _count: {
        select: {
          projects: true,
          authSessions: true,
        },
      },
    },
  });

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <main className="shell" style={{ padding: "40px 0 80px" }}>
      <AdminUsersManager
        initialUsers={serializedUsers}
        currentAdminId={session.user.id}
      />
    </main>
  );
}
