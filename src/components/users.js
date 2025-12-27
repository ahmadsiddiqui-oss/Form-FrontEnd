import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Form, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "./axios";
import styles from "./Css";
import CustomModal from "./modal";

const UsersTable = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Selection/Edit States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ email: "", password: "" });

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/userRoutes?page=${page}&limit=${limit}&search=${searchTerm}`
      );
      setUsers(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/userRoutes/${id}`);
      alert("User deleted successfully");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditData({ email: user.email, password: "" });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await api.put(`/userRoutes/${selectedUser.id}`, editData);
      alert("User updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const renderEditBody = () => (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Email Address</Form.Label>
        <Form.Control
          type="email"
          value={editData.email}
          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>New Password (leave blank to keep current)</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter new password"
          value={editData.password}
          onChange={(e) =>
            setEditData({ ...editData, password: e.target.value })
          }
        />
      </Form.Group>
    </Form>
  );

  return (
    <div style={styles.container}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={styles.title} className="m-0">
          👥 User Management
        </h2>
        <Button variant="dark" onClick={() => navigate("/main")}>
          🏠 Home
        </Button>
      </div>

      <div className="mb-3 d-flex gap-2">
        <Form.Control
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table hover responsive bordered className="shadow-sm bg-white">
            <thead className="bg-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg="info">{user.Role?.name || "No Role"}</Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditClick(user)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </Button>
            <span className="align-self-center">
              Page {page} of {meta.totalPages}
            </span>
            <Button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}

      <CustomModal
        show={showEditModal}
        title={`Edit User: ${selectedUser?.name}`}
        body={renderEditBody()}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
        submitText={submitting ? "Updating..." : "Save Changes"}
      />
    </div>
  );
};

export default UsersTable;
