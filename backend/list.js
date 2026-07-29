import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  
  const users = await db.collection('users').find({}).toArray();
  
  console.log("All users:");
  for (let u of users) {
    console.log(`- Username: ${u.username}, UID: ${u.uid}, Name: ${u.name}`);
  }
  
  console.log("Done.");
  process.exit(0);
}).catch(console.error);
