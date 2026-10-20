export function safeInternalPath(value: unknown, fallback = "/portal") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://nova.invalid");
    if (url.origin !== "https://nova.invalid") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}

export function getAppBaseUrl(request?: Request): string {
  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = request.headers.get("host");
    const resolvedHost = forwardedHost || host;
    const isLocal =
      resolvedHost?.includes("localhost") ||
      resolvedHost?.includes("127.0.0.1") ||
      resolvedHost?.startsWith("192.168.") ||
      resolvedHost?.startsWith("10.");

    // Remote hosts in production must strictly use HTTPS so browsers send Secure session cookies
    const proto = isLocal ? "http" : "https";

    if (
      resolvedHost &&
      !resolvedHost.includes("0.0.0.0") &&
      (process.env.NODE_ENV === "production" ? !isLocal : true)
    ) {
      return `${proto}://${resolvedHost}`;
    }
  }

  const raw = process.env.APP_URL || process.env.BETTER_AUTH_URL;
  if (
    raw &&
    !raw.includes("0.0.0.0") &&
    (process.env.NODE_ENV === "production" ? !raw.includes("localhost") && !raw.includes("127.0.0.1") : true)
  ) {
    let clean = raw.replace(/\/+$/, "");
    if (!clean.includes("localhost") && !clean.includes("127.0.0.1") && clean.startsWith("http://")) {
      clean = clean.replace("http://", "https://");
    }
    return clean;
  }

  return process.env.NODE_ENV === "production" ? "https://nova.allskyfares.com" : "http://localhost:3000";
}
