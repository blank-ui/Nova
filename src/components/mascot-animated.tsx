"use client";

import React, { useState, useEffect, useRef } from "react";

export interface AnimatedMascotProps {
  size?: number;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  speechBubbleText?: string;
  showBubbleOnHover?: boolean;
}

const HELPFUL_TIPS = [
  "⚡ Shipping websites at light speed",
  "🎯 Engineered for 100% Core Web Vitals",
  "🔒 Multi-role security & 2FA ready",
  "🛠️ Modern Next.js 15 & React 19 stack",
  "✨ Bespoke design with zero template bloat",
];

/**
 * Enhanced Nova Mascot:
 * - Natural idle floating & gentle breathing
 * - Autonomous organic blinking every 3.5-5 seconds
 * - Desktop pointer-tracking pupils (disabled on touch devices & reduced motion)
 * - Cheerful click reaction with sparkle pulse & speech bubble
 * - Fully accessible & prefers-reduced-motion safe
 */
export function AnimatedNovaMascot({
  size = 180,
  interactive = true,
  className = "",
  style,
  label = "Nova studio mascot, shipping websites at light speed",
  speechBubbleText,
  showBubbleOnHover = true,
}: AnimatedMascotProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion & fine pointer
  useEffect(() => {
    if (typeof window === "undefined") return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener?.("change", handleMotionChange);

    return () => motionQuery.removeEventListener?.("change", handleMotionChange);
  }, []);

  // Natural spontaneous blinking
  useEffect(() => {
    if (prefersReducedMotion) return;

    let timeoutId: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
      const nextInterval = 3200 + Math.random() * 2800;
      timeoutId = setTimeout(triggerBlink, nextInterval);
    };

    timeoutId = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeoutId);
  }, [prefersReducedMotion]);

  // Subtle pointer eye tracking on desktop only
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      // Clamp offset to a natural eye-box radius (max 3px horizontal, 2.5px vertical)
      const maxDistance = 450;
      const factorX = Math.max(-1, Math.min(1, dx / maxDistance));
      const factorY = Math.max(-1, Math.min(1, dy / maxDistance));

      setEyeOffset({
        x: Number((factorX * 3.2).toFixed(2)),
        y: Number((factorY * 2.4).toFixed(2)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion]);

  const handleClick = () => {
    if (!interactive) return;
    setIsClicked(true);
    setTipIndex((prev) => (prev + 1) % HELPFUL_TIPS.length);
    setTimeout(() => setIsClicked(false), 850);
  };

  const currentSpeech = speechBubbleText || HELPFUL_TIPS[tipIndex];

  return (
    <div
      ref={containerRef}
      role={interactive ? "button" : "img"}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setEyeOffset({ x: 0, y: 0 });
      }}
      className={`nova-mascot-container ${className}`}
      style={{
        display: "inline-block",
        position: "relative",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        outline: "none",
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 260 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`nova-mascot-svg ${isClicked ? "mascot-react-click" : ""} ${isHovered ? "mascot-hover" : "mascot-idle"}`}
        style={{
          display: "block",
          maxWidth: "100%",
          height: "auto",
          transform: isClicked
            ? "scale(1.08) translateY(-6px)"
            : isHovered
            ? "scale(1.03) translateY(-2px)"
            : "scale(1)",
          transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <defs>
          <radialGradient id="novaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6C4CFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6C4CFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background aura */}
        <circle cx="130" cy="135" r="95" fill="url(#novaGlow)" />
        <circle
          cx="130"
          cy="135"
          r="95"
          stroke="#6C4CFF"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.35"
          style={{
            animation: prefersReducedMotion ? "none" : "spin 32s linear infinite",
            transformOrigin: "130px 135px",
          }}
        />

        {/* Floating Code Chip: { } (Left) */}
        <g
          className="mascot-chip-left"
          transform="translate(18, 70)"
          style={{
            transition: "transform 0.3s ease",
            transform: isHovered ? "translate(15px, 66px)" : "translate(18px, 70px)",
          }}
        >
          <rect width="44" height="30" rx="8" fill="#101322" stroke="#67E8F9" strokeWidth="1.5" />
          <text
            x="22"
            y="20"
            textAnchor="middle"
            fill="#67E8F9"
            fontFamily="'DM Mono', monospace"
            fontSize="15"
            fontWeight="bold"
          >
            {"{ }"}
          </text>
        </g>

        {/* Floating Code Chip: </> (Right) */}
        <g
          className="mascot-chip-right"
          transform="translate(196, 60)"
          style={{
            transition: "transform 0.3s ease",
            transform: isHovered ? "translate(199px, 56px)" : "translate(196px, 60px)",
          }}
        >
          <rect width="46" height="30" rx="8" fill="#101322" stroke="#FFB547" strokeWidth="1.5" />
          <text
            x="23"
            y="20"
            textAnchor="middle"
            fill="#FFB547"
            fontFamily="'DM Mono', monospace"
            fontSize="14"
            fontWeight="bold"
          >
            {"</>"}
          </text>
        </g>

        {/* Tail with spade tip */}
        <g className="mascot-tail">
          <path
            d="M170 175 C195 180 205 160 198 140 C195 132 202 125 210 132"
            stroke="#6C4CFF"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M210 128 L218 135 L210 142 L206 135 Z" fill="#6C4CFF" />
        </g>

        {/* Body Group */}
        <g className="mascot-body-group">
          {/* Main Body */}
          <ellipse cx="130" cy="175" rx="46" ry="50" fill="#6C4CFF" />
          {/* Tummy */}
          <ellipse cx="130" cy="178" rx="28" ry="30" fill="#E8E2FF" />

          {/* Nova Starburst on chest */}
          <g transform="translate(130, 178) scale(0.24) translate(-50, -50)">
            <path
              d="M50 0 C50 32 32 50 0 50 C32 50 50 68 50 100 C50 68 68 50 100 50 C68 50 50 32 50 0 Z"
              fill="#FFB547"
            />
            <circle cx="50" cy="50" r="10" fill="#6C4CFF" />
          </g>

          {/* Feet */}
          <ellipse cx="106" cy="216" rx="14" ry="9" fill="#583CD6" />
          <ellipse cx="154" cy="216" rx="14" ry="9" fill="#583CD6" />

          {/* Arms */}
          <ellipse
            cx="88"
            cy="168"
            rx="11"
            ry="16"
            transform={isClicked ? "rotate(40 88 168)" : "rotate(20 88 168)"}
            fill="#583CD6"
            style={{ transition: "transform 0.2s ease" }}
          />
          <ellipse
            cx="172"
            cy="168"
            rx="11"
            ry="16"
            transform={isClicked ? "rotate(-40 172 168)" : "rotate(-20 172 168)"}
            fill="#583CD6"
            style={{ transition: "transform 0.2s ease" }}
          />
        </g>

        {/* Head Group */}
        <g
          className="mascot-head-group"
          style={{
            transform: isHovered ? "translateY(-2px)" : "none",
            transition: "transform 0.2s ease",
          }}
        >
          {/* Amber horns */}
          <path d="M110 82 L115 56 L124 78 Z" fill="#FFB547" />
          <path d="M150 82 L145 56 L136 78 Z" fill="#FFB547" />

          {/* Ears with cute perking on hover */}
          <g
            style={{
              transform: isHovered ? "rotate(-4deg) translateY(-2px)" : "none",
              transformOrigin: "96px 86px",
              transition: "transform 0.2s ease",
            }}
          >
            <circle cx="96" cy="86" r="19" fill="#6C4CFF" />
            <circle cx="96" cy="86" r="11" fill="#886EFF" />
          </g>
          <g
            style={{
              transform: isHovered ? "rotate(4deg) translateY(-2px)" : "none",
              transformOrigin: "164px 86px",
              transition: "transform 0.2s ease",
            }}
          >
            <circle cx="164" cy="86" r="19" fill="#6C4CFF" />
            <circle cx="164" cy="86" r="11" fill="#886EFF" />
          </g>

          {/* Main Head */}
          <circle cx="130" cy="116" r="42" fill="#6C4CFF" />

          {/* Cheeks */}
          <circle cx="98" cy="126" r="16" fill="#6C4CFF" />
          <circle cx="162" cy="126" r="16" fill="#6C4CFF" />

          {/* Muzzle */}
          <ellipse cx="130" cy="128" rx="18" ry="14" fill="#E8E2FF" />

          {/* Eyes with Blinking + Pointer Tracking */}
          {isBlinking ? (
            /* Closed eye arcs when blinking */
            <g className="mascot-eyes-blinking">
              <path d="M112 113 Q118 118 124 113" stroke="#101322" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M136 113 Q142 118 148 113" stroke="#101322" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g className="mascot-eyes">
              {/* Left Eye */}
              <circle cx={118 + eyeOffset.x} cy={113 + eyeOffset.y} r="6.5" fill="#101322" style={{ transition: "cx 0.08s ease, cy 0.08s ease" }} />
              <circle cx={120 + eyeOffset.x} cy={111 + eyeOffset.y} r="2.2" fill="#FFFFFF" style={{ transition: "cx 0.08s ease, cy 0.08s ease" }} />

              {/* Right Eye */}
              <circle cx={142 + eyeOffset.x} cy={113 + eyeOffset.y} r="6.5" fill="#101322" style={{ transition: "cx 0.08s ease, cy 0.08s ease" }} />
              <circle cx={144 + eyeOffset.x} cy={111 + eyeOffset.y} r="2.2" fill="#FFFFFF" style={{ transition: "cx 0.08s ease, cy 0.08s ease" }} />
            </g>
          )}

          {/* Nose */}
          <ellipse cx="130" cy="124" rx="5" ry="3.5" fill="#101322" />

          {/* Smile / Mouth */}
          <path
            d={isClicked ? "M122 126 Q130 137 138 126" : "M125 128 Q130 133 135 128"}
            stroke="#101322"
            strokeWidth={isClicked ? "3" : "2.5"}
            strokeLinecap="round"
            fill={isClicked ? "#FF6B8B" : "none"}
          />

          {/* Blush Cheeks */}
          <ellipse cx="106" cy="122" rx="6" ry="4" fill="#FFB547" opacity={isHovered || isClicked ? 1 : 0.85} />
          <ellipse cx="154" cy="122" rx="6" ry="4" fill="#FFB547" opacity={isHovered || isClicked ? 1 : 0.85} />
        </g>
      </svg>

      {/* Speech bubble indicator (shows on click or hover) */}
      {(isClicked || (showBubbleOnHover && isHovered)) && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            top: -18,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0E1118",
            color: "#A8FF7D",
            border: "1px solid rgba(168, 255, 125, 0.4)",
            padding: "5px 12px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "'DM Mono', monospace",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            zIndex: 10,
            pointerEvents: "none",
            animation: prefersReducedMotion ? "none" : "fadeInUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {currentSpeech}
        </div>
      )}
    </div>
  );
}
