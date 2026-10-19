"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MessagesSquare,
  MessageSquare,
  Hash,
  Send,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Terminal,
  DollarSign,
  FolderKanban,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import { PageHeader, Badge } from "@/components/admin-ui";
import { useToast } from "@/components/toast";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  paymentStatus?: string;
  client?: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count?: {
    messages: number;
  };
  updatedAt?: Date | string;
}

export interface UnifiedMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderImage?: string | null;
  body: string;
  createdAt: string;
}

export interface TeamDiscussionsManagerProps {
  currentUserId: string;
  currentUserRole?: string | null;
  teamMembers: TeamMember[];
  projects?: ProjectItem[];
  initialProjectId?: string;
  initialRecipientId?: string;
  initialChannel?: string;
  initialMode?: "project" | "channel" | "direct";
}

const INTERNAL_CHANNELS = [
  {
    id: "general",
    name: "general-studio",
    title: "#general-studio",
    desc: "Studio-wide announcements, syncs, and team collaboration",
    icon: <Hash size={15} />,
  },
  {
    id: "engineering",
    name: "engineering-sprint",
    title: "#engineering-sprint",
    desc: "Technical architecture, sprint tasks, code reviews, and deployments",
    icon: <Terminal size={15} />,
  },
  {
    id: "finance",
    name: "finance-billing",
    title: "#finance-billing",
    desc: "Commercial scopes, invoicing, milestone valuations, and client budgets",
    icon: <DollarSign size={15} />,
  },
];

const PROJECT_QUICK_ACTIONS = [
  "🚀 Request sprint progress update",
  "📋 Clarify milestone requirements",
  "🗓️ Schedule a quick team sync",
  "💡 Review latest deliverables draft",
];

const CHANNEL_QUICK_ACTIONS = [
  "🚀 Studio sprint update ready for review",
  "🔍 Code review required on latest milestone",
  "💰 Commercial invoice & billing verification needed",
];

const DIRECT_QUICK_ACTIONS = [
  "👋 Quick sync when you have a moment?",
  "⚡ Blocked on milestone dependency",
  "✅ Task completed and ready for testing",
];

