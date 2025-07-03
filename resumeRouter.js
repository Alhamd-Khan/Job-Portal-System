import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import {
  createUpdateResume,
  deleteResume,
  getResume,
  parseResume,
} from "../controllers/resumeController.js";

const router = express.Router();

// Resume Routes
router.route("/resume/create").post(isAuthenticated, singleUpload, createUpdateResume);
router.route("/resume/me").get(isAuthenticated, getResume);
router.route("/resume/:userId").get(isAuthenticated, getResume);
router.route("/resume/delete").delete(isAuthenticated, deleteResume);
router.route("/resume/parse").post(isAuthenticated, singleUpload, parseResume);

export default router;
