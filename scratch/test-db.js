import mongoose from 'mongoose';

const uri = "mongodb+srv://luphuc321_db_user:cn1LdXJQotm4IeoQ@cluster0.hos0xip.mongodb.net/?appName=Cluster0";

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
