export const mergeResourceItems = (apiItems = [], localItems = []) => {
  const localById = new Map(localItems.map((item) => [item.id, item]));
  const seenIds = new Set();

  const mergedApiItems = apiItems.map((apiItem) => {
    seenIds.add(apiItem.id);
    const localItem = localById.get(apiItem.id) || {};
    const merged = { ...localItem };

    Object.entries(apiItem).forEach(([key, value]) => {
      if (value !== undefined) {
        merged[key] = value;
      }
    });

    return merged;
  });

  const missingLocalItems = localItems.filter((item) => !seenIds.has(item.id));
  return [...mergedApiItems, ...missingLocalItems];
};
