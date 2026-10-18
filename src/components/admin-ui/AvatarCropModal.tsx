"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, ZoomIn, ZoomOut, Move, X, Check } from "lucide-react";
import { useToast } from "@/components/toast";

export interface AvatarCropModalProps {
  imageFile: File;
  userId?: string;
  onClose: () => void;
  onSuccess: (newAvatarUrl: string) => void;
}

export function AvatarCropModal({
  imageFile,
  userId,
  onClose,
  onSuccess,
}: AvatarCropModalProps) {
  const toast = useToast();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load file into memory
  useEffect(() => {
    if (!imageFile) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
      setError("Please choose a valid JPEG, PNG, or WebP image.");
      return;
    }

    if (imageFile.size > 2 * 1024 * 1024) {
      setError("Image file must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawPreview(img, 1, { x: 0, y: 0 });
      };
      img.src = src;
    };
    reader.readAsDataURL(imageFile);

    return () => {
      reader.abort();
    };
  }, [imageFile]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const drawPreview = useCallback(
    (img: HTMLImageElement, currentZoom: number, currentPan: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 256;
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);

      // Compute scale to cover square
      const minDimension = Math.min(img.width, img.height);
      const baseScale = size / minDimension;
      const scale = baseScale * currentZoom;

      const drawW = img.width * scale;
      const drawH = img.height * scale;

      const centerX = (size - drawW) / 2 + currentPan.x;
      const centerY = (size - drawH) / 2 + currentPan.y;

      // Draw image
      ctx.drawImage(img, centerX, centerY, drawW, drawH);
    },
    []
  );

  useEffect(() => {
    if (imageRef.current) {
      drawPreview(imageRef.current, zoom, pan);
    }
  }, [zoom, pan, drawPreview]);

  // Pan handlers
  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  }

  function handleTouchEnd() {
    setIsDragging(false);
  }

  async function handleSave() {
    if (!canvasRef.current) return;
    setSaving(true);
    setError(null);

    try {
      // Export canvas to 256x256 image/webp data URL
      const dataUrl = canvasRef.current.toDataURL("image/webp", 0.92);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          userId: userId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      toast.success("Profile photo updated!", "Saved");

      // Broadcast event so all avatars on page update instantly
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("nova:avatar-updated", {
            detail: {
              userId: data.userId,
              avatarUrl: data.avatarUrl,
            },
          })
        );
      }

      onSuccess(data.avatarUrl);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error saving avatar";
      setError(msg);
      toast.error(msg, "Upload Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-raised)",
          borderRadius: 24,
          width: "min(420px, 100%)",
          padding: 28,
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          border: "1px solid var(--border-hairline)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Header */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
              Reposition &amp; Crop
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted-crm)" }}>
              Drag to reposition, zoom to frame your photo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted-crm)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              background: "#fef2f2",
              color: "#dc2626",
              fontSize: 12,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Circular Crop Frame */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "relative",
            width: 220,
            height: 220,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 0 0 4px var(--surface-raised), 0 0 0 6px var(--border-hairline)",
            cursor: isDragging ? "grabbing" : "grab",
            background: "#141821",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />

          {/* Guide Overlay Overlay icon */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(0,0,0,0.5)",
              color: "#FFFFFF",
              borderRadius: "50%",
              padding: 4,
              pointerEvents: "none",
            }}
          >
            <Move size={12} />
          </div>
        </div>

        {/* Zoom Controls */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 24,
            padding: "0 10px",
          }}
        >
          <ZoomOut size={16} color="var(--text-muted-crm)" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            aria-label="Zoom photo"
            style={{
              flex: 1,
              accentColor: "var(--accent-blue)",
              cursor: "pointer",
            }}
          />
          <ZoomIn size={16} color="var(--text-muted-crm)" />
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 24 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border-hairline)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              background: "var(--ink-crm)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
