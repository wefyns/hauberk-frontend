import React from "react";

import styles from "./ListControls.module.css";

export function ListControls({
  pageSize,
  onPageSizeChange,
  visibleCount,
  totalCount,
  pageSizeOptions = [5, 10, 15, 20],
  label = 'Показать',
  children,
}) {
  const handleChange = (e) => {
    const v = parseInt(e.target.value, 10);
    onPageSizeChange?.(Number.isFinite(v) ? v : null);
  }

  const infoText =
    totalCount === 0
      ? "0 - 0 из 0 элементов"
      : `1 - ${visibleCount} из ${totalCount} элементов`;

  return (
    <div className={`${styles.container}`}>
      <label className={styles.selectLabel}>
        <span className={styles.labelText}>{label}:</span>
        <select value={pageSize} onChange={handleChange} className={styles.select}>
          {pageSizeOptions.map((opt) => (
            <option key={String(opt)} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.infoText} aria-live="polite">
        {infoText}
      </div>

      {children && <div className={styles.extra}>{children}</div>}
    </div>
  )
}