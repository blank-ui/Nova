import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { verifyDiscordSignature, InteractionType, InteractionResponseType } from "./discord-interactions";

describe("Discord Interactions verification", () => {
  it("correctly verifies a valid Ed25519 signature", () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
    const derPub = publicKey.export({ format: "der", type: "spki" });
    const rawPubHex = derPub.subarray(12).toString("hex");

    const body = JSON.stringify({ type: InteractionType.PING });
    const timestamp = Date.now().toString();
    const signature = crypto
      .sign(null, Buffer.from(timestamp + body, "utf8"), privateKey)
      .toString("hex");

    const isValid = verifyDiscordSignature({
      body,
      signature,
      timestamp,
      publicKey: rawPubHex,
    });

    expect(isValid).toBe(true);
  });

  it("rejects an invalid signature or tampered body", () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
    const derPub = publicKey.export({ format: "der", type: "spki" });
    const rawPubHex = derPub.subarray(12).toString("hex");

    const body = JSON.stringify({ type: InteractionType.PING });
    const timestamp = Date.now().toString();
    const signature = crypto
      .sign(null, Buffer.from(timestamp + body, "utf8"), privateKey)
      .toString("hex");

    // Tampered body
    const isInvalid = verifyDiscordSignature({
      body: JSON.stringify({ type: 99 }),
      signature,
      timestamp,
      publicKey: rawPubHex,
    });

    expect(isInvalid).toBe(false);
  });

  it("handles missing or invalid format keys gracefully", () => {
    expect(
      verifyDiscordSignature({
        body: "{}",
        signature: null,
        timestamp: null,
        publicKey: undefined,
      })
    ).toBe(false);

    expect(
      verifyDiscordSignature({
        body: "{}",
        signature: "invalid-hex",
        timestamp: "12345",
        publicKey: "short",
      })
    ).toBe(false);
  });
});