export function TeamDiscussionsManager({
  currentUserId,
  currentUserRole = "DEVELOPER",
  teamMembers = [],
  projects = [],
  initialProjectId,
  initialRecipientId,
  initialChannel = "general",
  initialMode,
}: TeamDiscussionsManagerProps) {
  const toast = useToast();
  const isClient = currentUserRole === "CLIENT";

  // Mode: "project" | "channel" | "direct"
  const [activeMode, setActiveMode] = useState<"project" | "channel" | "direct">(() => {
    if (initialMode) return initialMode;
    if (isClient) return "project";
    if (initialRecipientId) return "direct";
    if (initialProjectId) return "project";
    return "channel";
  });

  // Selected identifiers
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    if (initialProjectId && projects.some((p) => p.id === initialProjectId)) {
      return initialProjectId;
    }
    return projects.length > 0 ? projects[0].id : "";
  });

  const [activeChannel, setActiveChannel] = useState<string>(initialChannel);

  const [activeRecipientId, setActiveRecipientId] = useState<string>(() => {
    if (initialRecipientId) return initialRecipientId;
    const firstOther = teamMembers.find((m) => m.id !== currentUserId);
    return firstOther ? firstOther.id : "";
  });

  const [search, setSearch] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFirstLoadRef = useRef(true);

  // Other internal members (excluding current user)
  const otherMembers = useMemo(() => {
    return teamMembers.filter((m) => m.id !== currentUserId);
  }, [teamMembers, currentUserId]);

  // Filtered lists based on search
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.client?.name && p.client.name.toLowerCase().includes(q)) ||
        p.status.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return otherMembers;
    const q = search.toLowerCase();
    return otherMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [otherMembers, search]);

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return INTERNAL_CHANNELS;
    const q = search.toLowerCase();
    return INTERNAL_CHANNELS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    );
  }, [search]);

  // Active item objects
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const activeRecipient = useMemo(() => {
    return teamMembers.find((m) => m.id === activeRecipientId) || null;
  }, [teamMembers, activeRecipientId]);

  const activeChannelObj = useMemo(() => {
    return INTERNAL_CHANNELS.find((c) => c.id === activeChannel) || INTERNAL_CHANNELS[0];
  }, [activeChannel]);

  // Fetch messages function depending on activeMode
  const fetchMessages = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      try {
        if (activeMode === "project") {
          if (!activeProjectId) {
            setMessages([]);
            return;
          }
          const res = await fetch(`/api/portal/projects/${activeProjectId}/messages?limit=100`);
          if (!res.ok) {
            throw new Error(`Failed to load project messages (${res.status})`);
          }
          const json = await res.json();
          const list = (json.data || []).map((m: any) => ({
            id: m.id,
            senderId: m.authorId,
            senderName: m.author?.name || "Member",
            senderRole: m.author?.role || "CLIENT",
            body: m.body,
            createdAt: m.createdAt,
          }));
          setMessages(list);
        } else {
          // Channel or Direct team messages
          const url =
            activeMode === "direct" && activeRecipientId
              ? `/api/team/messages?recipientId=${encodeURIComponent(activeRecipientId)}`
              : `/api/team/messages?channel=${encodeURIComponent(activeChannel)}`;

          const res = await fetch(url);
          if (!res.ok) {
            throw new Error("Failed to load team messages");
          }
          const data = await res.json();
          const list = (data.messages || []).map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.sender?.name || "Member",
            senderRole: m.sender?.role || "STAFF",
            senderImage: m.sender?.image,
            body: m.body,
            createdAt: m.createdAt,
          }));
          setMessages(list);
        }
        setLastRefreshedAt(new Date());
      } catch (err: any) {
        if (!isSilent) {
          toast.error(err.message || "Could not load messages.");
        }
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    },
    [activeMode, activeProjectId, activeRecipientId, activeChannel, toast]
  );

  // Initial load and whenever mode or selection changes
  useEffect(() => {
    isFirstLoadRef.current = true;
    fetchMessages(false);
  }, [fetchMessages]);

  // Auto-scroll on initial load and when message count increases
  useEffect(() => {
    if (isFirstLoadRef.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isFirstLoadRef.current = false;
    }
  }, [messages]);

  // Silent polling every 3 seconds for live message syncing
  useEffect(() => {
    let isCancelled = false;
    const interval = setInterval(() => {
      if (!isCancelled) {
        fetchMessages(true);
      }
    }, 3000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [fetchMessages]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    if (text.length > 4000) {
      toast.error("Message exceeds 4,000 characters limit.");
      return;
    }

    setIsSending(true);
    try {
      if (activeMode === "project") {
        if (!activeProjectId) {
          toast.error("No active project selected.");
          return;
        }
        const res = await fetch(`/api/portal/projects/${activeProjectId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to send message to project thread.");
        }
        if (data.message) {
          const newMsg: UnifiedMessage = {
            id: data.message.id,
            senderId: data.message.authorId,
            senderName: data.message.author?.name || "You",
            senderRole: data.message.author?.role || currentUserRole || "MEMBER",
            body: data.message.body,
            createdAt: data.message.createdAt,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      } else {
        const payload: any = { body: text };
        if (activeMode === "direct" && activeRecipientId) {
          payload.recipientId = activeRecipientId;
        } else {
          payload.channel = activeChannel;
        }

        const res = await fetch("/api/team/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to dispatch message.");
        }

        if (data.message) {
          const newMsg: UnifiedMessage = {
            id: data.message.id,
            senderId: data.message.senderId,
            senderName: data.message.sender?.name || "You",
            senderRole: data.message.sender?.role || currentUserRole || "STAFF",
            senderImage: data.message.sender?.image,
            body: data.message.body,
            createdAt: data.message.createdAt,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      }

      setInputText("");
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Escape") {
      setInputText("");
      if (mobileDrawerOpen) setMobileDrawerOpen(false);
    }
  };

  const handleApplyQuickAction = (chipText: string) => {
    setInputText(chipText);
    textareaRef.current?.focus();
  };

  // Helper for role styling
  const getRoleBadge = (role?: string) => {
    const r = (role || "").toUpperCase();
    if (r === "ADMIN") {
      return (
        <span
          style={{
            fontSize: 10,
            padding: "2px 7px",
            borderRadius: 6,
            fontWeight: 800,
            background: "rgba(16, 19, 34, 0.08)",
            color: "var(--ink-crm, #101322)",
            letterSpacing: "0.03em",
          }}
        >
          STUDIO LEAD
        </span>
      );
    }
    if (r === "DEVELOPER") {
      return (
        <span
          style={{
            fontSize: 10,
            padding: "2px 7px",
            borderRadius: 6,
            fontWeight: 800,
            background: "rgba(217, 119, 6, 0.12)",
            color: "#D97706",
            letterSpacing: "0.03em",
          }}
        >
          ENGINEER
        </span>
      );
    }
    if (r === "FINANCE") {
      return (
        <span
          style={{
            fontSize: 10,
            padding: "2px 7px",
            borderRadius: 6,
            fontWeight: 800,
            background: "rgba(37, 99, 235, 0.12)",
            color: "#2563EB",
            letterSpacing: "0.03em",
          }}
        >
          FINANCE
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: 10,
          padding: "2px 7px",
          borderRadius: 6,
          fontWeight: 800,
          background: "rgba(16, 185, 129, 0.12)",
          color: "#059669",
          letterSpacing: "0.03em",
        }}
      >
        CLIENT
      </span>
    );
  };

  const quickActionChips = useMemo(() => {
    if (activeMode === "project") return PROJECT_QUICK_ACTIONS;
    if (activeMode === "channel") return CHANNEL_QUICK_ACTIONS;
    return DIRECT_QUICK_ACTIONS;
  }, [activeMode]);

  return (
    <div className="animate-fade-in-up" style={{ width: "100%", paddingBottom: 24 }}>
      {/* Page Header */}
      <PageHeader
        titleLine1={isClient ? "Client" : "Studio"}
        titleLine2={isClient ? "Discussions & Messages" : "Discussions Command"}
        backHref={
          isClient
            ? "/portal/projects"
            : currentUserRole === "ADMIN"
            ? "/admin"
            : currentUserRole === "FINANCE"
            ? "/finance"
            : "/developer"
        }
        stats={[
          {
            icon: <FolderKanban size={18} strokeWidth={1.8} />,
            value: projects.length,
            badgeLabel: isClient ? "Your Projects" : "Client Workspaces",
            badgeVariant: "brand",
            caption: "Active threads with studio engineers",
          },
          {
            icon: <MessageSquare size={18} strokeWidth={1.8} />,
            value: messages.length,
            badgeLabel: "Messages",
            badgeVariant: "info",
            caption: "In current conversation thread",
          },
          {
            icon: <Sparkles size={18} strokeWidth={1.8} />,
            value: "Live Auto-Sync",
            badgeLabel: "Active 3s",
            badgeVariant: "success",
            caption: `Synced ${lastRefreshedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}`,
          },
        ]}
      />

      {/* Mode Navigation Tabs (for internal staff) */}
      {!isClient && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
            background: "var(--surface-raised)",
            padding: "6px 8px",
            borderRadius: 14,
            border: "1px solid var(--border-hairline)",
            width: "fit-content",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMode("project")}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: activeMode === "project" ? "1px solid var(--ink-crm, #101322)" : "1px solid transparent",
              background: activeMode === "project" ? "var(--ink-crm, #101322)" : "transparent",
              color: activeMode === "project" ? "#FFFFFF" : "var(--text-primary)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <FolderKanban size={15} />
            <span>Project Threads ({projects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("channel")}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: activeMode === "channel" ? "1px solid var(--ink-crm, #101322)" : "1px solid transparent",
              background: activeMode === "channel" ? "var(--ink-crm, #101322)" : "transparent",
              color: activeMode === "channel" ? "#FFFFFF" : "var(--text-primary)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <Hash size={15} />
            <span>Studio Channels (3)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("direct")}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: activeMode === "direct" ? "1px solid var(--ink-crm, #101322)" : "1px solid transparent",
              background: activeMode === "direct" ? "var(--ink-crm, #101322)" : "transparent",
              color: activeMode === "direct" ? "#FFFFFF" : "var(--text-primary)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <User size={15} />
            <span>Direct Messages ({otherMembers.length})</span>
          </button>
        </div>
      )}

      {/* Mobile Drawer Trigger (visible on <= 900px) */}
      <div className="mobile-switcher-row" style={{ display: "none", marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--border-hairline)",
            background: "var(--card-bg-crm, #FFFFFF)",
            color: "var(--text-primary)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Menu size={16} />
            <span>
              Switch Thread:{" "}
              <strong>
                {activeMode === "project" && activeProject
                  ? activeProject.name
                  : activeMode === "direct" && activeRecipient
                  ? activeRecipient.name
                  : activeChannelObj.title}
              </strong>
            </span>
          </span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Main Discussions Layout Shell */}
      <div
        className="discussions-app-shell"
        style={{
          display: "grid",
          gridTemplateColumns: "330px minmax(0, 1fr)",
          gap: 18,
          alignItems: "stretch",
          minHeight: "calc(100vh - 290px)",
          height: "calc(100vh - 290px)",
        }}
      >
        {/* Left Sidebar */}
        <aside
          className={`discussions-sidebar ${mobileDrawerOpen ? "mobile-open" : ""}`}
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 20,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflowY: "auto",
          }}
        >
          {/* Header in mobile mode with close button */}
          <div
            className="mobile-drawer-header"
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 8,
              borderBottom: "1px solid var(--border-hairline)",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 800 }}>Select Conversation</span>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "var(--text-muted-crm)",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted-crm)",
              }}
            />
            <input
              type="text"
              placeholder={
                activeMode === "project"
                  ? "Search projects..."
                  : activeMode === "channel"
                  ? "Search channels..."
                  : "Search team members..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: 10,
                border: "1px solid var(--border-hairline)",
                background: "var(--card-bg-crm, #FFFFFF)",
                color: "var(--text-primary)",
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted-crm)",
                  padding: 2,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* MODE 1: Projects List */}
          {activeMode === "project" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 6px",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted-crm)",
                }}
              >
                <span>{isClient ? "My Active Projects" : "Client Project Threads"}</span>
                <span>({filteredProjects.length})</span>
              </div>

              {filteredProjects.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--text-muted-crm)",
                    fontSize: 12,
                  }}
                >
                  No projects match your filter.
                </div>
              ) : (
                filteredProjects.map((p) => {
                  const isSelected = activeProjectId === p.id;
                  const statusColor =
                    p.status === "COMPLETED"
                      ? "#10B981"
                      : p.status === "IN_PROGRESS"
                      ? "#3B82F6"
                      : p.status === "REVIEW"
                      ? "#F59E0B"
                      : "#6B7280";

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setMobileDrawerOpen(false);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: isSelected
                          ? "1.5px solid var(--ink-crm, #101322)"
                          : "1px solid var(--border-hairline)",
                        background: isSelected ? "var(--card-bg-crm, #FFFFFF)" : "rgba(255,255,255,0.6)",
                        boxShadow: isSelected ? "0 4px 14px rgba(0,0,0,0.06)" : "none",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: isSelected
                            ? "var(--ink-crm, #101322)"
                            : "rgba(0,0,0,0.05)",
                          color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <FolderKanban size={16} />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: isSelected ? 800 : 600,
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.name}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 800,
                              padding: "1px 6px",
                              borderRadius: 4,
                              background: `${statusColor}18`,
                              color: statusColor,
                              textTransform: "uppercase",
                              flexShrink: 0,
                            }}
                          >
                            {p.status.replace("_", " ")}
                          </span>
                        </div>

                        {p.client && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted-crm)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginTop: 2,
                            }}
                          >
                            Client: {p.client.name}
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 4,
                            fontSize: 10,
                            color: "var(--text-muted-crm)",
                          }}
                        >
                          <span>{p._count?.messages || 0} messages</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <Clock size={10} />
                            <span>Active</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* MODE 2: Channels List */}
          {activeMode === "channel" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted-crm)",
                  padding: "0 6px",
                }}
              >
                Internal Studio Channels
              </div>

              {filteredChannels.map((ch) => {
                const isSelected = activeChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setActiveChannel(ch.id);
                      setMobileDrawerOpen(false);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: isSelected
                        ? "1.5px solid var(--ink-crm, #101322)"
                        : "1px solid var(--border-hairline)",
                      background: isSelected ? "var(--card-bg-crm, #FFFFFF)" : "rgba(255,255,255,0.6)",
                      boxShadow: isSelected ? "0 4px 14px rgba(0,0,0,0.06)" : "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isSelected ? "var(--ink-crm, #101322)" : "rgba(0,0,0,0.05)",
                        color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {ch.icon}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: isSelected ? 800 : 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {ch.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted-crm)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ch.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* MODE 3: Direct Messages List */}
          {activeMode === "direct" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 6px",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted-crm)",
                }}
              >
                <span>Direct Team Chats</span>
                <span>({filteredMembers.length})</span>
              </div>

              {filteredMembers.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--text-muted-crm)",
                    fontSize: 12,
                  }}
                >
                  No team members found.
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isSelected = activeRecipientId === member.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setActiveRecipientId(member.id);
                        setMobileDrawerOpen(false);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: isSelected
                          ? "1.5px solid var(--ink-crm, #101322)"
                          : "1px solid var(--border-hairline)",
                        background: isSelected ? "var(--card-bg-crm, #FFFFFF)" : "rgba(255,255,255,0.6)",
                        boxShadow: isSelected ? "0 4px 14px rgba(0,0,0,0.06)" : "none",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: isSelected ? "var(--ink-crm, #101322)" : "rgba(0,0,0,0.06)",
                          color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: isSelected ? 800 : 600,
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {member.name}
                          </span>
                          {getRoleBadge(member.role)}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted-crm)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {member.email}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </aside>

        {/* Right Chat Canvas */}
        <main
          style={{
            background: "var(--card-bg-crm, #FFFFFF)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 6px 24px rgba(0,0,0,0.03)",
          }}
        >
          {/* Chat Canvas Header */}
          <div
            style={{
              padding: "16px 22px",
              borderBottom: "1px solid var(--border-hairline)",
              background: "var(--surface-raised)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: activeMode === "direct" ? "50%" : 10,
                  background: "var(--ink-crm, #101322)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {activeMode === "project" ? (
                  <FolderKanban size={18} />
                ) : activeMode === "direct" && activeRecipient ? (
                  activeRecipient.name.charAt(0).toUpperCase()
                ) : (
                  <Hash size={18} />
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      margin: 0,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeMode === "project" && activeProject
                      ? activeProject.name
                      : activeMode === "direct" && activeRecipient
                      ? activeRecipient.name
                      : activeChannelObj.title}
                  </h2>

                  {activeMode === "project" && activeProject && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 6,
                        fontWeight: 800,
                        background: "rgba(0,0,0,0.06)",
                        color: "var(--text-primary)",
                        textTransform: "uppercase",
                      }}
                    >
                      {activeProject.status.replace("_", " ")}
                    </span>
                  )}

                  {activeMode === "direct" && activeRecipient && getRoleBadge(activeRecipient.role)}
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted-crm)",
                    margin: "2px 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeMode === "project" && activeProject
                    ? `Project discussion thread & updates ${
                        activeProject.client ? `with ${activeProject.client.name}` : ""
                      }`
                    : activeMode === "direct" && activeRecipient
                    ? `Direct discussion with ${activeRecipient.email}`
                    : activeChannelObj.desc}
                </p>
              </div>
            </div>

            {/* Action buttons & live sync indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              {activeMode === "project" && activeProject && (
                <Link
                  href={
                    currentUserRole === "ADMIN"
                      ? `/admin/projects/${activeProject.id}`
                      : `/portal/projects/${activeProject.id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    background: "var(--card-bg-crm, #FFFFFF)",
                    border: "1px solid var(--border-hairline)",
                    padding: "5px 10px",
                    borderRadius: 8,
                    textDecoration: "none",
                  }}
                >
                  <span>Project Hub</span>
                  <ExternalLink size={12} />
                </Link>
              )}

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#10B981",
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "5px 10px",
                  borderRadius: 99,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#10B981",
                    display: "inline-block",
                  }}
                />
                <span>Live (3s Auto-Sync)</span>
              </div>

              <button
                type="button"
                onClick={() => fetchMessages(false)}
                title="Refresh messages now"
                style={{
                  background: "var(--card-bg-crm, #FFFFFF)",
                  border: "1px solid var(--border-hairline)",
                  cursor: "pointer",
                  padding: "6px 8px",
                  borderRadius: 8,
                  color: "var(--text-muted-crm)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Canvas */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {isLoading && messages.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  gap: 8,
                  color: "var(--text-muted-crm)",
                  fontSize: 13,
                }}
              >
                <Loader2 size={18} className="animate-spin" />
                <span>Synchronizing messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div
                style={{
                  margin: "auto",
                  textAlign: "center",
                  maxWidth: 480,
                  padding: "36px 20px",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: "var(--text-primary)",
                  }}
                >
                  <MessageSquare size={26} />
                </div>
                <h4
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    margin: "0 0 6px",
                    color: "var(--text-primary)",
                  }}
                >
                  Start the conversation
                </h4>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    margin: "0 0 20px",
                    color: "var(--text-muted-crm)",
                  }}
                >
                  {activeMode === "project"
                    ? "Post project updates, clarify scope deliverables, or request feedback directly with the team."
                    : activeMode === "direct" && activeRecipient
                    ? `Send a message to ${activeRecipient.name}. Messages synchronize instantly across both accounts.`
                    : `Be the first to share an update in ${activeChannelObj.title}.`}
                </p>

                {/* Quick starter chips */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--text-muted-crm)",
                    }}
                  >
                    Suggested Prompts:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {quickActionChips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyQuickAction(chip)}
                        style={{
                          background: "var(--surface-raised)",
                          border: "1px solid var(--border-hairline)",
                          borderRadius: 99,
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const formattedDate = new Date(msg.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                      gap: 4,
                    }}
                  >
                    {!isMe && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: "var(--text-muted-crm)",
                          marginLeft: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 800,
                            color: "var(--text-primary)",
                          }}
                        >
                          {msg.senderName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                          {msg.senderName}
                        </span>
                        {getRoleBadge(msg.senderRole)}
                        <span>&middot;</span>
                        <span>
                          {formattedDate} {formattedTime}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: "min(680px, 82%)",
                        padding: "11px 16px",
                        borderRadius: 16,
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: isMe ? 16 : 4,
                        background: isMe ? "var(--ink-crm, #101322)" : "var(--surface-raised)",
                        color: isMe ? "#FFFFFF" : "var(--text-primary)",
                        border: isMe ? "none" : "1px solid var(--border-hairline)",
                        fontSize: 14,
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        boxShadow: isMe
                          ? "0 3px 10px rgba(16, 19, 34, 0.15)"
                          : "0 1px 4px rgba(0,0,0,0.02)",
                      }}
                    >
                      {msg.body}
                    </div>

                    {isMe && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted-crm)",
                          marginRight: 4,
                        }}
                      >
                        {formattedTime}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Bar (when messages exist) */}
          {messages.length > 0 && !inputText && (
            <div
              style={{
                padding: "8px 20px",
                background: "var(--surface-raised)",
                borderTop: "1px solid var(--border-hairline)",
                display: "flex",
                gap: 8,
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted-crm)",
                  alignSelf: "center",
                }}
              >
                Quick:
              </span>
              {quickActionChips.slice(0, 3).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyQuickAction(chip)}
                  style={{
                    background: "var(--card-bg-crm, #FFFFFF)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: 99,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "14px 20px",
              borderTop: "1px solid var(--border-hairline)",
              background: "var(--surface-raised)",
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeMode === "project" && activeProject
                    ? `Message ${activeProject.name} discussion thread... (Enter to send, Shift+Enter for new line)`
                    : activeMode === "direct" && activeRecipient
                    ? `Message ${activeRecipient.name} directly... (Enter to send, Shift+Enter for new line)`
                    : `Message ${activeChannelObj.title}... (Enter to send)`
                }
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 14px 24px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--border-hairline)",
                  background: "var(--card-bg-crm, #FFFFFF)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: 6,
                  fontSize: 10,
                  color: "var(--text-muted-crm)",
                }}
              >
                {4000 - inputText.length} left
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="button"
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                background: "var(--ink-crm, #101322)",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 700,
                cursor: isSending || !inputText.trim() ? "not-allowed" : "pointer",
                opacity: isSending || !inputText.trim() ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                flexShrink: 0,
              }}
            >
              {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              <span>Send</span>
            </button>
          </form>
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .discussions-app-shell {
            grid-template-columns: 1fr !important;
            height: calc(100vh - 240px) !important;
          }
          .mobile-switcher-row {
            display: block !important;
          }
          .discussions-sidebar {
            display: none !important;
          }
          .discussions-sidebar.mobile-open {
            display: flex !important;
            position: fixed !important;
            top: 70px !important;
            left: 16px !important;
            right: 16px !important;
            bottom: 20px !important;
            z-index: 100 !important;
            box-shadow: 0 12px 40px rgba(0,0,0,0.2) !important;
          }
          .mobile-drawer-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
