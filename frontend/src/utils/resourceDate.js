const DATE_FIELDS = ['updatedAt', 'publishedAt', 'createdAt', 'date'];

const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const text = String(value).trim();
  const vietnameseDate = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

  if (vietnameseDate) {
    const [, day, month, year] = vietnameseDate;
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getResourceTimestamp = (resource) => {
  for (const field of DATE_FIELDS) {
    const parsed = parseDateValue(resource?.[field]);
    if (parsed) return parsed.getTime();
  }

  return Number.NEGATIVE_INFINITY;
};

export const sortResourcesByNewest = (items = []) => {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const dateDifference = getResourceTimestamp(right.item) - getResourceTimestamp(left.item);
      return Number.isNaN(dateDifference) || dateDifference === 0
        ? left.index - right.index
        : dateDifference;
    })
    .map(({ item }) => item);
};

export const formatResourceDate = (resource, fallback = '') => {
  for (const field of DATE_FIELDS) {
    const parsed = parseDateValue(resource?.[field]);
    if (parsed) {
      return parsed.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  return resource?.date || fallback;
};
