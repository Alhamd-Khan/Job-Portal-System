import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllJobs,
  moderateJob,
  getApplicationStats,
  registerAdmin
} from "../controllers/adminController.js";

const router = express.Router();

console.log("Admin router loaded");

// Admin Routes
router.post("/login", (req, res, next) => {
  console.log("Admin login route hit");
  next();
}, adminLogin);
router.post("/register", registerAdmin)

// Protected Admin Routes
// router.get("/dashboard", isAuthenticated, isAdmin, getDashboardStats);
router.get("/dashboard", getDashboardStats); // TEMP ONLY

router.get("/users", isAuthenticated, isAdmin, getAllUsers);
router.put("/user/status", isAuthenticated, isAdmin, updateUserStatus);
router.get("/jobs", isAuthenticated, isAdmin, getAllJobs);
router.put("/job/moderate", isAuthenticated, isAdmin, moderateJob);
router.get("/applications/stats", isAuthenticated, isAdmin, getApplicationStats);

export default router;
