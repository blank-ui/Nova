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
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const resolvedHost = forwardedHost || host;
    if (
      resolvedHost &&
      !resolvedHost.includes("0.0.0.0") &&
      !resolvedHost.includes("127.0.0.1") &&
      (process.env.NODE_ENV === "production" ? !resolvedHost.includes("localhost") : true)
    ) {
      return `${proto}://${resolvedHost}`;
    }
  }

  const raw = process.env.APP_URL || process.env.BETTER_AUTH_URL;
  if (
    raw &&
    !raw.includes("0.0.0.0") &&
    !raw.includes("127.0.0.1") &&
    (process.env.NODE_ENV === "production" ? !raw.includes("localhost") : true)
  ) {
    return raw.replace(/\/+$/, "");
  }

  return process.env.NODE_ENV === "production" ? "https://nova.allskyfares.com" : "http://localhost:3000";
}

