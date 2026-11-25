export const mergeResourceItems = (apiItems = [], localItems = []) => {
  const localById = new Map(localItems.map((item) => [item.id, item]));
  const seenIds = new Set();

  const mergedApiItems = apiItems.map((apiItem) => {
    seenIds.add(apiItem.id);
    const localItem = localById.get(apiItem.id) || {};
    // Curated source imports are authoritative; an old database row must not
    // restore a placeholder, wrong lecturer PDF or incomplete file list.
    if(localItem.sourceRevision) return {...apiItem,...localItem,views:apiItem.views ?? localItem.views ?? 0};
    const merged = { ...localItem };

    Object.entries(apiItem).forEach(([key, value]) => {
      if (key === 'pdf' && localItem.pdf) {
        merged.pdf = localItem.pdf;
      } else if (localItem.hasDetailRoute === true && ['title', 'date', 'desc', 'hasDetailRoute'].includes(key)) {
        merged[key] = localItem[key] ?? value;
      } else if (value !== undefined) {
        merged[key] = value;
      }
    });

    // A known mismatched bundled source must not be restored by a stale API entry.
    if (localItem.sourceStatus === 'pending') {
      merged.pdf = null;
      merged.sourceStatus = 'pending';
      merged.desc = localItem.desc;
    }
    return merged;
  });

  const missingLocalItems = localItems.filter((item) => !seenIds.has(item.id));
  return [...mergedApiItems, ...missingLocalItems];
};
