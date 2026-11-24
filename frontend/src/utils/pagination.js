export function paginationPages(currentPage, totalPages) {
  const total = Math.max(1, Number.parseInt(totalPages, 10) || 1);
  const current = Math.max(1, Math.min(total, Number.parseInt(currentPage, 10) || 1));
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const visible = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 4) for (let page = 2; page <= 5; page++) visible.add(page);
  if (current >= total - 3) for (let page = total - 4; page < total; page++) visible.add(page);
  const pages = [...visible].filter(page => page > 0 && page <= total).sort((a, b) => a - b);
  return pages.flatMap((page, index) => index && page - pages[index - 1] > 1 ? ['…', page] : [page]);
}
