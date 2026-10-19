"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  User,
  Trash2,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  Badge,
  DetailRow,
  DataTable,
  EmptyState,
} from "@/components/admin-ui";
import { InquiryDeleteButton } from "@/components/inquiry-delete-button";

export interface InquiryRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  company?: string | null;
  service: string;
  budget?: string | null;
  message: string;
  referenceUrl?: string | null;
  referenceImage?: string | null;
  status: string;
  createdAt: string;
}

export interface AdminInquiriesCRMProps {
  inquiries: InquiryRow[];
  totalCount: number;
  newCount: number;
  qualifiedCount: number;
  currentStatus?: string;
  currentSearch?: string;
}

export function AdminInquiriesCRM({
  inquiries,
  totalCount,
  newCount,
  qualifiedCount,
  currentStatus = "",
  currentSearch = "",
}: AdminInquiriesCRMProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    inquiries[0]?.id || null
  );

  const selectedInquiry =
    inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0] || null;

  const filterTabs = [
    { label: "All Inquiries", value: "" },
    { label: "New", value: "NEW" },
    { label: "Contacted", value: "CONTACTED" },
    { label: "Qualified", value: "QUALIFIED" },
    { label: "Proposal Sent", value: "PROPOSAL_SENT" },
    { label: "Converted", value: "CONVERTED" },
    { label: "Closed", value: "CLOSED" },
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    router.push(`/admin/inquiry?${params.toString()}`);
  }

  function handleFilterClick(statusVal: string) {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (statusVal) {
      params.set("status", statusVal);
    } else {
      params.delete("status");
    }
    router.push(`/admin/inquiry?${params.toString()}`);
  }

  const columns = [
    {
      key: "ref",
      header: "Reference",
      width: "100px",
      render: (row: InquiryRow) => (
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--accent-blue)",
            fontWeight: 700,
          }}
        >
          {row.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: "client",
      header: "Client & Company",
      width: "minmax(200px, 1.4fr)",
      render: (row: InquiryRow) => (
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {row.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted-crm)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {row.company || row.email}
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service & Budget",
      width: "minmax(180px, 1.2fr)",
      render: (row: InquiryRow) => (
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {row.service}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted-crm)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {row.budget || "Custom scope"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (row: InquiryRow) => {
        const variantMap: Record<string, "warning" | "info" | "success" | "neutral"> = {
          NEW: "warning",
          QUALIFIED: "info",
          CONTACTED: "neutral",
          PROPOSAL_SENT: "info",
          CONVERTED: "success",
          CLOSED: "neutral",
        };
        return <Badge variant={variantMap[row.status] || "neutral"}>{row.status}</Badge>;
      },
    },
    {
      key: "created",
      header: "Submitted",
      width: "100px",
      render: (row: InquiryRow) => (
        <span style={{ fontSize: 11, color: "var(--text-muted-crm)", fontWeight: 600 }}>
          {new Date(row.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "120px",
      align: "right" as const,
      render: (row: InquiryRow) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <Link
            href={`/admin/inquiry/${row.id}`}
            style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              background: "var(--subtle-fill)",
              color: "var(--text-primary)",
              fontSize: 11,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Profile
          </Link>
          <InquiryDeleteButton inquiryId={row.id} inquiryName={row.name} />
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Page Header with Headline Stats Strip */}
      <PageHeader
        titleLine1="Customer"
        titleLine2="Inquiries"
        backHref="/admin"
        stats={[
          {
            icon: <MessageSquare size={18} strokeWidth={1.8} />,
            value: newCount,
            badgeLabel: "New",
            badgeVariant: "warning",
            caption: "Awaiting initial review",
          },
          {
            icon: <CheckCircle2 size={18} strokeWidth={1.8} />,
            value: qualifiedCount,
            badgeLabel: "Qualified",
            badgeVariant: "info",
            caption: "Ready for scoping",
          },
          {
            icon: <Clock size={18} strokeWidth={1.8} />,
            value: totalCount,
            badgeLabel: "Total",
            badgeVariant: "neutral",
            caption: "Logged submissions",
          },
        ]}
      />

      {/* Filter Chips Bar & Search Form */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {/* Filter Pills */}
        <div className="crm-filter-pills" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {filterTabs.map((tab) => {
            const isSelected = (!currentStatus && tab.value === "") || currentStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleFilterClick(tab.value)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? "none" : "1px solid var(--border-hairline)",
                  background: isSelected ? "var(--ink-crm)" : "var(--surface-raised)",
                  color: isSelected ? "var(--ink-crm-text, #FFFFFF)" : "var(--text-secondary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="crm-search-form"
          style={{ display: "flex", gap: 8, flex: "1 1 240px", minWidth: 0 }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted-crm)",
                pointerEvents: "none",
              }}
            />
            <input
              type="search"
              placeholder="Search name, email, company..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px 8px 34px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-raised)",
                color: "var(--text-primary)",
                fontSize: 12,
                outline: "none",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0 16px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              background: "var(--ink-crm)",
              color: "var(--ink-crm-text, #FFFFFF)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Main 2-Column Grid: DataTable Left 65% / Detail Panel Right 35% */}
      <div
        className="inquiries-layout-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.8fr) minmax(320px, 1fr)",
          gap: 20,
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* Left Column: Inquiries DataTable */}
        <div>
          <SectionCard
            title={`Lead Inquiries (${inquiries.length})`}
            showDefaultActions
            openHref="/admin/projects"
          >
            <DataTable
              columns={columns}
              data={inquiries}
              keyExtractor={(row) => row.id}
              minWidth={740}
              onRowClick={(row) => setSelectedInquiryId(row.id)}
              onRowDoubleClick={(row) => router.push(`/admin/inquiry/${row.id}`)}
              emptyState={
                <EmptyState
                  icon={<MessageSquare size={24} />}
                  title="No inquiries match this criteria"
                  description="Try adjusting your status filter or search query to find matching customer submissions."
                />
              }
            />
          </SectionCard>
        </div>

        {/* Right Column: Lead Detail Panel */}
        <div>
          {selectedInquiry ? (
            <SectionCard
              title="Inquiry Details"
              headerRight={
                <Link
                  href={`/admin/inquiry/${selectedInquiry.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--accent-blue)",
                    textDecoration: "none",
                  }}
                >
                  Full Profile <ExternalLink size={12} />
                </Link>
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* DetailRow: Name */}
                <DetailRow
                  icon={<User size={16} strokeWidth={1.8} />}
                  label="Client Name"
                  value={selectedInquiry.name}
                  action={
                    <Badge variant={selectedInquiry.status === "NEW" ? "warning" : "info"}>
                      {selectedInquiry.status}
                    </Badge>
                  }
                />

                {/* DetailRow: Email */}
                <DetailRow
                  icon={<Mail size={16} strokeWidth={1.8} />}
                  label="Email Address"
                  value={selectedInquiry.email}
                />

                {/* DetailRow: Phone */}
                {selectedInquiry.phone && (
                  <DetailRow
                    icon={<Phone size={16} strokeWidth={1.8} />}
                    label="Phone Number"
                    value={
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        style={{ color: "var(--accent-blue)", textDecoration: "none" }}
                      >
                        {selectedInquiry.phone}
                      </a>
                    }
                  />
                )}

                {/* DetailRow: Date of Birth */}
                {selectedInquiry.dateOfBirth && (
                  <DetailRow
                    icon={<Calendar size={16} strokeWidth={1.8} />}
                    label="Date of Birth"
                    value={selectedInquiry.dateOfBirth}
                  />
                )}

                {/* DetailRow: Service */}
                <DetailRow
                  icon={<Briefcase size={16} strokeWidth={1.8} />}
                  label="Requested Service"
                  value={selectedInquiry.service}
                />

                {/* DetailRow: Budget */}
                <DetailRow
                  icon={<DollarSign size={16} strokeWidth={1.8} />}
                  label="Project Budget"
                  value={selectedInquiry.budget || "Custom Scope"}
                />

                {/* DetailRow: Company */}
                {selectedInquiry.company && (
                  <DetailRow
                    icon={<Building size={16} strokeWidth={1.8} />}
                    label="Company Name"
                    value={selectedInquiry.company}
                  />
                )}

                {/* Message Box */}
                <div
                  style={{
                    marginTop: 8,
                    padding: "14px 16px",
                    borderRadius: "var(--radius-row)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-hairline-light)",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted-crm)", marginBottom: 6 }}>
                    Submission Brief
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    {selectedInquiry.message}
                  </p>
                </div>

                {/* Reference Material if available */}
                {(selectedInquiry.referenceUrl || selectedInquiry.referenceImage) && (
                  <div
                    style={{
                      background: "var(--card-bg-crm, var(--surface-raised))",
                      border: "1px solid var(--border-hairline, var(--line))",
                      borderRadius: 12,
                      padding: "12px",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue, #6C4CFF)", textTransform: "uppercase" }}>
                      Reference &amp; Inspiration
                    </div>
                    {selectedInquiry.referenceUrl && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          🔗 {selectedInquiry.referenceUrl}
                        </span>
                        <a
                          href={selectedInquiry.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 11, color: "var(--accent-blue)", fontWeight: 700, flexShrink: 0, textDecoration: "underline" }}
                        >
                          Visit &rarr;
                        </a>
                      </div>
                    )}
                    {selectedInquiry.referenceImage && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                        <img
                          src={selectedInquiry.referenceImage}
                          alt="Reference mockup"
                          style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", border: "1px solid var(--line)" }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>Uploaded Asset</div>
                          <a
                            href={selectedInquiry.referenceImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 11, color: "var(--accent-blue)", textDecoration: "underline" }}
                          >
                            View image &rarr;
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Link Button */}
                <Link
                  href={`/admin/inquiry/${selectedInquiry.id}`}
                  style={{
                    marginTop: 12,
                    padding: "11px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--ink-crm)",
                    color: "var(--ink-crm-text, #FFFFFF)",
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: "center",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  Manage Lead &amp; Project Workspace &rarr;
                </Link>
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Inquiry Details">
              <EmptyState
                icon={<User size={20} />}
                title="No Lead Selected"
                description="Select an inquiry from the table to preview client brief and contact information."
              />
            </SectionCard>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1040px) {
          .inquiries-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
