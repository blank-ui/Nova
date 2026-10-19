"use client";

import { useState } from "react";
import { ExternalLink, Maximize2, X, Sparkles, FolderGit2 } from "lucide-react";

export interface GalleryItemData {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category: string;
  repoName?: string | null;
  projectUrl?: string | null;
}

export function ScreenshotGallery({ initialItems }: { initialItems: GalleryItemData[] }) {
  const [items] = useState<GalleryItemData[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeModalItem, setActiveModalItem] = useState<GalleryItemData | null>(null);

  const categories = ["ALL", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = selectedCategory === "ALL" ? items : items.filter((i) => i.category === selectedCategory);

  if (items.length === 0) return null;

  return (
    <section style={{ margin: "40px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--blue)", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={14} /> Design & Build Showcase
          </div>
          <h2 style={{ fontSize: 26, letterSpacing: "-.04em", margin: "6px 0 0", color: "var(--ink)" }}>
            Project Screenshots & Prototyping
          </h2>
        </div>

        {/* Category Pill Filters */}
        {categories.length > 2 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  border: selectedCategory === cat ? "1px solid var(--blue)" : "1px solid var(--line)",
                  background: selectedCategory === cat ? "rgba(108, 76, 255, 0.1)" : "var(--paper)",
                  color: selectedCategory === cat ? "var(--blue)" : "var(--muted)",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div
        className="screenshot-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 20,
        }}
      >
        {filtered.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className="card card-hover-glow"
            style={{
              overflow: "hidden",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            onClick={() => setActiveModalItem(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveModalItem(item);
              }
            }}
          >
            <div>
              <div
                style={{
                  position: "relative",
                  height: 220,
                  width: "100%",
                  background: "var(--paper)",
                  overflow: "hidden",
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />

                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "rgba(16,19,34,0.78)",
                    color: "#fff",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {item.category}
                </span>

                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "rgba(16,19,34,0.7)",
                    backdropFilter: "blur(4px)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Maximize2 size={14} />
                </div>
              </div>

              <div style={{ padding: "18px 20px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "var(--ink)" }}>
                  {item.title}
                </h3>
                {item.description && (
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                )}
                {item.repoName && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--blue)", fontWeight: 600 }}>
                    <FolderGit2 size={12} /> {item.repoName}
                  </div>
                )}
              </div>
            </div>

            {item.projectUrl && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line)" }}>
                <a
                  href={item.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 12, color: "var(--blue)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}
                >
                  <span>Open Prototype</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox / Zoom modal */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          onClick={() => setActiveModalItem(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveModalItem(null);
          }}
          className="modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16, 19, 34, 0.88)",
            backdropFilter: "blur(10px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "16px",
          }}
        >
          <div
            role="document"
            tabIndex={0}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            style={{
              maxWidth: 900,
              width: "100%",
              borderRadius: 16,
              background: "var(--paper)",
              overflow: "hidden",
              border: "1px solid var(--line)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ position: "relative", maxHeight: "68vh", overflow: "hidden", background: "#000" }}>
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.title}
                style={{ width: "100%", maxHeight: "68vh", objectFit: "contain", display: "block" }}
              />
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  background: "rgba(0,0,0,0.65)",
                  border: "none",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="eyebrow" style={{ color: "var(--blue)" }}>
                  {activeModalItem.category}
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: "4px 0 2px", color: "var(--ink)" }}>
                  {activeModalItem.title}
                </h3>
                {activeModalItem.description && (
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
                    {activeModalItem.description}
                  </p>
                )}
              </div>

              {activeModalItem.projectUrl && (
                <a
                  href={activeModalItem.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13 }}
                >
                  <span>Visit Live Prototype</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .screenshot-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
