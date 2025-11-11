import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { ListControls } from "../list-controls/ListControls";
import { Pagination } from "../pagination/Pagination";

import styles from "./ListSection.module.css";

export function ListSection({
  title,
  queryKey,
  fetcher,
  renderItem,
  defaultPageSize = 10,
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
  
  const agentGroups = useMemo(() => {
    const d = q.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.items)) return d.items;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.peers)) return d.peers;
    if (Array.isArray(d.orderers)) return d.orderers;
    if (Array.isArray(d.ca)) return d.ca;
    return [];
  }, [q.data]);

  const flattenedItems = useMemo(() => {
    const result = [];
    
    agentGroups.forEach((agentGroup) => {
      if (Array.isArray(agentGroup.agent_peers)) {
        agentGroup.agent_peers.forEach((peer) => {
          result.push({
            ...agentGroup,
            _flattenedItem: peer,
            _itemType: 'peer'
          });
        });
      }

      else if (Array.isArray(agentGroup.agent_ca)) {
        agentGroup.agent_ca.forEach((ca) => {
          result.push({
            ...agentGroup,
            _flattenedItem: ca,
            _itemType: 'ca'
          });
        });
      }

      else if (Array.isArray(agentGroup.agent_orderers)) {
        agentGroup.agent_orderers.forEach((orderer) => {
          result.push({
            ...agentGroup,
            _flattenedItem: orderer,
            _itemType: 'orderer'
          });
        });
      }
      else {
        result.push(agentGroup);
      }
    });
    
    return result;
  }, [agentGroups]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, flattenedItems.length]);

  const { visible, totalPages } = useMemo(() => {
    if (!enablePagination) {
      return {
        visible: flattenedItems.slice(0, pageSize),
        totalPages: 1,
      };
    }
    
    const totalPages = Math.ceil(flattenedItems.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      visible: flattenedItems.slice(startIndex, endIndex),
      totalPages,
    };
  }, [flattenedItems, pageSize, currentPage, enablePagination]);

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
        {flattenedItems.length === 0 && <div className={styles.noItems}>Элементы не найдены.</div>}

        {visible.map((item, idx) => {
          const originalItem = item._flattenedItem 
            ? {
                ...item,
                agent_peers: item._itemType === 'peer' ? [item._flattenedItem] : undefined,
                agent_ca: item._itemType === 'ca' ? [item._flattenedItem] : undefined,
                agent_orderers: item._itemType === 'orderer' ? [item._flattenedItem] : undefined,
              }
            : item;

          const rendered = renderItem(originalItem);
          
          if (Array.isArray(rendered)) {
            return rendered.map((element, subIdx) => (
              <div key={`${keyExtractor}-${idx}-${subIdx}`} className={styles.tileWrapper}>
                {element}
              </div>
            ));
          }
          
          return (
            <div key={`${keyExtractor}-${idx}`} className={styles.tileWrapper}>
              {rendered}
            </div>
          );
        })} 
      </div>

      <ListControls
        pageSize={pageSize}
        onPageSizeChange={(v) => {
          setPageSize(v);
          if (enablePagination && flattenedItems.length > 0) {
            const currentFirstItem = (currentPage - 1) * pageSize;
            const newCurrentPage = Math.floor(currentFirstItem / v) + 1;
            setCurrentPage(newCurrentPage);
          }
        }}
        totalCount={flattenedItems.length}
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

      {enablePagination && flattenedItems.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={flattenedItems.length}
          itemsPerPage={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
}