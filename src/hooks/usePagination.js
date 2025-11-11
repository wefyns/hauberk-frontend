import { useState, useMemo, useEffect } from "react";

export function usePagination(
  data = [], 
  initialPageSize = 20, 
  pageSizeOptions = [10, 20, 50, 100]
) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize]);

  const paginationData = useMemo(() => {
    if (!Array.isArray(data)) {
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        startIndex: 0,
        endIndex: 0,
      };
    }

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const items = data.slice(startIndex, endIndex);

    return {
      items,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
    };
  }, [data, pageSize, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationData.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    if (newPageSize > 0) {
      const currentFirstItem = (currentPage - 1) * pageSize;
      const newCurrentPage = Math.floor(currentFirstItem / newPageSize) + 1;
      
      setPageSize(newPageSize);
      setCurrentPage(Math.max(1, newCurrentPage));
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(paginationData.totalPages);
  const goToNextPage = () => {
    if (currentPage < paginationData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    ...paginationData,
    currentPage,
    pageSize,
    pageSizeOptions,
    handlePageChange,
    handlePageSizeChange,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage: currentPage < paginationData.totalPages,
    hasPreviousPage: currentPage > 1,
    isEmpty: paginationData.totalItems === 0,
  };
}