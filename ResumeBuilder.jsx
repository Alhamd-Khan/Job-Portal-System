import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ResumeBuilder = () => {
  const navigateTo = useNavigate();
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      linkedIn: "",
      portfolio: ""
    },
    education: [{
      degree: "",
      institution: "",
      startYear: "",
      endYear: "",
      grade: "",
      description: ""
    }],
    experience: [{
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: [""]
    }],
    skills: [{
      name: "",
      level: "Beginner"
    }],
    certifications: [{
      name: "",
      issuer: "",
      date: "",
      url: ""
    }],
    projects: [{
      title: "",
      description: "",
      technologies: [""],
      url: "",
      startDate: "",
      endDate: ""
    }]
  });

  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    // Fetch existing resume data if available
    const fetchResume = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/v1/resume/me", {
          withCredentials: true
        });
        if (data.success) {
          setResumeData(data.resume);
        }
      } catch (error) {
        // It's okay if no resume exists yet
        console.log("No existing resume found");
      }
    };
    fetchResume();
  }, []);

  // Handle form input changes
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  };

  // Handle array field changes (education, experience, etc.)
  const handleArrayFieldChange = (section, index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new item to array fields
  const handleAddItem = (section, defaultItem) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], defaultItem]
    }));
  };

  // Remove item from array fields
  const handleRemoveItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  // LinkedIn Import Handler
  const handleLinkedInImport = () => {
    window.location.href = "http://localhost:4000/api/v1/linkedin/auth";
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("resumeData", JSON.stringify(resumeData));
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/resume/create",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (data.success) {
        toast.success("Resume updated successfully");
        navigateTo("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="resume-builder">
      <div className="container">
        <button
          type="button"
          onClick={handleLinkedInImport}
          style={{ marginBottom: '1rem', background: '#0077b5', color: 'white' }}
        >
          Import from LinkedIn
        </button>
        <h2>Resume Builder</h2>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <section className="personal-info">
            <h3>Personal Information</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="First Name"
                name="firstName"
                value={resumeData.personalInfo.firstName}
                onChange={handlePersonalInfoChange}
              />
              <input
                type="text"
                placeholder="Last Name"
                name="lastName"
                value={resumeData.personalInfo.lastName}
                onChange={handlePersonalInfoChange}
              />
              {/* Add other personal info fields */}
            </div>
          </section>

          {/* Education */}
          <section className="education">
            <h3>Education</h3>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="education-item">
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => handleArrayFieldChange("education", index, "degree", e.target.value)}
                />
                {/* Add other education fields */}
                {index > 0 && (
                  <button type="button" onClick={() => handleRemoveItem("education", index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("education", {
                degree: "",
                institution: "",
                startYear: "",
                endYear: "",
                grade: "",
                description: ""
              })}
            >
              Add Education
            </button>
          </section>

          {/* Similar sections for Experience, Skills, etc. */}

          {/* Resume File Upload */}
          <section className="resume-upload">
            <h3>Upload Resume File</h3>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </section>

          <button type="submit" className="submit-btn">
            Save Resume
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeBuilder;
