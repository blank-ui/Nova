import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";

/** Always scopes client reads by both the requested project and the authenticated owner. */
export async function getAuthorizedProject(projectId: string) {
  if (!projectId || !/^c[0-9a-z]{24}$/.test(projectId)) return null;
  const session = await getCurrentSession();
  if (!session) return null;
  if (canOpenAdmin(session.user.role, session.user.twoFactorEnabled ?? false)) {
    return prisma.project.findUnique({ where: { id: projectId }, include: { milestones: true, tasks: true } });
  }
  if (session.user.role !== "CLIENT") return null;
  return prisma.project.findFirst({
    where: { id: projectId, clientId: session.user.id },
    include: { milestones: true, tasks: true },
  });
}
