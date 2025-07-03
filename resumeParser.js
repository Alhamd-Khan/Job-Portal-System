import axios from 'axios';
import ErrorHandler from '../middlewares/error.js';

export const parseResumeWithAffinda = async (fileBuffer, fileType) => {
  try {
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], { type: fileType }));

    const response = await axios.post('https://api.affinda.com/v2/resumes', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.AFFINDA_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (!response.data) {
      throw new ErrorHandler('Failed to parse resume', 500);
    }

    // Extract relevant information from the parsed data
    const { data } = response;
    return {
      personalInfo: {
        firstName: data.name?.first,
        lastName: data.name?.last,
        email: data.email,
        phone: data.phone,
        address: data.location?.formatted,
        linkedIn: data.linkedin_url,
      },
      education: data.education?.map(edu => ({
        degree: edu.degree?.name,
        institution: edu.organization,
        startYear: edu.dates?.start_date?.year,
        endYear: edu.dates?.end_date?.year,
        grade: edu.grade,
        description: edu.description
      })) || [],
      experience: data.work_experience?.map(exp => ({
        company: exp.organization,
        position: exp.job_title,
        startDate: exp.dates?.start_date,
        endDate: exp.dates?.end_date,
        current: !exp.dates?.end_date,
        description: exp.description,
        achievements: exp.achievements || []
      })) || [],
      skills: data.skills?.map(skill => ({
        name: skill.name,
        level: 'Intermediate' // Default level as parsing services typically don't provide skill levels
      })) || [],
      certifications: data.certifications?.map(cert => ({
        name: cert.name,
        issuer: cert.organization,
        date: cert.dates?.start_date,
        url: cert.url
      })) || []
    };
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw new ErrorHandler('Failed to parse resume: ' + (error.message || 'Unknown error'), 500);
  }
};
