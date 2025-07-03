import natural from 'natural';

// Initialize TF-IDF and string distance calculators
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
const JaroWinklerDistance = natural.JaroWinklerDistance;

// Calculate similarity score between job requirements and candidate skills
export const calculateJobMatch = (jobRequirements, candidateSkills) => {
  // Normalize and tokenize text
  const normalizeText = (text) => {
    return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(' ').filter(Boolean);
  };

  const jobTokens = normalizeText(jobRequirements.join(' '));
  const skillTokens = normalizeText(candidateSkills.join(' '));

  // Add documents to TF-IDF
  tfidf.addDocument(jobTokens);
  tfidf.addDocument(skillTokens);

  // Calculate TF-IDF similarity
  let tfidfScore = 0;
  tfidf.tfidfs(skillTokens, function(i, measure) {
    tfidfScore += measure;
  });

  // Calculate string similarity for each skill
  let stringSimScore = 0;
  candidateSkills.forEach(skill => {
    let maxSkillScore = 0;
    jobRequirements.forEach(req => {
      const score = JaroWinklerDistance(skill.toLowerCase(), req.toLowerCase());
      maxSkillScore = Math.max(maxSkillScore, score);
    });
    stringSimScore += maxSkillScore;
  });

  // Normalize scores
  const normalizedTfidf = tfidfScore / (jobTokens.length * skillTokens.length);
  const normalizedStringSim = stringSimScore / candidateSkills.length;

  // Calculate final match percentage (weighted average)
  const matchPercentage = (normalizedTfidf * 0.6 + normalizedStringSim * 0.4) * 100;

  return Math.min(Math.round(matchPercentage), 100);
};

// Get matching jobs based on candidate skills
export const getMatchingJobs = (jobs, candidateSkills) => {
  return jobs.map(job => {
    const jobRequirements = [
      job.title,
      job.description,
      ...(job.skills || []),
      job.category
    ].filter(Boolean);

    const matchScore = calculateJobMatch(jobRequirements, candidateSkills);

    return {
      ...job,
      matchScore,
      isRecommended: matchScore > 70 // Consider jobs with >70% match as recommended
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

// Get skill suggestions based on job market analysis
export const getSkillSuggestions = (jobs, currentSkills) => {
  const skillFrequency = new Map();
  const userSkills = new Set(currentSkills.map(s => s.toLowerCase()));

  // Analyze skills from all jobs
  jobs.forEach(job => {
    const jobSkills = [
      ...(job.skills || []),
      job.category
    ].filter(Boolean).map(s => s.toLowerCase());

    jobSkills.forEach(skill => {
      if (!userSkills.has(skill)) {
        skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
      }
    });
  });

  // Sort skills by frequency and return top suggestions
  return Array.from(skillFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);
};
