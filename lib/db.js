import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

export async function connectToDatabase() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  return client;
}