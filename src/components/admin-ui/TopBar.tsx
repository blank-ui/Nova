"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  MessageSquare,
  Calendar,
  ShieldCheck,
  FolderKanban,
  Check,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { LogoutButton } from "@/components/logout-button";
import {
  EMPTY_NOTIFICATION_STATE,
  clearReadNotifications,
  dismissNotification as dismissNotificationState,
  isNotificationUnread,
  markAllRead as markAllReadState,
  markRead,
  notificationKey,
  notificationStorageKey,
  parseNotificationState,
  readNotificationCount as countReadNotifications,
  restoreClearedNotifications,
  serializeNotificationState,
  unreadNotificationCount,
  visibleNotifications as filterVisibleNotifications,
  type NotificationState,
} from "@/lib/notification-state";
import { useNow } from "@/lib/use-now";

export interface TopBarProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role?: string;
  };
  /** Opens the notifications popover on first render. Used by tests. */
  defaultNotificationsOpen?: boolean;
}

interface NotificationItem {
  id: string;
  type: "inquiry" | "appointment" | "project" | "security" | "system";
  title: string;
  subtitle: string;
  href: string;
  createdAt: string;
  unread: boolean;
}

/**
 * Read/cleared notification state lives in localStorage. It is exposed through
 * useSyncExternalStore so the component never has to hydrate it inside an
 * effect, and so tabs stay in sync via the `storage` event.
 */
const stateCache = new Map<string, NotificationState>();
const stateListeners = new Map<string, Set<() => void>>();

function getStateSnapshot(key: string): NotificationState {
  const cached = stateCache.get(key);
  if (cached) return cached;
  const state =
    typeof window === "undefined"
      ? EMPTY_NOTIFICATION_STATE
      : parseNotificationState(window.localStorage.getItem(key));
  stateCache.set(key, state);
  return state;
}

function getStateServerSnapshot(): NotificationState {
  return EMPTY_NOTIFICATION_STATE;
}

