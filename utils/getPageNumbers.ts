export const getPageNumbers = (currentPage: number, totalPages: number) => {
  const maxVisible = 5;
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;
  if (end > totalPages) {
    end = totalPages;
    start = end - maxVisible + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};
