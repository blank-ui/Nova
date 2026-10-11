export function safeInternalPath(value: unknown, fallback = "/portal") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://nova.invalid");
    if (url.origin !== "https://nova.invalid") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}
