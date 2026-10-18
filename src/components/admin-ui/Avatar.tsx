"use client";

import React from "react";

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  cameraButton?: React.ReactNode;
}

export function Avatar({
  src,
  name = "User",
  size = "md",
  className = "",
  cameraButton,
}: AvatarProps) {
  const initial = (name || "U").trim()[0]?.toUpperCase() || "U";

  const sizePx = size === "sm" ? 32 : size === "md" ? 44 : 104;
  const fontSize = size === "sm" ? 13 : size === "md" ? 17 : 42;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: sizePx,
        height: sizePx,
        borderRadius: "50%",
        flexShrink: 0,
        display: "inline-block",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={`${name || "User"}'s profile photo`}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            boxShadow: size === "lg" ? "0 0 0 4px var(--surface-raised)" : undefined,
          }}
        />
      ) : (
        <div
          aria-label={`${name || "User"}'s profile`}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "var(--brand-purple)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize,
            letterSpacing: "-0.02em",
            boxShadow: size === "lg" ? "0 0 0 4px var(--surface-raised)" : undefined,
            userSelect: "none",
          }}
        >
          {initial}
        </div>
      )}

      {cameraButton && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            zIndex: 3,
          }}
        >
          {cameraButton}
        </div>
      )}
    </div>
  );
}
