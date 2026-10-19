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
  onRowDoubleClick?: (row: T) => void;
  className?: string;
  style?: React.CSSProperties;
  minWidth?: string | number;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  onRowClick,
  onRowDoubleClick,
  className = "",
  style,
  minWidth,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div style={style}>{emptyState}</div>;
  }

  const resolvedMinWidth = minWidth ?? Math.max(700, columns.length * 115);

  return (
    <div
      className={`data-table-container ${className}`}
      style={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        className="data-table-inner"
        style={{
          minWidth: resolvedMinWidth,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Table Header */}
        <div
          className="data-table-head"
          style={{
            display: "grid",
            gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
            columnGap: 16,
            padding: "8px 16px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--text-muted-crm)",
          }}
        >
          {columns.map((c) => (
            <div key={c.key} style={{ textAlign: c.align || "left", minWidth: 0, overflow: "hidden" }}>
              {c.header}
            </div>
          ))}
        </div>

        {/* Table Rows: #F7F8FA background, 16px radius */}
        {data.map((row, idx) => {
          // Rows become buttons only when they navigate. Spreading the props
          // keeps the accessibility attributes out of static JSX analysis,
          // which cannot see that `role` is conditional on `onRowClick`.
          const interactiveProps = onRowClick
            ? ({ role: "button", tabIndex: 0 } as const)
            : {};
          return (
            // The row is a click target that also contains its own buttons
            // (Profile, delete), so it cannot be a native <button>. Keyboard
            // support is provided explicitly above.
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={keyExtractor(row, idx)}
              onClick={() => onRowClick?.(row)}
              onDoubleClick={() => onRowDoubleClick?.(row)}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              {...interactiveProps}
              className="data-table-row"
              style={{
                display: "grid",
                gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
                columnGap: 16,
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
                <div
                  key={c.key}
                  className="data-table-cell"
                  data-label={c.header}
                  style={{ textAlign: c.align || "left", minWidth: 0, overflow: "hidden" }}
                >
                  {c.render(row, idx)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
