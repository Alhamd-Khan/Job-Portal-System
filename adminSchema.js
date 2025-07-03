import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
    minlength: [3, "Name must contain at least 3 Characters!"],
    maxlength: [30, "Name cannot exceed 30 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
    validate: [validator.isEmail, "Please provide a valid Email!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a Password!"],
    minlength: [8, "Password must contain at least 8 characters!"],
    select: false,
  },
  role: {
    type: String,
    default: "admin"
  },
  permissions: [{
    type: String,
    enum: [
      "manage_users",
      "manage_jobs",
      "manage_applications",
      "view_analytics",
      "manage_content",
      "manage_settings"
    ]
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Encrypt password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // Only hash if not already hashed
  if (!this.password.startsWith("$2b$")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
adminSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const Admin = mongoose.model("Admin", adminSchema);
