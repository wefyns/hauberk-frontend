import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { ListControls } from "../list-controls/ListControls";

import styles from "./ListSection.module.css";

export function ListSection({
  title,
  queryKey,
  fetcher,
  renderItem,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 15, 20],
  label = "Показать",
  keyExtractor,
}) {
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const q = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: fetcher,
    enabled: !!queryKey,
  });

  const items = useMemo(() => {
    const d = q.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.items)) return d.items;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.peers)) return d.peers;
    if (Array.isArray(d.cas)) return d.cas;
    return [];
  }, [q.data]);

  const visible = useMemo(() => items.slice(0, pageSize), [items, pageSize]);

  if (q.isPending) {
    return (
      <section className={`${styles.section}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.body}>Загрузка...</div>
      </section>
    );
  }

  if (q.isError) {
    return (
      <section className={`${styles.section}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.body}>Ошибка: {String(q.error)}</div>
      </section>
    );
  }

  return (
    <section className={`${styles.section}`}>
      <div className={styles.header}>
        <h3 id={`${title}-heading`} className={styles.title}>{title}</h3>
      </div>

      <div className={styles.tilesGrid}>
        {items.length === 0 && <div className={styles.noItems}>Элементы не найдены.</div>}

        {visible.map((item, idx) => {
          return (
             <div key={`${keyExtractor}-${idx}`} className={styles.tileWrapper}>
              {renderItem(item)}
            </div>
          )}) 
        }
      </div>

      <ListControls
        pageSize={pageSize}
        onPageSizeChange={(v) => setPageSize(v)}
        visibleCount={visible.length}
        totalCount={items.length}
        pageSizeOptions={pageSizeOptions}
        label={label}
      >
        <button
          type="button"
          onClick={() => q.refetch && q.refetch()}
          className={styles.btn}
        >
          Обновить
        </button>
      </ListControls>
    </section>
  );
}