// A broken component/export is a code error, not a stale deployment chunk.
export function isRecoverableChunkError(error) {
  return error?.name === 'ChunkLoadError'
    || /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk [\w-]+ failed/i.test(error?.message || '');
}

export function claimChunkRecovery(storage, key, resource) {
  try {
    if (storage.getItem(key) === resource) return false;
    storage.setItem(key, resource);
    return true;
  } catch {
    return false;
  }
}
