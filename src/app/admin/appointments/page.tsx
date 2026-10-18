import { requireStaff } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { AppointmentsManager } from "@/components/appointments-manager";

export default async function AdminAppointmentsPage() {
  const session = await requireStaff();

  const [appointments, clients] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { date: "asc" },
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "CLIENT" },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const serialized = appointments.map((a) => ({
    ...a,
    date: a.date.toISOString(),
  }));

  return (
    <div style={{ width: "100%" }}>
      <AppointmentsManager
        initialAppointments={serialized}
        currentUserId={session.user.id}
        currentUserRole={session.user.role ?? "ADMIN"}
        clientsList={clients}
      />
    </div>
  );
}
