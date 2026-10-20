"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FAQItem {
  q: string;
  a: string;
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="nova-card"
            style={{
              padding: "20px 26px",
              borderColor: isOpen ? "var(--pub-line-highlight)" : "var(--pub-line)",
              background: isOpen ? "var(--pub-surface-hover)" : "var(--pub-surface-card)",
              transition: "all 0.22s ease",
            }}
          >
            <button
              type="button"
              className="nova-faq-btn"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
              id={`faq-question-${index}`}
            >
              <span>{item.q}</span>
              <ChevronDown
                size={18}
                className="nova-faq-chevron"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  color: isOpen ? "var(--pub-violet)" : "var(--pub-muted)",
                }}
              />
            </button>
            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              style={{
                display: isOpen ? "block" : "none",
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid var(--pub-line-subtle)",
                fontSize: 14,
                lineHeight: 1.75,
                color: "var(--pub-muted)",
              }}
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
