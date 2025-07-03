import { JaroWinklerDistance } from './stringUtils.js';

// Enhanced job match calculation with multiple factors
export const calculateJobMatch = (job, resume) => {
  const scores = {
    skillMatch: calculateSkillMatch(job.skills || [], resume.skills || []),
    experienceMatch: calculateExperienceMatch(job, resume.experience || []),
    educationMatch: calculateEducationMatch(job, resume.education || []),
    titleMatch: calculateTitleMatch(job.title, resume.experience || []),
    descriptionMatch: calculateDescriptionMatch(job.description, resume)
  };

  // Weighted average of all scores
  const weights = {
    skillMatch: 0.35,
    experienceMatch: 0.25,
    educationMatch: 0.15,
    titleMatch: 0.15,
    descriptionMatch: 0.10
  };

  const totalScore = Object.entries(scores).reduce((sum, [key, score]) => {
    return sum + (score * weights[key]);
  }, 0);

  return {
    overallScore: Math.min(Math.round(totalScore), 100),
    breakdown: scores,
    feedback: generateMatchFeedback(scores, job, resume)
  };
};

// Calculate skill match using enhanced similarity metrics
const calculateSkillMatch = (jobSkills, candidateSkills) => {
  if (!jobSkills.length || !candidateSkills.length) return 0;

  const candidateSkillNames = candidateSkills.map(skill => skill.name.toLowerCase());
  
  let totalScore = 0;
  jobSkills.forEach(jobSkill => {
    const jobSkillLower = jobSkill.toLowerCase();
    let bestMatch = 0;
    
    candidateSkillNames.forEach(candidateSkill => {
      const similarity = JaroWinklerDistance(jobSkillLower, candidateSkill);
      bestMatch = Math.max(bestMatch, similarity);
    });
    
    totalScore += bestMatch;
  });

  return (totalScore / jobSkills.length) * 100;
};

// Match job requirements with candidate's experience
const calculateExperienceMatch = (job, experience) => {
  if (!experience.length) return 0;
  
  const totalYearsExperience = experience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate);
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
    return total + (isNaN(years) ? 0 : years);
  }, 0);

  // Basic score based on years of experience
  let score = Math.min(totalYearsExperience * 20, 100);

  // Bonus for relevant experience
  experience.forEach(exp => {
    if (exp.description && job.description) {
      const relevanceScore = JaroWinklerDistance(
        exp.description.toLowerCase(),
        job.description.toLowerCase()
      );
      score += relevanceScore * 10;
    }
  });

  return Math.min(Math.round(score), 100);
};

// Match job requirements with candidate's education
const calculateEducationMatch = (job, education) => {
  if (!education.length) return 0;
  
  let score = 0;
  const jobTitle = job.title.toLowerCase();
  
  education.forEach(edu => {
    if (edu.degree) {
      const degreeRelevance = JaroWinklerDistance(
        edu.degree.toLowerCase(),
        jobTitle
      );
      score += degreeRelevance * 50;
    }
  });

  return Math.min(Math.round(score), 100);
};

// Match job title with candidate's experience titles
const calculateTitleMatch = (jobTitle, experience) => {
  if (!experience.length || !jobTitle) return 0;
  
  let bestMatch = 0;
  experience.forEach(exp => {
    if (exp.position) {
      const similarity = JaroWinklerDistance(
        jobTitle.toLowerCase(),
        exp.position.toLowerCase()
      );
      bestMatch = Math.max(bestMatch, similarity);
    }
  });

  return Math.round(bestMatch * 100);
};

// Match job description with candidate's overall profile
const calculateDescriptionMatch = (jobDescription, resume) => {
  if (!jobDescription) return 0;

  const resumeText = [
    ...resume.experience?.map(exp => exp.description),
    ...resume.education?.map(edu => edu.description),
    ...resume.skills?.map(skill => skill.name),
  ].filter(Boolean).join(' ').toLowerCase();

  const similarity = JaroWinklerDistance(
    jobDescription.toLowerCase(),
    resumeText
  );

  return Math.round(similarity * 100);
};

// Generate detailed feedback for the match
const generateMatchFeedback = (scores, job, resume) => {
  const feedback = {
    strengths: [],
    improvements: []
  };

  // Analyze skills match
  if (scores.skillMatch > 80) {
    feedback.strengths.push('Strong skill match with job requirements');
  } else {
    const missingSkills = job.skills?.filter(skill => 
      !resume.skills?.some(rs => 
        JaroWinklerDistance(rs.name.toLowerCase(), skill.toLowerCase()) > 0.8
      )
    );
    if (missingSkills?.length) {
      feedback.improvements.push(`Consider adding experience in: ${missingSkills.join(', ')}`);
    }
  }

  // Analyze experience match
  if (scores.experienceMatch > 70) {
    feedback.strengths.push('Relevant work experience for the position');
  } else {
    feedback.improvements.push('Could benefit from more relevant work experience');
  }

  // Analyze education match
  if (scores.educationMatch > 60) {
    feedback.strengths.push('Education background aligns with the position');
  }

  return feedback;
};
