import { prisma } from "@/lib/prisma";

export interface GeoLocation {
  city: string;
  country: string;
  countryCode: string;
}

/**
 * Checks whether an IP address belongs to private/internal/loopback ranges
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("fc00:") || ip.startsWith("fe80:")) return true;
  return false;
}

/**
 * Clean and normalize incoming IP address string
 */
export function cleanIpAddress(rawIp: string | null | undefined): string {
  if (!rawIp) return "127.0.0.1";
  let ip = rawIp.trim();
  // If comma separated list (e.g. from x-forwarded-for), take first public client IP
  if (ip.includes(",")) {
    const parts = ip.split(",").map((s) => s.trim());
    ip = parts.find((p) => !isPrivateIp(p)) || parts[0] || "127.0.0.1";
  }
  // Remove IPv6 prefix for IPv4-mapped addresses
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }
  return ip;
}

/**
 * Resolves an IP address to City, Country, and Country Code.
 * Optimized with header extraction (Cloudflare) and non-blocking timeout fallback.
 */
export async function resolveIpLocation(
  ip: string,
  requestHeaders?: Headers | Record<string, string | null | undefined>
): Promise<GeoLocation> {
  const cleanIp = cleanIpAddress(ip);

  // 1. Check if Cloudflare or CDN already provided geo headers
  if (requestHeaders) {
    const getHeader = (name: string): string | null => {
      if (typeof (requestHeaders as Headers).get === "function") {
        return (requestHeaders as Headers).get(name);
      }
      return (requestHeaders as Record<string, string | null | undefined>)[name] || null;
    };

    const cfCity = getHeader("cf-ipcity");
    const cfCountry = getHeader("cf-ipcountry");
    if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") {
      return {
        city: cfCity ? decodeURIComponent(cfCity) : "Unknown City",
        country: cfCountry,
        countryCode: cfCountry.toUpperCase(),
      };
    }
  }

  // 2. Localhost / Private network detection
  if (isPrivateIp(cleanIp)) {
    return {
      city: "Localhost",
      country: "Local / Development",
      countryCode: "LOC",
    };
  }

  // 3. External API lookup with short timeout (1.8s) so login is never delayed
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(cleanIp)}?fields=status,city,country,countryCode`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        return {
          city: data.city || "Unknown City",
          country: data.country || "Unknown Country",
          countryCode: (data.countryCode || "UN").toUpperCase(),
        };
      }
    }
  } catch (err) {
    // Timeout or network error - fallback gracefully
    console.warn("[GeoIP] Lookup failed or timed out for IP:", cleanIp, err instanceof Error ? err.message : err);
  }

  return {
    city: "Unknown City",
    country: "Unknown Location",
    countryCode: "UN",
  };
}

/**
 * Records a user sign-in event, updating the user's latest login metadata
 * and appending an immutable entry to UserLoginHistory.
 */
export async function recordUserLogin({
  userId,
  ipAddress,
  userAgent,
  headers,
}: {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  headers?: Headers | Record<string, string | null | undefined>;
}): Promise<void> {
  if (!userId) return;

  try {
    const cleanIp = cleanIpAddress(ipAddress);
    const location = await resolveIpLocation(cleanIp, headers);
    const now = new Date();

    await prisma.$transaction([
      prisma.userLoginHistory.create({
        data: {
          userId,
          ipAddress: cleanIp,
          city: location.city,
          country: location.country,
          countryCode: location.countryCode,
          userAgent: userAgent || null,
          createdAt: now,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: now,
          lastLoginIp: cleanIp,
          lastLoginCity: location.city,
          lastLoginCountry: location.country,
        },
      }),
    ]);
  } catch (error) {
    console.error("[Record User Login Error]", error);
  }
}
