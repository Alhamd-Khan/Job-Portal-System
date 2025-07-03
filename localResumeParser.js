import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import ErrorHandler from '../middlewares/error.js';
import Tesseract from 'tesseract.js';

export const parseResumeLocal = async (fileBuffer, fileType) => {
  try {
    let textContent = '';

    // Parse based on file type
    if (fileType === 'application/pdf') {
      textContent = await parsePDF(fileBuffer);
    } else if (fileType.includes('word')) {
      textContent = await parseWord(fileBuffer);
    } else if (fileType === 'text/plain') {
      textContent = fileBuffer.toString('utf-8');
    } else if (
      fileType === 'image/png' ||
      fileType === 'image/jpeg' ||
      fileType === 'image/webp'
    ) {
      textContent = await parseImageOCR(fileBuffer);
    } else {
      throw new ErrorHandler('Unsupported file type. Please upload PDF, Word, TXT, PNG, JPEG, or WEBP file.', 400);
    }

    // Extract information using regex patterns
    const parsed = {
      personalInfo: extractPersonalInfo(textContent),
      education: extractEducation(textContent),
      experience: extractExperience(textContent),
      skills: extractSkills(textContent)
    };

    return parsed;
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw new ErrorHandler('Failed to parse resume: ' + (error.message || 'Unknown error'), 500);
  }
};

// Parse PDF files
const parsePDF = async (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });

    pdfParser.on('pdfParser_dataError', (error) => {
      reject(error);
    });

    pdfParser.parseBuffer(buffer);
  });
};

// Parse Word documents
const parseWord = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

// OCR for images
const parseImageOCR = async (buffer) => {
  const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
  return text;
};

// Extract personal information using regex
const extractPersonalInfo = (text) => {
  const personalInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    linkedIn: ''
  };

  // Email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) personalInfo.email = emailMatch[0];

  // Phone
  const phoneRegex = /(\+\d{1,3}[-.]?)?\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) personalInfo.phone = phoneMatch[0];

  // LinkedIn
  const linkedInRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/;
  const linkedInMatch = text.match(linkedInRegex);
  if (linkedInMatch) personalInfo.linkedIn = 'https://www.' + linkedInMatch[0];

  // Name (assuming it's at the beginning of the resume)
  const nameLines = text.split('\n').slice(0, 3);
  for (const line of nameLines) {
    const nameParts = line.trim().split(' ').filter(part => 
      part.length > 1 && !/[0-9@]/.test(part)
    );
    if (nameParts.length >= 2) {
      personalInfo.firstName = nameParts[0];
      personalInfo.lastName = nameParts[nameParts.length - 1];
      break;
    }
  }

  return personalInfo;
};

// Extract education information
const extractEducation = (text) => {
  const education = [];
  const eduKeywords = ['education', 'degree', 'bachelor', 'master', 'phd', 'diploma'];
  const lines = text.split('\n');
  
  let isEduSection = false;
  let currentEdu = {};
  
  for (const line of lines) {
    const lineText = line.toLowerCase();
    
    // Check if this is the start of education section
    if (eduKeywords.some(keyword => lineText.includes(keyword))) {
      isEduSection = true;
      if (Object.keys(currentEdu).length > 0) {
        education.push(currentEdu);
        currentEdu = {};
      }
    }
    
    if (isEduSection) {
      // Try to identify degree
      if (line.includes('Bachelor') || line.includes('Master') || line.includes('PhD')) {
        currentEdu.degree = line.trim();
      }
      // Try to identify years
      const yearRegex = /20\d{2}/g;
      const years = line.match(yearRegex);
      if (years?.length >= 2) {
        currentEdu.startYear = parseInt(years[0]);
        currentEdu.endYear = parseInt(years[1]);
      }
    }
  }
  
  if (Object.keys(currentEdu).length > 0) {
    education.push(currentEdu);
  }
  
  return education;
};

// Extract work experience
const extractExperience = (text) => {
  const experience = [];
  const expKeywords = ['experience', 'work history', 'employment'];
  const lines = text.split('\n');
  
  let isExpSection = false;
  let currentExp = {};
  
  for (const line of lines) {
    const lineText = line.toLowerCase();
    
    // Check if this is the start of experience section
    if (expKeywords.some(keyword => lineText.includes(keyword))) {
      isExpSection = true;
      if (Object.keys(currentExp).length > 0) {
        experience.push(currentExp);
        currentExp = {};
      }
    }
    
    if (isExpSection) {
      // Try to identify position and company
      if (line.includes('|')) {
        const [position, company] = line.split('|').map(s => s.trim());
        currentExp.position = position;
        currentExp.company = company;
      }
      
      // Try to identify dates
      const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}/gi;
      const dates = line.match(dateRegex);
      if (dates?.length >= 2) {
        currentExp.startDate = new Date(dates[0]);
        currentExp.endDate = new Date(dates[1]);
      }
      
      // Collect description
      if (line.trim().length > 50) {
        currentExp.description = line.trim();
      }
    }
  }
  
  if (Object.keys(currentExp).length > 0) {
    experience.push(currentExp);
  }
  
  return experience;
};

// Extract skills
const extractSkills = (text) => {
  const commonSkills = [
    'javascript', 'python', 'java', 'c++', 'react', 'node', 'sql', 'mongodb',
    'aws', 'docker', 'kubernetes', 'html', 'css', 'git', 'agile', 'scrum',
    'leadership', 'communication', 'problem solving', 'teamwork'
  ];
  
  const skills = [];
  const textLower = text.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      skills.push({
        name: skill,
        level: 'Intermediate' // Default level
      });
    }
  });
  
  return skills;
};

export default parseResumeLocal;
