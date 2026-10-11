import { z } from "zod";

/**
 * CUID format regex: starts with 'c' followed by 24 alphanumeric characters.
 */
export const CUID_REGEX = /^c[0-9a-z]{24}$/;

/**
 * Message creation input validation schema.
 * - body: must be a trimmed string between 1 and 4,000 characters.
 * - empty or whitespace-only messages are strictly rejected.
 */
export const messageInputSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(4000, { message: "Message must not exceed 4,000 characters" }),
});

export type MessageInput = z.infer<typeof messageInputSchema>;

/**
 * Pagination query parameters validation schema.
 */
export const messagePaginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 20;
      const parsed = Number(val);
      if (Number.isNaN(parsed)) return 20;
      return Math.min(Math.max(parsed, 1), 100);
    }),
  cursor: z
    .string()
    .optional()
    .refine((val) => !val || CUID_REGEX.test(val), {
      message: "Invalid cursor format",
    }),
});

export interface MessageAuthor {
  id: string;
  name: string;
  role: string;
}

export interface EnrichedMessage {
  id: string;
  projectId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: MessageAuthor;
}

export interface MessagesResponse {
  data: EnrichedMessage[];
  nextCursor: string | null;
}
