import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimes, FaInfoCircle } from 'react-icons/fa';

const JobMatches = () => {
  const [matches, setMatches] = useState({
    recommendations: [],
    otherJobs: [],
    skillSuggestions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobMatches();
  }, []);

  const fetchJobMatches = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:4000/api/v1/recommendations',
        { withCredentials: true }
      );
      setMatches(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching job matches');
    } finally {
      setLoading(false);
    }
  };

  const getMatchLabel = (score) => {
    if (score >= 80) return { text: 'Strong Match', color: '#4caf50' };
    if (score >= 60) return { text: 'Good Match', color: '#2196f3' };
    if (score >= 40) return { text: 'Fair Match', color: '#ff9800' };
    return { text: 'Low Match', color: '#f44336' };
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="job-matches">
      <div className="container">
        <h2>Job Matches</h2>

        {/* Skill Suggestions */}
        {matches.skillSuggestions?.length > 0 && (
          <div className="skill-suggestions">
            <h3>
              <FaInfoCircle /> Skill Recommendations
            </h3>
            <p>Consider developing these skills to improve your job matches:</p>
            <ul>
              {matches.skillSuggestions.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Top Recommendations */}
        <div className="recommendations">
          <h3>Best Matches</h3>
          <div className="job-grid">
            {matches.recommendations.map(job => {
              const matchLabel = getMatchLabel(job.matchScore);
              return (
                <div className="job-card" key={job._id}>
                  <div className="match-score" style={{ color: matchLabel.color }}>
                    <FaCheckCircle />
                    <span>{matchLabel.text} ({job.matchScore}%)</span>
                  </div>
                  <h4>{job.title}</h4>
                  <p className="company">{job.employer?.company}</p>
                  <p className="location">{job.location}</p>
                  {job.matchDetails?.strengths?.length > 0 && (
                    <div className="strengths">
                      <h5>Strengths:</h5>
                      <ul>
                        {job.matchDetails.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {job.matchDetails?.improvements?.length > 0 && (
                    <div className="improvements">
                      <h5>Areas for Improvement:</h5>
                      <ul>
                        {job.matchDetails.improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Link to={`/job/${job._id}`} className="view-job">
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Other Job Matches */}
        {matches.otherJobs.length > 0 && (
          <div className="other-matches">
            <h3>Other Potential Matches</h3>
            <div className="job-grid">
              {matches.otherJobs.map(job => {
                const matchLabel = getMatchLabel(job.matchScore);
                return (
                  <div className="job-card" key={job._id}>
                    <div className="match-score" style={{ color: matchLabel.color }}>
                      <span>{matchLabel.text} ({job.matchScore}%)</span>
                    </div>
                    <h4>{job.title}</h4>
                    <p className="company">{job.employer?.company}</p>
                    <p className="location">{job.location}</p>
                    <Link to={`/job/${job._id}`} className="view-job">
                      View Details
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatches;
