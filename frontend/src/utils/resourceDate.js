export const formatResourceDate = (resource, fallback = '') => {
  const rawDate = resource?.updatedAt || resource?.createdAt;

  if (rawDate) {
    const date = new Date(rawDate);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  return resource?.date || fallback;
};
