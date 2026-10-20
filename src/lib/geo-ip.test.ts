import { describe, it, expect, vi, beforeEach } from "vitest";
import { isPrivateIp, cleanIpAddress, resolveIpLocation } from "./geo-ip";

describe("Geo-IP and Location Resolver", () => {
  it("identifies private and loopback IPs correctly", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("::1")).toBe(true);
    expect(isPrivateIp("10.0.0.15")).toBe(true);
    expect(isPrivateIp("192.168.1.100")).toBe(true);
    expect(isPrivateIp("172.16.0.1")).toBe(true);
    expect(isPrivateIp("172.31.255.255")).toBe(true);
    expect(isPrivateIp("8.8.8.8")).toBe(false);
    expect(isPrivateIp("1.1.1.1")).toBe(false);
  });

  it("normalizes and cleans various IP address formats", () => {
    expect(cleanIpAddress(null)).toBe("127.0.0.1");
    expect(cleanIpAddress("::ffff:192.0.2.1")).toBe("192.0.2.1");
    // Comma-separated list takes first public IP
    expect(cleanIpAddress("127.0.0.1, 8.8.8.8, 10.0.0.1")).toBe("8.8.8.8");
    // Fallback if all are private
    expect(cleanIpAddress("127.0.0.1, 10.0.0.1")).toBe("127.0.0.1");
  });

  it("resolves private IP to local development indicator", async () => {
    const loc = await resolveIpLocation("127.0.0.1");
    expect(loc.city).toBe("Localhost");
    expect(loc.countryCode).toBe("LOC");
  });

  it("extracts geolocation from Cloudflare headers with highest priority", async () => {
    const headers = new Headers();
    headers.set("cf-ipcity", "San%20Francisco");
    headers.set("cf-ipcountry", "US");

    const loc = await resolveIpLocation("8.8.8.8", headers);
    expect(loc.city).toBe("San Francisco");
    expect(loc.country).toBe("US");
    expect(loc.countryCode).toBe("US");
  });
});
