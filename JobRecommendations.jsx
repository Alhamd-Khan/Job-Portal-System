import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaStar, FaChartLine, FaLightbulb } from 'react-icons/fa';

const JobRecommendations = () => {
  const [recommendations, setRecommendations] = useState({
    recommendations: [],
    otherJobs: [],
    skillSuggestions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/jobs/recommendations",
        { withCredentials: true }
      );
      setRecommendations(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching recommendations");
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFA000';
    return '#F44336';
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="job-recommendations">
      <div className="container">
        <h2><FaChartLine /> Personalized Job Recommendations</h2>

        {/* Skill Suggestions */}
        {recommendations.skillSuggestions?.length > 0 && (
          <div className="skill-suggestions">
            <h3><FaLightbulb /> Suggested Skills to Improve Your Profile</h3>
            <div className="skills-grid">
              {recommendations.skillSuggestions.map((skill, index) => (
                <div key={index} className="skill-card">
                  <h4>{skill}</h4>
                  <p>High demand in your field</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Matches */}
        <section className="recommended-jobs">
          <h3><FaStar /> Best Matches</h3>
          <div className="jobs-grid">
            {recommendations.recommendations.map(job => (
              <div key={job._id} className="job-card">
                <div className="match-score" 
                     style={{ backgroundColor: getMatchScoreColor(job.matchScore) }}>
                  {job.matchScore}% Match
                </div>
                <h4>{job.title}</h4>
                <p className="company">{job.employer?.company || job.employer?.name}</p>
                <p className="location">{job.location}</p>
                <div className="salary">
                  {job.fixedSalary ? 
                    `$${job.fixedSalary}` : 
                    `$${job.salaryFrom} - $${job.salaryTo}`}
                </div>
                <Link to={`/job/${job._id}`} className="view-btn">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Other Opportunities */}
        {recommendations.otherJobs?.length > 0 && (
          <section className="other-jobs">
            <h3>Other Opportunities</h3>
            <div className="jobs-grid">
              {recommendations.otherJobs.map(job => (
                <div key={job._id} className="job-card">
                  <div className="match-score" 
                       style={{ backgroundColor: getMatchScoreColor(job.matchScore) }}>
                    {job.matchScore}% Match
                  </div>
                  <h4>{job.title}</h4>
                  <p className="company">{job.employer?.company || job.employer?.name}</p>
                  <p className="location">{job.location}</p>
                  <div className="salary">
                    {job.fixedSalary ? 
                      `$${job.fixedSalary}` : 
                      `$${job.salaryFrom} - $${job.salaryTo}`}
                  </div>
                  <Link to={`/job/${job._id}`} className="view-btn">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
