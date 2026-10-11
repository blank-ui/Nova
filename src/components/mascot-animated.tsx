"use client";

import React, { useState } from "react";

export interface AnimatedMascotProps {
  size?: number;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

/**
 * Animated Nova Mascot:
 * - Idle: gentle breathing / floating motion, organic tail swish
 * - Expressive hover: ears perk, eyes gleam, playful reaction
 * - Interactive click: cheerful jump + sparkle pulse
 * - prefers-reduced-motion safe
 */
export function AnimatedNovaMascot({
  size = 180,
  interactive = true,
  className = "",
  style,
  label = "Nova mascot, shipping websites at light speed",
}: AnimatedMascotProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!interactive) return;
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 800);
  };

  return (
    <div
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
      onMouseLeave={() => setIsHovered(false)}
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
          transition: "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <defs>
          <radialGradient id="novaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6C4CFF" stopOpacity="0.3" />
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
          className="mascot-orbit-ring"
        />

        {/* Floating Code Chip: { } (Left) */}
        <g className="mascot-chip-left" transform="translate(18, 70)">
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
        <g className="mascot-chip-right" transform="translate(196, 60)">
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
          <ellipse cx="88" cy="168" rx="11" ry="16" transform="rotate(20 88 168)" fill="#583CD6" />
          <ellipse cx="172" cy="168" rx="11" ry="16" transform="rotate(-20 172 168)" fill="#583CD6" />
        </g>

        {/* Head Group (Breathing & Tilting) */}
        <g className="mascot-head-group">
          {/* Amber horns */}
          <path d="M110 82 L115 56 L124 78 Z" fill="#FFB547" className="mascot-horn-left" />
          <path d="M150 82 L145 56 L136 78 Z" fill="#FFB547" className="mascot-horn-right" />

          {/* Ears */}
          <g className="mascot-ear-left">
            <circle cx="96" cy="86" r="19" fill="#6C4CFF" />
            <circle cx="96" cy="86" r="11" fill="#886EFF" />
          </g>
          <g className="mascot-ear-right">
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

          {/* Eyes (Blinking animation) */}
          <g className="mascot-eyes">
            <circle cx="118" cy="113" r="6.5" fill="#101322" />
            <circle cx="120" cy="111" r="2.2" fill="#FFFFFF" />
            <circle cx="142" cy="113" r="6.5" fill="#101322" />
            <circle cx="144" cy="111" r="2.2" fill="#FFFFFF" />
          </g>

          {/* Nose */}
          <ellipse cx="130" cy="124" rx="5" ry="3.5" fill="#101322" />

          {/* Smile / Mouth */}
          <path
            d={isClicked ? "M124 126 Q130 135 136 126" : "M125 128 Q130 133 135 128"}
            stroke="#101322"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Blush Cheeks */}
          <ellipse cx="106" cy="122" rx="6" ry="4" fill="#FFB547" opacity={isHovered ? 1 : 0.85} />
          <ellipse cx="154" cy="122" rx="6" ry="4" fill="#FFB547" opacity={isHovered ? 1 : 0.85} />
        </g>
      </svg>

      {/* Interactive reaction tooltip pill */}
      {isClicked && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ink, #101322)",
            color: "var(--amber, #FFB547)",
            padding: "4px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            animation: "mascotPop 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          ✦ Ready to ship! ✦
        </div>
      )}
    </div>
  );
}
