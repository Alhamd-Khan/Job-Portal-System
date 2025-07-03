import mongoose from "mongoose";
import dotenv from "dotenv";
import { Admin } from "./models/adminSchema.js";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config({ path: "./config/config.env" });

console.log("MONGO_URI:", process.env.MONGO_URI); // Debug log

async function createAdmin() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined. Please check your config.env file.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "MERN_STACK_JOB_PORTAL_SYSTEM",
  });
  const name = "Admin";
  const email = "admin@gmail.com";
  const password = "1234567890";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("Admin already exists.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ name, email, password: hashedPassword });
  console.log("Admin created:", admin);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