function subscribeToState(key: string, listener: () => void) {
  let listeners = stateListeners.get(key);
  if (!listeners) {
    listeners = new Set();
    stateListeners.set(key, listeners);
  }
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    stateCache.set(key, parseNotificationState(event.newValue));
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners?.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function updateState(key: string, updater: (prev: NotificationState) => NotificationState) {
  const next = updater(getStateSnapshot(key));
  stateCache.set(key, next);
  try {
    window.localStorage.setItem(key, serializeNotificationState(next));
  } catch (err) {
    console.warn("[Notifications] Failed to persist local state:", err);
  }
  stateListeners.get(key)?.forEach((listener) => listener());
}

export function TopBar({ user, defaultNotificationsOpen = false }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isPortal = pathname?.startsWith("/portal");
  const isAdmin = user.role === "ADMIN";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(defaultNotificationsOpen);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const now = useNow();

  const storageKey = notificationStorageKey(user.id);
  const storedState = useSyncExternalStore(
    useCallback((listener) => subscribeToState(storageKey, listener), [storageKey]),
    useCallback(() => getStateSnapshot(storageKey), [storageKey]),
    getStateServerSnapshot
  );

  // Fetch notifications on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoadingNotifs(true);
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setNotifications(data.notifications || []);
          }
        }
      } catch (err) {
        console.warn("[Notifications] Failed to fetch:", err);
      } finally {
        if (mounted) setLoadingNotifs(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen]);

  const visibleNotifications = useMemo(
    () => filterVisibleNotifications(notifications, storedState),
    [notifications, storedState]
  );

  const unreadCount = useMemo(
    () => unreadNotificationCount(visibleNotifications, storedState),
    [visibleNotifications, storedState]
  );

  const readNotificationCount = useMemo(
    () => countReadNotifications(visibleNotifications, storedState),
    [visibleNotifications, storedState]
  );

  function markAllRead() {
    updateState(storageKey, (prev) => markAllReadState(prev, visibleNotifications));
  }

  function clearRead() {
    updateState(storageKey, (prev) => clearReadNotifications(prev, visibleNotifications));
  }

  function restoreCleared() {
    updateState(storageKey, restoreClearedNotifications);
  }

  function dismissNotification(notif: NotificationItem) {
    updateState(storageKey, (prev) => dismissNotificationState(prev, notif));
  }

  function handleNotificationClick(notif: NotificationItem) {
    updateState(storageKey, (prev) => markRead(prev, notif));
    setNotificationsOpen(false);
    router.push(notif.href);
  }

  const formatRelativeTime = (iso: string, now: number) => {
    try {
      // Before the clock store has ticked (server render / first paint) there is
      // no stable "now", so fall back to an absolute date.
      if (!now) {
        return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      }
      const diffMs = now - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "inquiry":
        return <MessageSquare size={14} color="#d97706" />;
      case "appointment":
        return <Calendar size={14} color="#7c3aed" />;
      case "project":
        return <FolderKanban size={14} color="#059669" />;
      case "security":
      default:
        return <ShieldCheck size={14} color="#2563eb" />;
    }
  };

  const isDeveloper = pathname?.startsWith("/developer");
  const isFinance = pathname?.startsWith("/finance");

  let navLinks;
  if (isDeveloper || (user.role === "DEVELOPER" && isPortal)) {
    navLinks = [
      { label: "Console", href: "/developer", matchExact: true },
      { label: "Repositories", href: "/developer/repos", matchExact: false },
      { label: "Client Projects", href: "/portal/projects", matchExact: false },
      { label: "Appointments", href: "/portal/appointments", matchExact: false },
      { label: "Profile & Security", href: "/portal/security", matchExact: false },
      ...(isAdmin ? [{ label: "Admin Space", href: "/admin", matchExact: false }] : []),
    ];
  } else if (isFinance || (user.role === "FINANCE" && isPortal)) {
    navLinks = [
      { label: "Finance", href: "/finance", matchExact: true },
      { label: "Invoices & Billing", href: "/finance/invoices", matchExact: false },
      { label: "Client Projects", href: "/portal/projects", matchExact: false },
      { label: "Appointments", href: "/portal/appointments", matchExact: false },
      { label: "Profile & Security", href: "/portal/security", matchExact: false },
      ...(isAdmin ? [{ label: "Admin Space", href: "/admin", matchExact: false }] : []),
    ];
  } else if (isPortal) {
    navLinks = [
      { label: "Overview", href: "/portal", matchExact: true },
      { label: "Projects", href: "/portal/projects", matchExact: false },
      { label: "Appointments", href: "/portal/appointments", matchExact: false },
      { label: "Profile & Security", href: "/portal/security", matchExact: false },
      ...(isAdmin ? [{ label: "Admin Space", href: "/admin", matchExact: false }] : []),
    ];
  } else {
    navLinks = [
      { label: "Overview", href: "/admin", matchExact: true },
      { label: "Inquiries", href: "/admin/inquiry", matchExact: false },
      { label: "Projects", href: "/admin/projects", matchExact: false },
      { label: "Appointments", href: "/admin/appointments", matchExact: false },
      { label: "Users & Accounts", href: "/admin/users", matchExact: false },
      { label: "GitHub & Gallery", href: "/admin/showcase", matchExact: false },
      { label: "Security", href: "/admin/security", matchExact: false },
      { label: "Client Portal", href: "/portal", matchExact: false },
    ];
  }

  const defaultHome =
    user.role === "DEVELOPER"
      ? "/developer"
      : user.role === "FINANCE"
      ? "/finance"
      : user.role === "CLIENT"
      ? "/portal"
      : "/admin";

  const homeHref = isDeveloper
    ? "/developer"
    : isFinance
    ? "/finance"
    : isPortal
    ? (user.role === "DEVELOPER" ? "/developer" : user.role === "FINANCE" ? "/finance" : "/portal")
    : defaultHome;

  const profileHref =
    isDeveloper || isFinance || isPortal || user.role !== "ADMIN"
      ? "/portal/security"
      : "/admin/security";

  return (
    <header
      className="topbar-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        paddingBottom: 24,
        flexWrap: "wrap",
      }}
    >
      {/* Left: Nova Logo */}
      <Link
        href={homeHref}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "var(--text-primary)",
        }}
        aria-label="Nova Platform Home"
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--ink-crm)",
            color: "var(--ink-crm-text, #FFFFFF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
          }}
        >
          nova
        </span>
      </Link>

      {/* Center: Pill Navigation */}
      <nav
        aria-label="Platform Sections"
        className="topbar-nav-pill-track no-scrollbar"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: 4,
          borderRadius: "var(--radius-pill)",
          background: "transparent",
          overflowX: "auto",
          maxWidth: "100%",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {navLinks.map((item) => {
          const isActive = item.matchExact
            ? pathname === item.href
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-pill)",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                textDecoration: "none",
                background: isActive ? "var(--ink-crm)" : "transparent",
                color: isActive ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right: Circular Buttons & Avatar */}
      <div className="topbar-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, position: "relative" }}>
        <CurrencySwitcher compact />

        <ThemeToggle
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid var(--border-hairline)",
            background: "var(--surface-raised)",
            color: "var(--text-primary)",
          }}
        />

        {/* Notifications Button & Dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            type="button"
            aria-label="View notifications"
            title="Notifications"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: notificationsOpen ? "1px solid var(--accent-blue, #6C4CFF)" : "1px solid var(--border-hairline)",
              background: notificationsOpen ? "var(--ink-crm)" : "var(--surface-raised)",
              color: notificationsOpen ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              position: "relative",
              padding: 0,
            }}
          >
            <Bell size={18} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  minWidth: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#EF4444",
                  border: "2px solid var(--surface-raised, #ffffff)",
                  boxShadow: "0 0 6px rgba(239, 68, 68, 0.6)",
                }}
              />
            )}
          </button>

          {/* Interactive Notifications Popover */}
          {notificationsOpen && (
            <div
              className="animate-fade-in-up notification-popover"
              role="dialog"
              aria-label="Notifications"
              style={{
                position: "absolute",
                top: 52,
                right: 0,
                width: "min(390px, 92vw)",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 18,
                boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
                zIndex: 1000,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Popover Header */}
              <div
                className="notification-popover-header"
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--surface-raised, rgba(0,0,0,0.02))",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>Notifications</span>
                  {unreadCount > 0 ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "1px 7px",
                        borderRadius: 99,
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#DC2626",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {unreadCount} new
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>All read</span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="notification-action-btn"
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--accent-blue, #6C4CFF)",
                        cursor: "pointer",
                        padding: "4px 6px",
                        borderRadius: 6,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Mark read
                    </button>
                  )}
                  {readNotificationCount > 0 && (
                    <button
                      type="button"
                      onClick={clearRead}
                      className="notification-action-btn"
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--muted)",
                        cursor: "pointer",
                        padding: "4px 6px",
                        borderRadius: 6,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Clear read ({readNotificationCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="notification-list" style={{ maxHeight: 360, overflowY: "auto", padding: "6px 0" }}>
                {loadingNotifs ? (
                  <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading updates...</span>
                  </div>
                ) : visibleNotifications.length === 0 ? (
                  <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--muted)" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                      <Check size={24} color="#10b981" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", display: "block" }}>
                      All caught up!
                    </span>
                    <span style={{ fontSize: 11, marginTop: 2, display: "block" }}>
                      {storedState.cleared.length > 0
                        ? "You've cleared these notifications."
                        : "No unread inquiries or system alerts."}
                    </span>
                    {storedState.cleared.length > 0 && (
                      <button
                        type="button"
                        onClick={restoreCleared}
                        style={{
                          marginTop: 12,
                          background: "transparent",
                          border: "none",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--accent-blue, #6C4CFF)",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Restore cleared notifications
                      </button>
                    )}
                  </div>
                ) : (
                  visibleNotifications.map((notif) => {
                    const unread = isNotificationUnread(storedState, notif);
                    return (
                      <div
                        key={notificationKey(notif)}
                        className="notification-row"
                        style={{
                          borderBottom: "1px solid var(--border-hairline-light, rgba(0,0,0,0.04))",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                          background: unread ? "rgba(108,76,255,0.05)" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(notif)}
                          className="notification-row-main"
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: "12px 4px 12px 16px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            textAlign: "left",
                            font: "inherit",
                            color: "inherit",
                          }}
                        >
                          <div
                            className="notification-row-icon"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              background: "var(--surface-raised)",
                              border: "1px solid var(--border-hairline)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            {getNotificationIcon(notif.type)}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 2 }}>
                              <span style={{ fontSize: 12, fontWeight: unread ? 800 : 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {notif.title}
                              </span>
                              <span style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>
                                {formatRelativeTime(notif.createdAt, now)}
                              </span>
                            </div>
                            <span style={{ fontSize: 11, color: "var(--muted)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {notif.subtitle}
                            </span>
                          </div>

                          {unread && (
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "var(--accent-blue, #6C4CFF)",
                                marginTop: 8,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </button>

                        <button
                          type="button"
                          aria-label={`Clear notification: ${notif.title}`}
                          title="Clear notification"
                          onClick={() => dismissNotification(notif)}
                          className="notification-row-dismiss"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--muted)",
                            cursor: "pointer",
                            padding: 6,
                            marginTop: 8,
                            marginRight: 8,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popover Footer */}
              <div
                className="notification-popover-footer"
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid var(--line)",
                  background: "var(--surface-raised, rgba(0,0,0,0.02))",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 11,
                }}
              >
                <Link
                  href={isAdmin ? "/admin/inquiry" : "/portal/projects"}
                  onClick={() => setNotificationsOpen(false)}
                  className="notification-footer-link"
                  style={{
                    color: "var(--accent-blue, #6C4CFF)",
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {isAdmin ? "View Inquiries CRM" : "View Projects Tracker"}
                  <ArrowRight size={12} />
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/appointments"
                    onClick={() => setNotificationsOpen(false)}
                    className="notification-footer-link"
                    style={{
                      color: "var(--muted)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Appointments
                    <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <LogoutButton
          iconOnly
          className=""
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid var(--border-hairline)",
            background: "var(--surface-raised)",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
        />

        <Link href={profileHref} aria-label="User profile & security">
          <Avatar
            src={user.image}
            name={user.name || user.email}
            size="md"
            userId={user.id}
          />
        </Link>
      </div>
    </header>
  );
}
