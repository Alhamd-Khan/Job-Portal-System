import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";
import { Resume } from "../models/resumeSchema.js";
import { getMatchingJobs, getSkillSuggestions } from "../utils/jobMatcher.js";

// Get Job Recommendations
export const getJobRecommendations = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  // Get user's resume
  const resume = await Resume.findOne({ userId });
  if (!resume) {
    return next(new ErrorHandler("Please create a resume first", 400));
  }

  // Extract user's skills
  const userSkills = resume.skills.map(skill => skill.name);
  
  // Get all active jobs
  const allJobs = await Job.find({ expired: false })
    .populate("employer", "name company")
    .select("title description category skills location salary");

  // Get matching jobs with scores
  const matchedJobs = getMatchingJobs(allJobs, userSkills);

  // Get skill suggestions
  const skillSuggestions = getSkillSuggestions(allJobs, userSkills);

  res.status(200).json({
    success: true,
    recommendations: matchedJobs.filter(job => job.isRecommended),
    otherJobs: matchedJobs.filter(job => !job.isRecommended),
    skillSuggestions
  });
});

// Get Application Success Prediction
export const getApplicationPrediction = catchAsyncErrors(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  // Get job details
  const job = await Job.findById(jobId)
    .select("title description category skills requirements");
  
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  // Get user's resume
  const resume = await Resume.findOne({ userId });
  if (!resume) {
    return next(new ErrorHandler("Please create a resume first", 400));
  }

  // Extract job requirements and user skills
  const jobRequirements = [
    job.title,
    job.description,
    ...(job.skills || []),
    job.category,
    ...(job.requirements || [])
  ].filter(Boolean);

  const userSkills = resume.skills.map(skill => skill.name);

  // Calculate match score
  const matchScore = calculateJobMatch(jobRequirements, userSkills);

  // Generate feedback and suggestions
  const feedback = {
    overallScore: matchScore,
    matchStrength: matchScore > 80 ? "Strong" : matchScore > 60 ? "Moderate" : "Low",
    suggestedImprovements: []
  };

  if (matchScore < 80) {
    // Add specific suggestions based on missing skills
    job.skills?.forEach(skill => {
      if (!userSkills.includes(skill)) {
        feedback.suggestedImprovements.push(`Consider adding experience with ${skill}`);
      }
    });
  }

  res.status(200).json({
    success: true,
    feedback
  });
});
