import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import crypto from "node:crypto";
import { GET, POST } from "./route";

describe("/api/discord/interactions endpoint", () => {
  const originalEnv = process.env.DISCORD_PUBLIC_KEY;
  let keyPair: { publicKey: crypto.KeyObject; privateKey: crypto.KeyObject };
  let rawPubHex: string;

  beforeEach(() => {
    keyPair = crypto.generateKeyPairSync("ed25519");
    const derPub = keyPair.publicKey.export({ format: "der", type: "spki" });
    rawPubHex = derPub.subarray(12).toString("hex");
    process.env.DISCORD_PUBLIC_KEY = rawPubHex;
  });

  afterEach(() => {
    process.env.DISCORD_PUBLIC_KEY = originalEnv;
  });

  function signPayload(body: string, timestamp: string) {
    return crypto
      .sign(null, Buffer.from(timestamp + body, "utf8"), keyPair.privateKey)
      .toString("hex");
  }

  it("GET returns endpoint information", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.service).toBe("Nova Discord Interactions Endpoint");
  });

  it("POST returns 401 when signature is invalid", async () => {
    const body = JSON.stringify({ type: 1 });
    const req = new Request("http://localhost/api/discord/interactions", {
      method: "POST",
      headers: {
        "x-signature-ed25519": "00".repeat(64),
        "x-signature-timestamp": Date.now().toString(),
      },
      body,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("POST responds to Discord PING (type 1) with PONG (type 1)", async () => {
    const body = JSON.stringify({ type: 1 });
    const timestamp = Date.now().toString();
    const signature = signPayload(body, timestamp);

    const req = new Request("http://localhost/api/discord/interactions", {
      method: "POST",
      headers: {
        "x-signature-ed25519": signature,
        "x-signature-timestamp": timestamp,
      },
      body,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe(1); // PONG
  });

  it("POST responds to /ping command with message", async () => {
    const body = JSON.stringify({
      type: 2,
      data: { name: "ping" },
    });
    const timestamp = Date.now().toString();
    const signature = signPayload(body, timestamp);

    const req = new Request("http://localhost/api/discord/interactions", {
      method: "POST",
      headers: {
        "x-signature-ed25519": signature,
        "x-signature-timestamp": timestamp,
      },
      body,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe(4);
    expect(data.data.content).toContain("Pong!");
  });

  it("POST responds to /help command with Nova links", async () => {
    const body = JSON.stringify({
      type: 2,
      data: { name: "help" },
      member: { user: { username: "Tester" } },
    });
    const timestamp = Date.now().toString();
    const signature = signPayload(body, timestamp);

    const req = new Request("http://localhost/api/discord/interactions", {
      method: "POST",
      headers: {
        "x-signature-ed25519": signature,
        "x-signature-timestamp": timestamp,
      },
      body,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe(4);
    expect(data.data.content).toContain("Nova Studio");
    expect(data.data.content).toContain("Tester");
  });
});
