"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InquiryStatus } from "@prisma/client";
import { ConfirmModal } from "@/components/admin-ui";
import { useToast } from "@/components/toast";

interface StatusUpdateFormProps {
  inquiryId: string;
  currentStatus: InquiryStatus;
}

const ALL_STATUSES: InquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "CONVERTED",
  "CLOSED",
];

export function StatusUpdateForm({ inquiryId, currentStatus }: StatusUpdateFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState<InquiryStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === currentStatus) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(inquiryId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setMessage({ type: "success", text: "Status updated successfully." });
      toast.success(`Inquiry status updated to ${status}.`, "Status Saved");
      router.refresh();
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setMessage({ type: "error", text: errMessage });
      toast.error(errMessage, "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    setConfirmDeleteOpen(false);
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(inquiryId)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete inquiry");
      }

      toast.success("Inquiry permanently removed.", "Deleted");
      router.push("/admin/inquiry");
      router.refresh();
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setMessage({ type: "error", text: errMessage });
      toast.error(errMessage, "Delete Failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InquiryStatus)}
            disabled={loading}
            className="field"
            style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, flex: 1 }}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || status === currentStatus}
            className="button"
            style={{ padding: "8px 16px", fontSize: 13 }}
          >
            {loading ? "Updating..." : "Update Status"}
          </button>

          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={loading}
            className="button button-outline"
            style={{
              padding: "9px 16px",
              color: "#dc2626",
              borderColor: "rgba(220, 38, 38, 0.3)",
              background: "rgba(220, 38, 38, 0.05)",
              marginLeft: "auto",
            }}
            title="Permanently remove this inquiry"
          >
            Delete Inquiry
          </button>
        </div>

        {message && (
          <div
            role="status"
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              backgroundColor: message.type === "success" ? "#e6f9ed" : "#fde8e8",
              color: message.type === "success" ? "#1e4620" : "#9b1c1c",
              border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#f8b4b4"}`,
            }}
          >
            {message.text}
          </div>
        )}
      </form>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Permanently Delete Inquiry?"
        message="Are you sure you want to permanently delete this inquiry? This action cannot be undone."
        confirmLabel="Delete Inquiry"
        variant="danger"
        isBusy={loading}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
