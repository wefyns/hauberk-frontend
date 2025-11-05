import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { ListControls } from "../list-controls/ListControls";
// import { Pagination } from "../pagination/Pagination";

import styles from "./ListSection.module.css";

export function ListSection({
  title,
  queryKey,
  fetcher,
  renderItem,
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  label = "Показать",
  keyExtractor,
  enablePagination = true,
}) {
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);

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
    if (Array.isArray(d.ca)) return d.ca;
    return [];
  }, [q.data]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, items.length]);

  const { visible, totalPages } = useMemo(() => {
    if (!enablePagination) {
      return {
        visible: items.slice(0, pageSize),
        totalPages: 1,
      };
    }
    
    const totalPages = Math.ceil(items.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      visible: items.slice(startIndex, endIndex),
      totalPages,
    };
  }, [items, pageSize, currentPage, enablePagination]);

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
        <div className={styles.body}>
          <span className={styles.noItems}>Элементы не найдены.</span>
        </div>
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
        onPageSizeChange={(v) => {
          setPageSize(v);
          if (enablePagination && items.length > 0) {
            const currentFirstItem = (currentPage - 1) * pageSize;
            const newCurrentPage = Math.floor(currentFirstItem / v) + 1;
            setCurrentPage(newCurrentPage);
          }
        }}
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