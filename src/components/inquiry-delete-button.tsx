"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function InquiryDeleteButton({ inquiryId, inquiryName }: { inquiryId: string; inquiryName: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Permanently delete inquiry from ${inquiryName || "customer"}? This cannot be undone.`)) {
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(inquiryId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete inquiry");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting inquiry");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      title="Delete inquiry"
      style={{
        border: "none",
        background: "transparent",
        color: busy ? "#9ca3af" : "#ef4444",
        cursor: busy ? "not-allowed" : "pointer",
        padding: "6px",
        borderRadius: "6px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s, opacity 0.15s",
        opacity: busy ? 0.5 : 0.8,
      }}
      onMouseEnter={(e) => {
        if (!busy) (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)");
      }}
      onMouseLeave={(e) => {
        (e.currentTarget.style.backgroundColor = "transparent");
      }}
    >
      <Trash2 size={15} />
    </button>
  );
}
