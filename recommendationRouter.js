import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  getJobRecommendations,
  getApplicationPrediction
} from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/jobs/recommendations", isAuthenticated, getJobRecommendations);
router.get("/jobs/predict/:jobId", isAuthenticated, getApplicationPrediction);

export default router;
