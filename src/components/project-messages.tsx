"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, RefreshCw, AlertCircle, MessageSquare } from "lucide-react";
import type { EnrichedMessage } from "@/lib/messages";
import { NovaMascotAvatar } from "@/components/brand";



interface ProjectMessagesProps {
  projectId: string;
  currentUserId: string;
  initialMessages?: EnrichedMessage[];
  initialNextCursor?: string | null;
  style?: React.CSSProperties;
}

export function ProjectMessages({
  projectId,
  currentUserId,
  initialMessages = [],
  initialNextCursor = null,
  style,
}: ProjectMessagesProps) {
  const [messages, setMessages] = useState<EnrichedMessage[]>(initialMessages);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputBody, setInputBody] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/portal/projects/${projectId}/messages?limit=50`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Failed to load messages (${res.status})`);
      }
      const json = await res.json();
      setMessages(json.data || []);
      setNextCursor(json.nextCursor || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isFirstLoadRef.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      isFirstLoadRef.current = false;
    }
  }, [messages]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const res = await fetch(
        `/api/portal/projects/${projectId}/messages?limit=50&cursor=${encodeURIComponent(nextCursor)}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load older messages");
      }
      const json = await res.json();
      setMessages((prev) => [...prev, ...(json.data || [])]);
      setNextCursor(json.nextCursor || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load older messages");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputBody.trim();
    if (!trimmed || isSubmitting) return;

    if (trimmed.length > 4000) {
      setError("Message cannot exceed 4,000 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/portal/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send message");
      }

      const json = await res.json();
      if (json.message) {
        setMessages((prev) => [...prev, json.message]);
        setInputBody("");
        // Scroll to bottom on new message
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = 4000 - inputBody.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "650px",
        maxHeight: "75vh",
        background: "var(--card-bg, #ffffff)",
        borderRadius: 16,
        border: "1px solid var(--line, #e5e7eb)",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--line, #e5e7eb)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--paper, #f9fafb)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MessageSquare size={18} style={{ color: "var(--muted, #6b7280)" }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Project Discussion Thread</span>
        </div>
        <button
          onClick={() => fetchMessages()}
          title="Refresh messages"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            borderRadius: 6,
            color: "var(--muted, #6b7280)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "clamp(12px, 3vw, 24px)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {nextCursor && (
          <div style={{ textAlign: "center", margin: "8px 0" }}>
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="button button-secondary"
              style={{ fontSize: 12, padding: "6px 14px", height: "auto" }}
            >
              {isLoadingMore ? "Loading older..." : "Load Older Messages"}
            </button>
          </div>
        )}

        {isLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: 12,
              color: "var(--muted, #6b7280)",
            }}
          >
            <Loader2 className="animate-spin" size={24} />
            <span style={{ fontSize: 13 }}>Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: 12,
              color: "var(--muted, #6b7280)",
              textAlign: "center",
              padding: 24,
            }}
          >
            <NovaMascotAvatar size={54} />
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink, #101322)", marginTop: 4 }}>
              Ready when you are!
            </div>
            <p style={{ fontSize: 13, maxWidth: 360, margin: 0, lineHeight: 1.7 }}>
              Start the discussion with the Nova studio team regarding project milestones, feedback, or deliverables.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.authorId === currentUserId;
            const isAdmin = msg.author.role === "ADMIN";

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMine ? "flex-end" : "flex-start",
                  maxWidth: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                    fontSize: 12,
                    color: "var(--muted, #6b7280)",
                  }}
                >
                  {!isMine && (
                    isAdmin ? (
                      <NovaMascotAvatar size={20} />
                    ) : (
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "var(--lav, #eeebff)",
                          color: "var(--blue, #6C4CFF)",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {msg.author.name?.charAt(0) ?? "C"}
                      </span>
                    )
                  )}
                  <span style={{ fontWeight: 600, color: "var(--ink, #111827)" }}>
                    {isMine ? "You" : msg.author.name}
                  </span>
                  {isAdmin && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: "var(--lav)",
                        color: "var(--blue)",
                      }}
                    >
                      STUDIO
                    </span>
                  )}
                  <span>•</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <span>{new Date(msg.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                </div>


                {/* Safe plain-text message bubble */}
                <div
                  style={{
                    maxWidth: "min(88%, 560px)",
                    padding: "10px 14px",
                    borderRadius: 14,
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    backgroundColor: isMine ? "var(--blue, #6C4CFF)" : "var(--surface-raised, var(--paper))",
                    border: isMine ? "none" : "1px solid var(--border-hairline, var(--line))",
                    color: isMine ? "#ffffff" : "var(--text-primary, var(--ink))",
                    borderTopRightRadius: isMine ? 2 : 14,
                    borderTopLeftRadius: !isMine ? 2 : 14,
                  }}
                >
                  {msg.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            padding: "8px 16px",
            background: "#fee2e2",
            color: "#991b1b",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Input composer form */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: 16,
          borderTop: "1px solid var(--line, #e5e7eb)",
          background: "var(--card-bg, #ffffff)",
        }}
      >
        <div style={{ position: "relative" }}>
          <textarea
            value={inputBody}
            onChange={(e) => setInputBody(e.target.value)}
            placeholder="Type your message to the Nova team..."
            rows={3}
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px 14px",
              paddingBottom: 28,
              borderRadius: 10,
              border: "1px solid var(--line, #d1d5db)",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 12,
              fontSize: 11,
              color: remainingChars < 100 ? "#b91c1c" : "var(--muted, #9ca3af)",
            }}
          >
            {remainingChars} chars remaining (Ctrl+Enter to send)
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <button
            type="submit"
            disabled={!inputBody.trim() || isSubmitting || remainingChars < 0}
            className="button button-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Sending...
              </>
            ) : (
              <>
                <Send size={14} /> Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
