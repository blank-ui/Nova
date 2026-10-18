import { requireClient } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin-ui";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireClient();

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });

  const user = {
    id: session.user.id,
    name: dbUser?.name ?? session.user.name ?? "Client",
    email: dbUser?.email ?? session.user.email,
    role: dbUser?.role ?? session.user.role ?? "CLIENT",
    image: dbUser?.image ?? session.user.image ?? null,
  };

  return <AdminShell user={user}>{children}</AdminShell>;
}
