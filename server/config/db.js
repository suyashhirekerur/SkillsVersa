/**
 * @file db.js
 * @description Database connection module using Mongoose for MongoDB.
 */

import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using MONGO_URI from environment variables.
 * Exits process with failure code 1 if connection fails.
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
