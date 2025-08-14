// lib/mongoose.js
"use server"
import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  // Ensure this only runs on server-side
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called on the server side');
  }

  const uri = process.env.MONGODB_URI; // Use server-side env var
  
  if (!uri) {
    throw new Error("Please add your Mongo URI to .env.local as MONGODB_URI");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}