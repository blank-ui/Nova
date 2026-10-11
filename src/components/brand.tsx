import React from "react";

/**
 * Nova Brand Logo Mark (Starburst 4-point star with Spark Amber center dot)
 * Colors: Nova Violet (#6C4CFF) and Spark Amber (#FFB547)
 */
export function NovaMark({
  size = 28,
  starColor = "#6C4CFF",
  dotColor = "#FFB547",
  className,
  style,
}: {
  size?: number;
  starColor?: string;
  dotColor?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* 4-point curved Nova starburst */}
      <path
        d="M50 0 C50 32 32 50 0 50 C32 50 50 68 50 100 C50 68 68 50 100 50 C68 50 50 32 50 0 Z"
        fill={starColor}
      />
      {/* Spark Amber center dot */}
      <circle cx="50" cy="50" r="12" fill={dotColor} />
    </svg>
  );
}

/**
 * Full Nova Wordmark with Nova Star Mark and "WEB DEVELOPMENT STUDIO" tagline
 */
export function NovaLogo({
  size = 32,
  markColor = "#6C4CFF",
  dotColor = "#FFB547",
  textColor = "currentColor",
  withTagline = false,
  taglineColor = "#727988",
}: {
  size?: number;
  markColor?: string;
  dotColor?: string;
  textColor?: string;
  withTagline?: boolean;
  taglineColor?: string;
}) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: withTagline ? 3 : 0 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.38 }}>
        <NovaMark size={size} starColor={markColor} dotColor={dotColor} />
        <span
          style={{
            fontFamily: "Manrope, sans-serif",
            fontWeight: 800,
            fontSize: size * 0.88,
            letterSpacing: "-0.04em",
            color: textColor,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          NOVA
        </span>
      </div>
      {withTagline && (
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: Math.max(9, Math.round(size * 0.28)),
            letterSpacing: "0.14em",
            color: taglineColor,
            textTransform: "uppercase",
            paddingLeft: size * 1.38,
            fontWeight: 500,
          }}
        >
          WEB DEVELOPMENT STUDIO
        </span>
      )}
    </div>
  );
}

/**
 * Nova Mascot Avatar Head - "A fluffy little bear cub with tiny demon horns who ships websites at light speed"
 * Violet fur (#6C4CFF), Amber horns (#FFB547), big dark eyes, round muzzle
 */
export function NovaMascotAvatar({
  size = 40,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", borderRadius: "50%", flexShrink: 0, ...style }}
      aria-label="Nova mascot avatar"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="#101322" />

      {/* Amber horns */}
      <path d="M34 32 L38 16 L44 30 Z" fill="#FFB547" />
      <path d="M66 32 L62 16 L56 30 Z" fill="#FFB547" />

      {/* Fluffy round bear ears */}
      <circle cx="28" cy="34" r="14" fill="#6C4CFF" />
      <circle cx="28" cy="34" r="8" fill="#886EFF" />
      <circle cx="72" cy="34" r="14" fill="#6C4CFF" />
      <circle cx="72" cy="34" r="8" fill="#886EFF" />

      {/* Head */}
      <circle cx="50" cy="55" r="32" fill="#6C4CFF" />

      {/* Fluffy cheeks / face bumps */}
      <circle cx="30" cy="62" r="12" fill="#6C4CFF" />
      <circle cx="70" cy="62" r="12" fill="#6C4CFF" />

      {/* Muzzle (lighter violet / paper tint) */}
      <ellipse cx="50" cy="64" rx="14" ry="11" fill="#E8E2FF" />

      {/* Big dark eyes with cute sparkle */}
      <circle cx="41" cy="52" r="5" fill="#101322" />
      <circle cx="42.5" cy="50.5" r="1.8" fill="#FFFFFF" />
      <circle cx="59" cy="52" r="5" fill="#101322" />
      <circle cx="60.5" cy="50.5" r="1.8" fill="#FFFFFF" />

      {/* Cute nose */}
      <ellipse cx="50" cy="61" rx="4" ry="3" fill="#101322" />

      {/* Smile */}
      <path
        d="M46 64 Q50 68 54 64"
        stroke="#101322"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Rosy blush cheeks */}
      <ellipse cx="34" cy="58" rx="4.5" ry="3" fill="#FFB547" opacity="0.85" />
      <ellipse cx="66" cy="58" rx="4.5" ry="3" fill="#FFB547" opacity="0.85" />
    </svg>
  );
}

