import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCheck, FaBan } from 'react-icons/fa';

const JobModeration = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:4000/api/v1/admin/jobs',
        { withCredentials: true }
      );
      setJobs(data.jobs);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (jobId, status, reason = '') => {
    try {
      const { data } = await axios.put(
        'http://localhost:4000/api/v1/admin/job/moderate',
        {
          jobId,
          status,
          reason
        },
        { withCredentials: true }
      );
      toast.success(data.message);
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error moderating job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status.toLowerCase() === filter;
  });

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="job-moderation">
      <div className="container">
        <h2>Job Moderation</h2>

        <div className="filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Jobs</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Category</th>
                <th>Posted By</th>
                <th>Posted On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job._id}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>{job.category}</td>
                  <td>{job.postedBy?.name || 'N/A'}</td>
                  <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${job.status?.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="actions">
                    {job.status === 'pending' && (
                      <>
                        <button
                          className="approve"
                          onClick={() => handleModeration(job._id, 'approved')}
                          title="Approve Job"
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="reject"
                          onClick={() => {
                            const reason = window.prompt('Enter rejection reason:');
                            if (reason) {
                              handleModeration(job._id, 'rejected', reason);
                            }
                          }}
                          title="Reject Job"
                        >
                          <FaBan />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobModeration;
