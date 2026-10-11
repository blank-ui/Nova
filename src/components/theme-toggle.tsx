"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className || ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: "50%",
        border: "1px solid var(--line, #e6e5de)",
        background: "var(--card-bg, #ffffff)",
        color: "var(--ink, #101322)",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        outline: "none",
        ...style,
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun size={17} style={{ color: "#FFB547" }} />
      ) : (
        <Moon size={17} style={{ color: "#6C4CFF" }} />
      )}
    </button>
  );
}
