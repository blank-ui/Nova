import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireClient() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?callbackURL=%2Fportal");
  return session;
}

export async function requireAdmin(options?: { allowMfaSetup?: boolean }) {
  void options;
  const session = await getCurrentSession();
  if (!session) redirect("/login?callbackURL=%2Fadmin");
  if (session.user.role !== "ADMIN") redirect("/portal");
  return session;
}

export async function requireDeveloper() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?callbackURL=%2Fdeveloper");
  if (session.user.role !== "DEVELOPER" && session.user.role !== "ADMIN") redirect("/portal");
  return session;
}

export async function requireFinance() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?callbackURL=%2Ffinance");
  if (session.user.role !== "FINANCE" && session.user.role !== "ADMIN") redirect("/portal");
  return session;
}

export async function requireStaff() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?callbackURL=%2Fportal");
  const staffRoles = ["ADMIN", "DEVELOPER", "FINANCE"];
  const userRole = session.user.role ?? "";
  if (!staffRoles.includes(userRole)) redirect("/portal");
  return session;
}
