// migrate.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js"; // Your schema

dotenv.config(); // Load .env.local if needed


async function runMigration() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://programmer119dynamicdreamz:test1234@cluster0.pamppes.mongodb.net/" // Make sure this is correct
    console.log("Connecting to MongoDB...",uri);
    await mongoose.connect(uri, {});

    console.log("Ensuring indexes for User collection...");
    await User.init(); // This creates all indexes from your schema

    console.log("Migration completed ✅");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed ❌", error);
    process.exit(1);
  }
}

runMigration();
