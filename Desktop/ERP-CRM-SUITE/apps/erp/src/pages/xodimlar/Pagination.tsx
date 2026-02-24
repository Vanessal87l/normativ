import React from "react";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
};

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div style={styles.row}>
      <div style={styles.left}>
        <button disabled={!canPrev} onClick={() => onPageChange(page - 1)} style={styles.btn}>
          Prev
        </button>
        <span style={styles.meta}>
          Page <b>{page}</b> / <b>{totalPages}</b>
        </span>
        <button disabled={!canNext} onClick={() => onPageChange(page + 1)} style={styles.btn}>
          Next
        </button>
      </div>

      <div style={styles.right}>
        <span style={styles.meta}>Rows:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={styles.select}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span style={styles.meta}>
          Total: <b>{total}</b>
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  left: { display: "flex", alignItems: "center", gap: 10 },
  right: { display: "flex", alignItems: "center", gap: 10 },
  btn: {
    border: "1px solid #cbd5e1",
    background: "white",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
  },
  meta: { fontSize: 12, color: "#334155" },
  select: {
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "8px 10px",
    background: "white",
    cursor: "pointer",
  },
};
