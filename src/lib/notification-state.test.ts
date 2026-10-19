import { describe, it, expect } from "vitest";
import {
  EMPTY_NOTIFICATION_STATE,
  MAX_STORED_KEYS,
  capKeys,
  clearReadNotifications,
  dismissNotification,
  isNotificationUnread,
  markAllRead,
  markRead,
  notificationKey,
  notificationStorageKey,
  parseNotificationState,
  readNotificationCount,
  restoreClearedNotifications,
  serializeNotificationState,
  unreadNotificationCount,
  visibleNotifications,
} from "./notification-state";

const unreadInquiry = {
  id: "inq-1",
  createdAt: "2026-10-19T10:00:00.000Z",
  unread: true,
};

const readAudit = {
  id: "audit-1",
  createdAt: "2026-10-18T09:00:00.000Z",
  unread: false,
};

describe("notification-state", () => {
  it("keys notifications by id and timestamp so updated records resurface", () => {
    expect(notificationKey(unreadInquiry)).toBe("inq-1@2026-10-19T10:00:00.000Z");
    expect(notificationKey({ ...unreadInquiry, createdAt: "2026-10-19T11:00:00.000Z" })).not.toBe(
      notificationKey(unreadInquiry)
    );
  });

  it("scopes stored state per user", () => {
    expect(notificationStorageKey("user-1")).toBe("nova-notifications:user-1");
    expect(notificationStorageKey("user-1")).not.toBe(notificationStorageKey("user-2"));
  });

  it("caps stored keys, keeping the most recent", () => {
    const keys = Array.from({ length: MAX_STORED_KEYS + 5 }, (_, i) => `key-${i}`);
    const capped = capKeys(keys);
    expect(capped).toHaveLength(MAX_STORED_KEYS);
    expect(capped[capped.length - 1]).toBe(`key-${MAX_STORED_KEYS + 4}`);
    expect(capped[0]).toBe("key-5");
  });

  it("treats malformed or missing storage as empty state", () => {
    expect(parseNotificationState(null)).toEqual(EMPTY_NOTIFICATION_STATE);
    expect(parseNotificationState("not json")).toEqual(EMPTY_NOTIFICATION_STATE);
    expect(parseNotificationState(JSON.stringify({ read: "nope", cleared: [1, "ok"] }))).toEqual({
      read: [],
      cleared: ["ok"],
    });
  });

  it("round-trips state through serialization", () => {
    const state = { read: ["a@1"], cleared: ["b@2"] };
    expect(parseNotificationState(serializeNotificationState(state))).toEqual(state);
  });

  it("marks all notifications read and drives the unread badge", () => {
    const state = markAllRead(EMPTY_NOTIFICATION_STATE, [unreadInquiry, readAudit]);
    expect(unreadNotificationCount([unreadInquiry, readAudit], state)).toBe(0);
    expect(readNotificationCount([unreadInquiry, readAudit], state)).toBe(2);
  });

  it("marks a single notification read without touching others", () => {
    const second = { id: "inq-2", createdAt: "2026-10-19T12:00:00.000Z", unread: true };
    const state = markRead(EMPTY_NOTIFICATION_STATE, unreadInquiry);
    expect(isNotificationUnread(state, unreadInquiry)).toBe(false);
    expect(isNotificationUnread(state, second)).toBe(true);
    expect(unreadNotificationCount([unreadInquiry, second], state)).toBe(1);
  });

  it("clears only read notifications, leaving unread ones visible", () => {
    const state = clearReadNotifications(EMPTY_NOTIFICATION_STATE, [unreadInquiry, readAudit]);
    expect(visibleNotifications([unreadInquiry, readAudit], state)).toEqual([unreadInquiry]);
    expect(state.read).toEqual([]);
  });

  it("clears a read notification after it has been marked read", () => {
    const marked = markRead(EMPTY_NOTIFICATION_STATE, unreadInquiry);
    const cleared = clearReadNotifications(marked, [unreadInquiry, readAudit]);
    expect(visibleNotifications([unreadInquiry, readAudit], cleared)).toEqual([]);
  });

  it("dismisses a single notification and can restore cleared ones", () => {
    const dismissed = dismissNotification(EMPTY_NOTIFICATION_STATE, unreadInquiry);
    expect(visibleNotifications([unreadInquiry, readAudit], dismissed)).toEqual([readAudit]);

    const restored = restoreClearedNotifications(dismissed);
    expect(visibleNotifications([unreadInquiry, readAudit], restored)).toEqual([
      unreadInquiry,
      readAudit,
    ]);
  });

  it("does not resurrect dismissed notifications when they reappear with a new timestamp", () => {
    const dismissed = dismissNotification(EMPTY_NOTIFICATION_STATE, unreadInquiry);
    const updated = { ...unreadInquiry, createdAt: "2026-10-20T08:00:00.000Z" };
    expect(visibleNotifications([updated], dismissed)).toEqual([updated]);
  });

  it("does not duplicate keys when the same action runs twice", () => {
    const once = markAllRead(EMPTY_NOTIFICATION_STATE, [unreadInquiry]);
    const twice = markAllRead(once, [unreadInquiry]);
    expect(twice.read).toEqual(once.read);
    expect(twice.read).toHaveLength(1);
  });
});
