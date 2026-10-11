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
