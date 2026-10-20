"use client";

import React, { useState, useEffect } from "react";
import { AvatarMenu } from "./AvatarMenu";

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  userId?: string;
  className?: string;
  cameraButton?: React.ReactNode;
  editable?: boolean;
  onAvatarChanged?: (newUrl: string | null) => void;
}

export function Avatar({
  src,
  name = "User",
  size = "md",
  userId,
  className = "",
  cameraButton,
  editable = false,
  onAvatarChanged,
}: AvatarProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || null);
    setImageError(false);
  }, [src]);

  // Listen to cross-component live avatar update events
  useEffect(() => {
    function handleAvatarEvent(e: Event) {
      const customEvent = e as CustomEvent<{ userId?: string; avatarUrl: string | null }>;
      if (!customEvent.detail) return;
      if (!userId || customEvent.detail.userId === userId) {
        setCurrentSrc(customEvent.detail.avatarUrl);
        setImageError(false);
        onAvatarChanged?.(customEvent.detail.avatarUrl);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("nova:avatar-updated", handleAvatarEvent);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("nova:avatar-updated", handleAvatarEvent);
      }
    };
  }, [userId, onAvatarChanged]);

  const initial = (name || "U").trim()[0]?.toUpperCase() || "U";
  const sizePx = size === "sm" ? 32 : size === "md" ? 44 : 104;
  const fontSize = size === "sm" ? 13 : size === "md" ? 17 : 42;

  const showCamera = cameraButton || (editable && size === "lg");
  const hasValidImage = Boolean(currentSrc && !imageError);

  return (
    <div
      className={`avatar-wrapper ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      style={{
        position: "relative",
        width: sizePx,
        height: sizePx,
        borderRadius: "50%",
        flexShrink: 0,
        display: "inline-block",
      }}
    >
      {hasValidImage ? (
        <img
          src={currentSrc!}
          alt={`${name || "User"}'s profile photo`}
          onError={() => setImageError(true)}
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
          aria-label={`${name || "User"}'s profile photo`}
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

      {/* Camera button anchor for lg ProfileCard avatars */}
      {showCamera && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            zIndex: 3,
            opacity: isHovered || cameraButton ? 1 : 0.85,
            transition: "opacity 0.15s ease",
          }}
        >
          {cameraButton || (
            <AvatarMenu
              currentAvatarUrl={currentSrc}
              userId={userId}
              userName={name || "User"}
              onAvatarChanged={(newUrl) => {
                setCurrentSrc(newUrl);
                setImageError(false);
                onAvatarChanged?.(newUrl);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
