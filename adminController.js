import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Admin } from "../models/adminSchema.js";
import { User } from "../models/userSchema.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";
import { sendToken } from "../utils/jwtToken.js";
import bcrypt from "bcryptjs";

// Admin Login
export const adminLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Admin login attempt:", email, password); // Debug log

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  const admin = await Admin.findOne({ email }).select("+password");
  console.log("Admin found:", admin); // Debug log
  
  if (!admin) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  const isPasswordMatched = await admin.comparePassword(password);
  console.log("Password match:", isPasswordMatched); // Debug log
  
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  sendToken(admin, 200, res, "Admin logged in successfully");
});

// TEMPORARY: Register Admin
export const registerAdmin = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }
  const existing = await Admin.findOne({ email });
  if (existing) {
    return next(new ErrorHandler("Admin already exists", 400));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ name, email, password: hashedPassword });
  res.status(201).json({ success: true, message: "Admin registered", admin });
});

// Get Dashboard Stats
export const getDashboardStats = catchAsyncErrors(async (req, res, next) => {
  const stats = {
    totalUsers: await User.countDocuments(),
    totalJobs: await Job.countDocuments(),
    totalApplications: await Application.countDocuments(),
    activeJobs: await Job.countDocuments({ expired: false }),
    employerCount: await User.countDocuments({ role: "Employer" }),
    jobSeekerCount: await User.countDocuments({ role: "Job Seeker" }),
    recentUsers: await User.find().sort({ createdAt: -1 }).limit(5),
    recentJobs: await Job.find().sort({ createdAt: -1 }).limit(5),
    recentApplications: await Application.find().sort({ createdAt: -1 }).limit(5)
  };

  res.status(200).json({
    success: true,
    stats
  });
});

// Get All Users
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    users
  });
});

// Update User Status
export const updateUserStatus = catchAsyncErrors(async (req, res, next) => {
  const { userId, status } = req.body;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.status = status;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User status updated successfully"
  });
});

// Get All Jobs
export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find()
    .populate("employer", "name email")
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    jobs
  });
});

// Moderate Job
export const moderateJob = catchAsyncErrors(async (req, res, next) => {
  const { jobId, status, reason } = req.body;
  
  const job = await Job.findById(jobId);
  
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  job.status = status;
  job.moderationReason = reason;
  await job.save();

  res.status(200).json({
    success: true,
    message: "Job moderated successfully"
  });
});

// Get Application Statistics
export const getApplicationStats = catchAsyncErrors(async (req, res, next) => {
  const stats = {
    total: await Application.countDocuments(),
    pending: await Application.countDocuments({ status: "pending" }),
    accepted: await Application.countDocuments({ status: "accepted" }),
    rejected: await Application.countDocuments({ status: "rejected" }),
    monthlyApplications: await Application.aggregate([
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ])
  };

  res.status(200).json({
    success: true,
    stats
  });
});
