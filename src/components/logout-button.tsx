"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function LogoutButton({
  className = "button button-outline",
  style,
  iconOnly = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  iconOnly?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await authClient.signOut();
      window.location.assign("/");
    } catch {
      window.location.assign("/");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      className={className}
      style={{
        padding: iconOnly ? 0 : "8px 14px",
        fontSize: 12,
        borderRadius: iconOnly ? "50%" : 10,
        cursor: busy ? "wait" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
      title="Sign out of Nova"
      aria-label="Sign out of Nova"
    >
      <LogOut size={iconOnly ? 17 : 13} strokeWidth={1.8} />
      {!iconOnly && <span>{busy ? "Signing out..." : "Sign Out"}</span>}
    </button>
  );
}
