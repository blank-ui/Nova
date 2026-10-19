"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "./language-provider";

export function LanguageSwitcher({
  className = "",
  style,
  compact = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}) {
  const { locale, setLocale, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block", ...style }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Current language: ${currentLang.label}. Click to switch.`}
        aria-expanded={open}
        className={`lang-switcher-trigger ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: compact ? "6px 8px" : "6px 12px",
          borderRadius: 999,
          border: "1px solid var(--border-hairline, var(--line))",
          background: "var(--surface-raised, var(--paper))",
          color: "var(--text-primary, var(--ink))",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
          minHeight: 36,
        }}
      >
        <Globe size={14} style={{ color: "var(--blue, #6C4CFF)", flexShrink: 0 }} />
        <span>{currentLang.flag}</span>
        <span>{compact ? currentLang.shortLabel : currentLang.label}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Language selection"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--card-bg, #141829)",
            border: "1px solid var(--border-hairline, var(--line))",
            borderRadius: 14,
            padding: 6,
            minWidth: 160,
            boxShadow: "0 12px 32px rgba(0,0,0,0.24)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLocale(lang.code);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: isSelected ? "var(--lav, rgba(108,76,255,0.12))" : "transparent",
                  color: isSelected ? "var(--blue, #6C4CFF)" : "var(--ink, #ffffff)",
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "background-color 0.1s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
                {isSelected && <Check size={14} style={{ color: "var(--blue, #6C4CFF)" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
