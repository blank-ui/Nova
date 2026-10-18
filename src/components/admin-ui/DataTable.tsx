import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  render: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  onRowClick,
  className = "",
  style,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div style={style}>{emptyState}</div>;
  }

  return (
    <div
      className={`data-table-container ${className}`}
      style={{
        width: "100%",
        overflowX: "auto",
        ...style,
      }}
    >
      <div
        style={{
          minWidth: 540,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
            padding: "8px 16px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--text-muted-crm)",
          }}
        >
          {columns.map((c) => (
            <div key={c.key} style={{ textAlign: c.align || "left" }}>
              {c.header}
            </div>
          ))}
        </div>

        {/* Table Rows: #F7F8FA background, 16px radius */}
        {data.map((row, idx) => (
          <div
            key={keyExtractor(row, idx)}
            onClick={() => onRowClick?.(row)}
            className="data-table-row"
            style={{
              display: "grid",
              gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
              alignItems: "center",
              padding: "14px 16px",
              borderRadius: "var(--radius-row)",
              background: "var(--surface-raised)",
              border: "1px solid var(--border-hairline-light)",
              cursor: onRowClick ? "pointer" : "default",
              transition: "transform 0.15s ease, background-color 0.15s ease",
            }}
          >
            {columns.map((c) => (
              <div key={c.key} style={{ textAlign: c.align || "left" }}>
                {c.render(row, idx)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
