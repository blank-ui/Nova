"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/admin-ui";
import { useToast } from "@/components/toast";

export function InquiryDeleteButton({ inquiryId, inquiryName }: { inquiryId: string; inquiryName: string }) {
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function executeDelete() {
    setConfirmOpen(false);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(inquiryId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete inquiry");
      }
      toast.success(`Inquiry from ${inquiryName || "customer"} removed.`, "Inquiry Deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting inquiry", "Delete Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirmOpen(true);
        }}
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

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Customer Inquiry?"
        message={`Permanently delete inquiry from ${inquiryName || "customer"}? This action cannot be reversed.`}
        confirmLabel="Delete Inquiry"
        variant="danger"
        isBusy={busy}
        onConfirm={executeDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
