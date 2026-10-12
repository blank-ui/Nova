import crypto from "node:crypto";

/**
 * Verifies Ed25519 signature sent by Discord for Interactions API.
 * Uses Node.js native crypto with zero external dependencies.
 */
export function verifyDiscordSignature({
  body,
  signature,
  timestamp,
  publicKey,
}: {
  body: string;
  signature: string | null;
  timestamp: string | null;
  publicKey: string | undefined;
}): boolean {
  if (!signature || !timestamp || !publicKey) return false;
  
  // Discord public keys are 32 bytes (64 hex characters)
  if (publicKey.length !== 64 || signature.length !== 128) return false;

  try {
    const key = crypto.createPublicKey({
      key: Buffer.concat([
        // Ed25519 SPKI DER prefix (12 bytes)
        Buffer.from("302a300506032b6570032100", "hex"),
        Buffer.from(publicKey, "hex"),
      ]),
      format: "der",
      type: "spki",
    });

    return crypto.verify(
      null,
      Buffer.from(timestamp + body, "utf8"),
      key,
      Buffer.from(signature, "hex")
    );
  } catch (error) {
    console.error("Discord signature verification error:", error);
    return false;
  }
}

export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
} as const;

export const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
  MODAL: 9,
} as const;
