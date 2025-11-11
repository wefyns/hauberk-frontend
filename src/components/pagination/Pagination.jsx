import React from "react";
import styles from "./Pagination.module.css";

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  showInfo = true,
  maxVisiblePages = 5,
}) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1);
    }
  };

  const getVisiblePages = () => {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={styles.container}>
      {showInfo && (
        <div className={styles.info}>
          {totalItems > 0 ? (
            `Показано ${startItem}-${endItem} из ${totalItems} элементов`
          ) : (
            "Нет элементов"
          )}
        </div>
      )}

      <div className={styles.pagination}>
        <button
          type="button"
          className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ""}`}
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Предыдущая страница"
        >
          <span className={styles.pageArrow}>‹</span>
        </button>

        {visiblePages[0] > 1 && (
          <>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => handlePageClick(1)}
            >
              1
            </button>
            {visiblePages[0] > 2 && (
              <span className={styles.ellipsis}>...</span>
            )}
          </>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            className={`${styles.pageButton} ${
              page === currentPage ? styles.active : ""
            }`}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className={styles.ellipsis}>...</span>
            )}
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => handlePageClick(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ""}`}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Следующая страница"
        >
          <span className={styles.pageArrow}>›</span>
        </button>
      </div>
    </div>
  );
}