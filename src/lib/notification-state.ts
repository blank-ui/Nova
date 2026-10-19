/**
 * Client-side read/cleared state for the TopBar notification popover.
 *
 * The notifications API derives its list from live records (inquiries,
 * appointments, audit events, projects), so it has no per-user read flags to
 * update. Persisting which notifications a user has read or cleared on the
 * client keeps the bell badge meaningful without a schema change.
 *
 * Pure helpers live here so they can be unit tested without a DOM.
 */

export interface NotificationLike {
  id: string;
  createdAt: string;
  unread: boolean;
}

export interface NotificationState {
  read: string[];
  cleared: string[];
}

export const NOTIFICATION_STATE_PREFIX = "nova-notifications:";
export const MAX_STORED_KEYS = 300;

export const EMPTY_NOTIFICATION_STATE: NotificationState = { read: [], cleared: [] };

/**
 * A notification's identity includes its timestamp, so a record that is updated
 * later (projects use `updatedAt`, for example) gets a fresh key and resurfaces
 * instead of staying hidden behind an earlier "read"/"clear" decision.
 */
export function notificationKey(notif: Pick<NotificationLike, "id" | "createdAt">): string {
  return `${notif.id}@${notif.createdAt}`;
}

export function notificationStorageKey(userId: string): string {
  return `${NOTIFICATION_STATE_PREFIX}${userId}`;
}

/** Keep localStorage bounded; newest keys win because we always append. */
export function capKeys(keys: string[]): string[] {
  return keys.length > MAX_STORED_KEYS ? keys.slice(keys.length - MAX_STORED_KEYS) : keys;
}

export function parseNotificationState(raw: string | null): NotificationState {
  if (!raw) return EMPTY_NOTIFICATION_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationState> | null;
    return {
      read: Array.isArray(parsed?.read) ? parsed.read.filter((k): k is string => typeof k === "string") : [],
      cleared: Array.isArray(parsed?.cleared)
        ? parsed.cleared.filter((k): k is string => typeof k === "string")
        : [],
    };
  } catch {
    return EMPTY_NOTIFICATION_STATE;
  }
}

export function serializeNotificationState(state: NotificationState): string {
  return JSON.stringify({
    read: capKeys(state.read),
    cleared: capKeys(state.cleared),
  });
}

export function isNotificationUnread(state: NotificationState, notif: NotificationLike): boolean {
  return notif.unread && !state.read.includes(notificationKey(notif));
}

export function visibleNotifications<T extends NotificationLike>(
  notifications: T[],
  state: NotificationState
): T[] {
  return notifications.filter((notif) => !state.cleared.includes(notificationKey(notif)));
}

export function unreadNotificationCount(notifications: NotificationLike[], state: NotificationState): number {
  return notifications.filter((notif) => isNotificationUnread(state, notif)).length;
}

export function readNotificationCount(notifications: NotificationLike[], state: NotificationState): number {
  return notifications.filter((notif) => !isNotificationUnread(state, notif)).length;
}

function withKeys(existing: string[], additions: string[]): string[] {
  return capKeys(Array.from(new Set([...existing, ...additions])));
}

/** Marks every visible notification as read (used by "Mark all read"). */
export function markAllRead(state: NotificationState, notifications: NotificationLike[]): NotificationState {
  return {
    ...state,
    read: withKeys(state.read, notifications.map(notificationKey)),
  };
}

/** Marks a single notification as read (used when the user opens it). */
export function markRead(state: NotificationState, notif: NotificationLike): NotificationState {
  return { ...state, read: withKeys(state.read, [notificationKey(notif)]) };
}

/**
 * Hides read notifications (used by "Clear read"). Unread notifications stay
 * visible so clearing never silently discards something the user has not seen.
 */
export function clearReadNotifications(
  state: NotificationState,
  notifications: NotificationLike[]
): NotificationState {
  const readKeys = notifications
    .filter((notif) => !isNotificationUnread(state, notif))
    .map(notificationKey);
  return { ...state, cleared: withKeys(state.cleared, readKeys) };
}

/** Hides a single notification (used by the per-row clear button). */
export function dismissNotification(state: NotificationState, notif: NotificationLike): NotificationState {
  return { ...state, cleared: withKeys(state.cleared, [notificationKey(notif)]) };
}

/** Brings back everything hidden by "Clear read" and the row clear buttons. */
export function restoreClearedNotifications(state: NotificationState): NotificationState {
  return { ...state, cleared: [] };
}
