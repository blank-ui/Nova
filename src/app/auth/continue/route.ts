import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeInternalPath } from "@/lib/safe-redirect";

export const dynamic = "force-dynamic";

function getBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";

  const resolvedHost = forwardedHost || host;
  if (
    resolvedHost &&
    !resolvedHost.includes("0.0.0.0") &&
    !resolvedHost.includes("127.0.0.1") &&
    !resolvedHost.includes("localhost:3000")
  ) {
    return `${proto}://${resolvedHost}`;
  }

  const configured = process.env.APP_URL || process.env.BETTER_AUTH_URL;
  if (configured && !configured.includes("0.0.0.0") && !configured.includes("127.0.0.1")) {
    return configured;
  }

  return "https://nova.allskyfares.com";
}

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);
  const url = new URL(request.url);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/login?error=signin", baseUrl));
  }

  const requested = safeInternalPath(url.searchParams.get("next"), "/portal");

  if (session.user.role === "ADMIN") {
    const adminTarget =
      requested.startsWith("/admin") && !requested.includes("setup=required") ? requested : "/admin";
    return NextResponse.redirect(new URL(adminTarget, baseUrl));
  }

  if (session.user.role === "DEVELOPER") {
    const devTarget = requested.startsWith("/developer") ? requested : "/developer";
    return NextResponse.redirect(new URL(devTarget, baseUrl));
  }

  if (session.user.role === "FINANCE") {
    const finTarget = requested.startsWith("/finance") ? requested : "/finance";
    return NextResponse.redirect(new URL(finTarget, baseUrl));
  }

  return NextResponse.redirect(new URL(requested.startsWith("/admin") ? "/portal" : requested, baseUrl));
}
