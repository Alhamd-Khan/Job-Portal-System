import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Resume } from "../models/resumeSchema.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import parseResumeLocal from "../utils/localResumeParser.js";

// Create or Update Resume
export const createUpdateResume = catchAsyncErrors(async (req, res, next) => {
  const { 
    personalInfo,
    education,
    experience,
    skills,
    certifications,
    projects 
  } = req.body;

  const userId = req.user._id;

  let resume = await Resume.findOne({ userId });
  
  if (resume) {
    // Update existing resume
    resume.personalInfo = personalInfo;
    resume.education = education;
    resume.experience = experience;
    resume.skills = skills;
    resume.certifications = certifications;
    resume.projects = projects;
  } else {
    // Create new resume
    resume = await Resume.create({
      userId,
      personalInfo,
      education,
      experience,
      skills,
      certifications,
      projects
    });
  }

  // Handle resume file upload if provided
  if (req.file) {
    const fileUri = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    
    // Delete old resume file if exists
    if (resume.resumeFile && resume.resumeFile.public_id) {
      await cloudinary.v2.uploader.destroy(resume.resumeFile.public_id);
    }

    resume.resumeFile = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
      fileType: req.file.mimetype
    };
  }

  await resume.save();

  res.status(200).json({
    success: true,
    message: "Resume updated successfully",
    resume
  });
});

// Get Resume
export const getResume = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.userId || req.user._id;
  
  const resume = await Resume.findOne({ userId });
  
  if (!resume) {
    return next(new ErrorHandler("Resume not found", 404));
  }

  res.status(200).json({
    success: true,
    resume
  });
});

// Delete Resume
export const deleteResume = catchAsyncErrors(async (req, res, next) => {
  const resume = await Resume.findOne({ userId: req.user._id });
  
  if (!resume) {
    return next(new ErrorHandler("Resume not found", 404));
  }

  // Delete resume file from cloudinary
  if (resume.resumeFile && resume.resumeFile.public_id) {
    await cloudinary.v2.uploader.destroy(resume.resumeFile.public_id);
  }

  await resume.deleteOne();

  res.status(200).json({
    success: true,
    message: "Resume deleted successfully"
  });
});

// Parse Resume
export const parseResume = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please upload a resume file", 400));
  }

  try {
    // Get file buffer and type
    const fileUri = getDataUri(req.file);
    const fileBuffer = Buffer.from(fileUri.content, 'base64');

    // Parse resume using local parser
    const parsedData = await parseResumeLocal(fileBuffer, req.file.mimetype);

    // Save parsed data to user's resume
    const userId = req.user._id;
    let resume = await Resume.findOne({ userId });

    if (resume) {
      // Update existing resume with parsed data
      resume = Object.assign(resume, parsedData);
    } else {
      // Create new resume with parsed data
      resume = await Resume.create({
        userId,
        ...parsedData
      });
    }

    // Upload resume file to Cloudinary
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    
    resume.resumeFile = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
      fileType: req.file.mimetype
    };

    await resume.save();

    res.status(200).json({
      success: true,
      message: "Resume parsed and saved successfully",
      resume
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
