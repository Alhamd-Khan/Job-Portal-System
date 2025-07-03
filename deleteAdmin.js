import mongoose from "mongoose";
import dotenv from "dotenv";
import { Admin } from "./models/adminSchema.js";

dotenv.config({ path: "./config/config.env" });
console.log("MONGO_URI:", process.env.MONGO_URI); // Debug log

async function deleteAdmin() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined. Please check your config.env file.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "MERN_STACK_JOB_PORTAL_SYSTEM",
  });
  const email = "admin@gmail.com";
  const result = await Admin.deleteOne({ email });
  console.log("Deleted admin:", result);
  process.exit(0);
}

deleteAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
