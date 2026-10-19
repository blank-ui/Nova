"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, Coins } from "lucide-react";
import { useCurrency } from "./currency-provider";

export function CurrencySwitcher({
  className = "",
  style,
  compact = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}) {
  const { currency, setCurrency, currencies, currentCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block", ...style }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Current currency: ${currentCurrency.label}. Click to switch.`}
        aria-expanded={open}
        className={`currency-switcher-trigger ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: compact ? "6px 10px" : "6px 14px",
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
        <span style={{ fontSize: 13, lineHeight: 1 }}>{currentCurrency.flag}</span>
        <span style={{ fontWeight: 700 }}>{compact ? currentCurrency.shortLabel : currentCurrency.code}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Currency selection"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--card-bg, #141829)",
            border: "1px solid var(--border-hairline, var(--line))",
            borderRadius: 16,
            padding: 6,
            minWidth: 210,
            boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div
            style={{
              padding: "6px 12px 4px",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--muted, #8b92a5)",
            }}
          >
            Select Currency / मुद्रा
          </div>

          {currencies.map((curr) => {
            const isSelected = curr.code === currency;
            return (
              <button
                key={curr.code}
                type="button"
                role="menuitem"
                onClick={() => {
                  setCurrency(curr.code);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: isSelected ? "var(--lav, rgba(108,76,255,0.12))" : "transparent",
                  color: isSelected ? "var(--blue, #6C4CFF)" : "var(--ink, #ffffff)",
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "background-color 0.12s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 15 }}>{curr.flag}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700 }}>{curr.code}</span>
                      <span style={{ fontSize: 12, opacity: 0.8 }}>({curr.symbol})</span>
                    </div>
                  </div>
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
