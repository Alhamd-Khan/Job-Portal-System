import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEdit, FaBan, FaCheck } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/admin/users",
        { withCredentials: true }
      );
      setUsers(data.users);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const { data } = await axios.put(
        "http://localhost:4000/api/v1/admin/user/status",
        {
          userId,
          status: newStatus,
        },
        { withCredentials: true }
      );
      toast.success(data.message);
      fetchUsers(); // Refresh user list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating user status");
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="user-management">
      <div className="container">
        <h2>User Management</h2>
        
        <div className="filters">
          <input
            type="text"
            placeholder="Search users..."
            onChange={(e) => {/* Implement search */}}
          />
          <select onChange={(e) => {/* Implement filter */}}>
            <option value="">All Roles</option>
            <option value="Job Seeker">Job Seekers</option>
            <option value="Employer">Employers</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status ${user.status?.toLowerCase()}`}>
                      {user.status || "Active"}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="edit"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    {user.status !== "banned" ? (
                      <button
                        className="ban"
                        onClick={() => handleStatusUpdate(user._id, "banned")}
                      >
                        <FaBan />
                      </button>
                    ) : (
                      <button
                        className="activate"
                        onClick={() => handleStatusUpdate(user._id, "active")}
                      >
                        <FaCheck />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Edit Modal */}
        {showModal && selectedUser && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit User</h3>
              {/* Add edit form */}
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
