import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  
  // Find users where username equals uid (which means it was auto-generated due to missing email)
  const buggyUsers = await db.collection('users').find({
    $expr: { $eq: ["$username", "$uid"] }
  }).toArray();
  
  console.log("Found buggy users:", buggyUsers.length);
  
  for (let u of buggyUsers) {
    console.log(`Deleting buggy user: ${u.username}`);
    await db.collection('users').deleteOne({ _id: u._id });
  }
  
  console.log("Done.");
  process.exit(0);
}).catch(console.error);
