import React from "react";

import styles from "./ListControls.module.css";

export function ListControls({
  pageSize,
  onPageSizeChange,
  totalCount,
  pageSizeOptions = [10, 20, 50, 100],
  label = 'Показать',
  children,
  showPageSize = true,
}) {
  const handleChange = (e) => {
    const v = parseInt(e.target.value, 10);
    onPageSizeChange?.(Number.isFinite(v) ? v : null);
  }

  const infoText =
    totalCount === 0
      ? "Нет элементов"
      : `Всего элементов: ${totalCount}`;

  return (
    <div className={`${styles.container}`}>
      {showPageSize && (
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
      )}

      <div className={styles.infoText} aria-live="polite">
        {infoText}
      </div>

      {children && <div className={styles.extra}>{children}</div>}
    </div>
  )
}