/**
 * Full Nova Mascot with floating code chips ({ } and </>), spade-tipped tail, and Nova chest star
 */
export function NovaMascotFull({
  width = 240,
  height = 240,
  className,
  style,
}: {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", maxWidth: "100%", height: "auto", ...style }}
      aria-label="Nova mascot"
    >
      {/* Soft circular background glow */}
      <circle cx="130" cy="135" r="95" stroke="#6C4CFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />

      {/* Floating code chips */}
      {/* Left chip: { } */}
      <g transform="translate(18, 70)">
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

      {/* Right chip: </> */}
      <g transform="translate(196, 60)">
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
      <path
        d="M170 175 C195 180 205 160 198 140 C195 132 202 125 210 132"
        stroke="#6C4CFF"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Spade tip */}
      <path
        d="M210 128 L218 135 L210 142 L206 135 Z"
        fill="#6C4CFF"
      />

      {/* Mascot Body & Belly */}
      <ellipse cx="130" cy="175" rx="46" ry="50" fill="#6C4CFF" />
      {/* Tummy (lighter soft violet / lavender) */}
      <ellipse cx="130" cy="178" rx="28" ry="30" fill="#E8E2FF" />

      {/* Nova mark on chest! Amber star */}
      <g transform="translate(130, 178) scale(0.24) translate(-50, -50)">
        <path
          d="M50 0 C50 32 32 50 0 50 C32 50 50 68 50 100 C50 68 68 50 100 50 C68 50 50 32 50 0 Z"
          fill="#FFB547"
        />
        <circle cx="50" cy="50" r="10" fill="#6C4CFF" />
      </g>

      {/* Feet / Paws */}
      <ellipse cx="106" cy="216" rx="14" ry="9" fill="#583CD6" />
      <ellipse cx="154" cy="216" rx="14" ry="9" fill="#583CD6" />

      {/* Arms / Front Paws */}
      <ellipse cx="88" cy="168" rx="11" ry="16" transform="rotate(20 88 168)" fill="#583CD6" />
      <ellipse cx="172" cy="168" rx="11" ry="16" transform="rotate(-20 172 168)" fill="#583CD6" />

      {/* Head Group */}
      {/* Amber horns */}
      <path d="M110 82 L115 56 L124 78 Z" fill="#FFB547" />
      <path d="M150 82 L145 56 L136 78 Z" fill="#FFB547" />

      {/* Ears */}
      <circle cx="96" cy="86" r="19" fill="#6C4CFF" />
      <circle cx="96" cy="86" r="11" fill="#886EFF" />
      <circle cx="164" cy="86" r="19" fill="#6C4CFF" />
      <circle cx="164" cy="86" r="11" fill="#886EFF" />

      {/* Main Head */}
      <circle cx="130" cy="116" r="42" fill="#6C4CFF" />

      {/* Fluffy cheek bumps */}
      <circle cx="98" cy="126" r="16" fill="#6C4CFF" />
      <circle cx="162" cy="126" r="16" fill="#6C4CFF" />

      {/* Muzzle */}
      <ellipse cx="130" cy="128" rx="18" ry="14" fill="#E8E2FF" />

      {/* Eyes */}
      <circle cx="118" cy="113" r="6.5" fill="#101322" />
      <circle cx="120" cy="111" r="2.2" fill="#FFFFFF" />
      <circle cx="142" cy="113" r="6.5" fill="#101322" />
      <circle cx="144" cy="111" r="2.2" fill="#FFFFFF" />

      {/* Nose */}
      <ellipse cx="130" cy="124" rx="5" ry="3.5" fill="#101322" />

      {/* Smile */}
      <path
        d="M125 128 Q130 133 135 128"
        stroke="#101322"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheeks */}
      <ellipse cx="106" cy="122" rx="6" ry="4" fill="#FFB547" opacity="0.85" />
      <ellipse cx="154" cy="122" rx="6" ry="4" fill="#FFB547" opacity="0.85" />
    </svg>
  );
}

export { AnimatedNovaMascot } from "@/components/mascot-animated";

