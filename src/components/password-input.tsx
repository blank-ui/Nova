"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { evaluatePasswordStrength } from "@/lib/password-policy";

interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  showStrengthMeter?: boolean;
  label?: string;
}

export function PasswordInput({
  id = "password",
  name = "password",
  value,
  onChange,
  placeholder = "6-12 characters, Aa#",
  autoComplete = "new-password",
  required = true,
  showStrengthMeter = true,
  label,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = evaluatePasswordStrength(value);

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {label && (
        <label htmlFor={id} className="auth-label" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{label}</span>
          {showStrengthMeter && value.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 600, color: strength.color }}>
              {strength.label}
            </span>
          )}
        </label>
      )}

      <div style={{ position: "relative" }}>
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={6}
          maxLength={128}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="field"
          style={{ paddingRight: 44, width: "100%" }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="visibility-button"
          tabIndex={-1}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            display: "grid",
            placeItems: "center",
            padding: 4,
          }}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showStrengthMeter && (
        <div style={{ marginTop: 2 }}>
          {/* Strength bar */}
          <div
            style={{
              height: 4,
              borderRadius: 99,
              background: "var(--line, #e2e8f0)",
              overflow: "hidden",
              display: "flex",
              gap: 3,
            }}
          >
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: "100%",
                  background: step <= strength.score ? strength.color : "transparent",
                  transition: "background 0.2s ease",
                  borderRadius: 99,
                }}
              />
            ))}
          </div>

          {/* Checklist criteria */}
          {value.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "4px 8px",
                marginTop: 8,
                padding: "8px 10px",
                borderRadius: 8,
                background: "var(--paper, #fafafa)",
                border: "1px solid var(--line, #eee)",
              }}
            >
              {strength.requirements.map((req) => (
                <div
                  key={req.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: req.met ? "#10b981" : "var(--muted, #64748b)",
                    fontWeight: req.met ? 600 : 400,
                  }}
                >
                  {req.met ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    <X size={12} strokeWidth={2} style={{ opacity: 0.6 }} />
                  )}
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
