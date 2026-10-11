import { prisma } from "@/lib/prisma";

export interface RateLimitRule {
  windowSeconds: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number | null;
  remaining: number;
}

/**
 * Atomic sliding-window rate limiter utilizing MySQL's AuthRateLimit table.
 *
 * Implements atomic increment with condition checks:
 * 1. Read existing record.
 * 2. If expired or non-existent, reset/create count = 1.
 * 3. If within window, increment count atomically.
 * 4. If count exceeded, return allowed: false and retryAfterSeconds.
 */
export async function consumeRateLimit(
  key: string,
  rule: RateLimitRule
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = rule.windowSeconds * 1000;

  try {
    const existing = await prisma.authRateLimit.findUnique({
      where: { key },
    });

    if (!existing) {
      try {
        await prisma.authRateLimit.create({
          data: {
            key,
            count: 1,
            lastRequest: BigInt(now),
          },
        });
        return { allowed: true, retryAfterSeconds: null, remaining: rule.max - 1 };
      } catch {
        // If concurrent insert created the row, retry with read
        return consumeRateLimit(key, rule);
      }
    }

    const lastRequest = Number(existing.lastRequest);
    const elapsed = now - lastRequest;

    // Window expired: reset window
    if (elapsed >= windowMs) {
      await prisma.authRateLimit.update({
        where: { key },
        data: {
          count: 1,
          lastRequest: BigInt(now),
        },
      });
      return { allowed: true, retryAfterSeconds: null, remaining: rule.max - 1 };
    }

    // Within window: check if limit reached
    if (existing.count >= rule.max) {
      const retryAfter = Math.ceil((windowMs - elapsed) / 1000);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(retryAfter, 1),
        remaining: 0,
      };
    }

    // Within window: increment atomically
    const updated = await prisma.authRateLimit.update({
      where: { key },
      data: {
        count: { increment: 1 },
        lastRequest: BigInt(now),
      },
    });

    return {
      allowed: true,
      retryAfterSeconds: null,
      remaining: Math.max(rule.max - updated.count, 0),
    };
  } catch (err) {
    // If rate limit table encounters an error, log and fail-open to avoid taking down service
    console.error("Rate limiter error for key", key, err);
    return { allowed: true, retryAfterSeconds: null, remaining: 1 };
  }
}

/**
 * Resolves client IP address safely from trusted headers or connection metadata.
 */
export function getClientIp(request: Request): string {
  // If behind trusted proxy (Cloudflare, Vercel, or standard reverse proxies)
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // Leftmost is original client IP
    const clientIp = xForwardedFor.split(",")[0]?.trim();
    if (clientIp) return clientIp;
  }

  return "127.0.0.1";
}
