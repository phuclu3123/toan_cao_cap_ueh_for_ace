import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from '../backend/node_modules/dotenv/lib/main.js';
import mongoose from '../backend/node_modules/mongoose/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const uri = process.env.MONGODB_DIRECT_URI || process.env.MONGO_DIRECT_URI || process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  console.error('Khong tim thay MONGODB_DIRECT_URI, MONGO_DIRECT_URI, MONGODB_URI hoac MONGO_URI trong backend/.env');
  process.exit(1);
}

console.log("Đang thử kết nối tới MongoDB...");
mongoose.connect(uri, { dbName: 'UEH_TCC' })
  .then(() => {
    console.log("KẾT NỐI THÀNH CÔNG ĐẾN MONGODB ATLAS!");
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error("LỖI KẾT NỐI:", err.message);
    process.exit(1);
  });
