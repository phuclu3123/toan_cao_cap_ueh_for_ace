import { checkMongoDBConnected } from '../config/db.js';

export class PersistentStorageUnavailableError extends Error {
  constructor() {
    super('Persistent storage is unavailable');
    this.name = 'PersistentStorageUnavailableError';
    this.code = 'PERSISTENT_STORAGE_UNAVAILABLE';
    this.statusCode = 503;
  }
}

export const isProductionRuntime = () => process.env.NODE_ENV === 'production';

export const assertPersistentStorage = () => {
  if (isProductionRuntime() && !checkMongoDBConnected()) {
    throw new PersistentStorageUnavailableError();
  }
};
