import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

// Disable buffering so unestablished DB connections fail immediately to local fallback
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 1000);

// Optional DNS override for environments where Node cannot resolve mongodb+srv.
// Keep the operating-system resolver unless this is explicitly configured.
const mongoDnsServers = (process.env.MONGODB_DNS_SERVERS || process.env.MONGO_DNS_SERVERS || '')
  .split(',')
  .map(server => server.trim())
  .filter(Boolean);

if (mongoDnsServers.length > 0) {
  try {
    dns.setServers(mongoDnsServers);
  } catch {}
}

const CONNECTION_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

export const getDatabaseStatus = () => ({
  configured: Boolean(
    process.env.MONGODB_URI
    || process.env.MONGO_URI
    || process.env.MONGODB_DIRECT_URI
    || process.env.MONGO_DIRECT_URI
  ),
  status: CONNECTION_STATES[mongoose.connection.readyState] || 'unknown'
});

export const connectDB = async (onConnectedCallback) => {
  const srvURI = process.env.MONGODB_URI || process.env.MONGO_URI;
  const directURI = process.env.MONGODB_DIRECT_URI || process.env.MONGO_DIRECT_URI;
  const urisToTry = [srvURI, directURI].filter(Boolean);

  if (urisToTry.length === 0) {
    if (process.env.NODE_ENV === 'production' && process.env.REQUIRE_DATABASE !== 'false') {
      throw new Error('MongoDB is required in production but no connection string is configured.');
    }
    console.warn('[Database] No MongoDB connection string is configured; development fallback storage is active.');
    return false;
  }

  for (const uri of urisToTry) {
    try {
      await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB_NAME || 'UEH_TCC',
        serverSelectionTimeoutMS: 4000
      });
      console.log('✅ Đã kết nối thành công MongoDB Atlas (Online)');
      if (onConnectedCallback) {
        await onConnectedCallback();
      }
      return true;
    } catch (error) {
      console.warn(`[Database] Connection attempt failed (${error.name || 'unknown error'}).`);
    }
  }

  if (process.env.NODE_ENV === 'production' && process.env.REQUIRE_DATABASE !== 'false') {
    throw new Error('MongoDB is required in production but all connection attempts failed.');
  }
  console.warn('[Database] MongoDB is unavailable; development fallback storage is active.');
  return false;
};
