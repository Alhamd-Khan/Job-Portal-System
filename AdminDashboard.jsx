import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaUsers, FaBriefcase, FaFileAlt, FaCheckCircle, FaBan } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [dashboardData, applicationData] = await Promise.all([
          axios.get("http://localhost:4000/api/v1/admin/dashboard", { withCredentials: true }),
          axios.get("http://localhost:4000/api/v1/admin/applications/stats", { withCredentials: true })
        ]);
        setStats(dashboardData.data.stats);
        setAppStats(applicationData.data.stats);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching statistics");
        if (error.response?.status === 401) {
          navigateTo("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [navigateTo]);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <FaUsers />,
      color: "#4CAF50",
    },
    {
      title: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: <FaBriefcase />,
      color: "#2196F3",
    },
    {
      title: "Applications",
      value: stats?.totalApplications || 0,
      icon: <FaFileAlt />,
      color: "#FF9800",
    },
    {
      title: "Employers",
      value: stats?.employerCount || 0,
      icon: <FaCheckCircle />,
      color: "#9C27B0",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          {statCards.map((card, index) => (
            <div key={index} className="stat-card" style={{ borderColor: card.color }}>
              <div className="icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="content">
                <h3>{card.title}</h3>
                <p className="value">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          
          {/* Recent Users Table */}
        <h3>Recent Users</h3>
<div className="table-container">
  <table className="custom-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Joined</th>
      </tr>
    </thead>
    <tbody>
      {stats?.recentUsers?.map((user) => (
        <tr key={user._id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.role}</td>
          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


          {/* Recent Jobs Table */}
          <h3>Recent Jobs</h3>
<div className="table-container">
  <table className="custom-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Category</th>
        <th>Status</th>
        <th>Posted</th>
      </tr>
    </thead>
    <tbody>
      {stats?.recentJobs?.map((job) => (
        <tr key={job._id}>
          <td>{job.title}</td>
          <td>{job.category}</td>
          <td>
            <span className={`status ${job.status?.toLowerCase() || "pending"}`}>
              {job.status || "N/A"}
            </span>
          </td>
          <td>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

          {/* Application Statistics */}
          <div className="section">
            <h3>Application Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card" style={{ borderColor: '#4CAF50' }}>
                <div className="icon" style={{ color: '#4CAF50' }}>
                  <FaFileAlt />
                </div>
                <div className="content">
                  <h3>Total Applications</h3>
                  <p className="value">{appStats?.total || 0}</p>
                </div>
              </div>
              <div className="stat-card" style={{ borderColor: '#FFC107' }}>
                <div className="icon" style={{ color: '#FFC107' }}>
                  <FaFileAlt />
                </div>
                <div className="content">
                  <h3>Pending Review</h3>
                  <p className="value">{appStats?.pending || 0}</p>
                </div>
              </div>
              <div className="stat-card" style={{ borderColor: '#4CAF50' }}>
                <div className="icon" style={{ color: '#4CAF50' }}>
                  <FaCheckCircle />
                </div>
                <div className="content">
                  <h3>Accepted</h3>
                  <p className="value">{appStats?.accepted || 0}</p>
                </div>
              </div>
              <div className="stat-card" style={{ borderColor: '#F44336' }}>
                <div className="icon" style={{ color: '#F44336' }}>
                  <FaBan />
                </div>
                <div className="content">
                  <h3>Rejected</h3>
                  <p className="value">{appStats?.rejected || 0}</p>
                </div>
              </div>
            </div>

            {/* Monthly Applications Chart */}
            {appStats?.monthlyApplications && (
              <div className="chart-container">
                <h3>Monthly Applications</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={appStats.monthlyApplications.map(item => ({
                    month: `${item._id.month}/${item._id.year}`,
                    applications: item.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#2196F3" name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
