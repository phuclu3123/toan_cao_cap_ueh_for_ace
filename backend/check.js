import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.client.db('UEH_TCC');
  const indexes = await db.collection('users').indexes();
  console.log("Indexes on users collection:", JSON.stringify(indexes, null, 2));
  
  const dupes = await db.collection('users').find({ username: "luphuc321@gmail.com" }).toArray();
  console.log("Users with luphuc321@gmail.com:", dupes.map(u => ({ username: u.username, uid: u.uid, name: u.name, _id: u._id })));
  
  process.exit(0);
}).catch(console.error);
