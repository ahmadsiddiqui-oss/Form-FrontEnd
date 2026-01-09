import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Form, Badge, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "./axios";
import styles from "./Css";
import CustomModal from "./modal";
import { toast } from "react-toastify";
import { getUserPermissions } from "./auth";

const UsersTable = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const permissions = getUserPermissions();
  const canWrite = permissions.includes("create_user");

  // Selection/Edit States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/userRoutes?page=${page}&limit=${limit}&search=${search}`
      );
      setUsers(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  const fetchRoles = React.useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await api.get("/roleRoutes");
      setRoles(res.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/userRoutes/${id}`);
      toast("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    // Use roleId if available, fallback to Role object id, then fallback to original role string/id
    setEditData({
      email: user.email,
      password: "",
      role: user.roleId || user.Role?.id || user.role || "",
    });
    setShowEditModal(true);
    fetchRoles();
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await api.put(`/userRoutes/${selectedUser.id}`, editData);
      toast("User updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
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
        <Form.Label>New Password.</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter new password"
          value={editData.password}
          onChange={(e) =>
            setEditData({ ...editData, password: e.target.value })
          }
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Role</Form.Label>
        <Form.Select
          value={editData.role}
          onChange={(e) => setEditData({ ...editData, role: e.target.value })}
        >
          {/* <option value="">Select Role</option> */}
          {loadingRoles ? (
            <option disabled>Loading roles...</option>
          ) : (
            roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))
          )}
        </Form.Select>
      </Form.Group>
    </Form>
  );

  if (loading && users.length === 0) {
    return (
      <div className="text-center py-5 mt-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2 text-muted fw-bold">Loading User Directory...</p>
      </div>
    );
  }

  if (!permissions.includes("read_user")) {
    return (
      <div className="container mt-5 text-center">
        <Card
          className="border-0 shadow-sm p-5"
          style={{ borderRadius: "15px" }}
        >
          <div className="text-danger mb-3" style={{ fontSize: "3rem" }}>
            🚫
          </div>
          <h3 className="fw-bold">Access Denied</h3>
          <p className="text-muted">
            You do not have permission to view the User Management section.
          </p>
          <div className="mt-4">
            <Button
              variant="dark"
              onClick={() => navigate("/main")}
              className="px-5 py-2 fw-bold"
              style={{ borderRadius: "8px" }}
            >
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark m-0">
              <span style={{ color: "#f6ad55" }}>👥</span> User Management
            </h2>
            <p className="text-muted mb-0">
              View and manage system users and their roles
            </p>
          </div>
          <Button
            variant="outline-secondary"
            className="shadow-sm px-4 fw-bold"
            style={{ borderRadius: "8px" }}
            onClick={() => navigate("/main")}
          >
            🏠 Home
          </Button>
        </div>

        {/* Filters Card */}
        <Card
          className="border-0 shadow-sm mb-4"
          style={{ borderRadius: "12px" }}
        >
          <Card.Body className="p-3">
            <div className="row g-3">
              <div className="col-md-9">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    🔍
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setSearch(searchInput);
                        setPage(1);
                      }
                    }}
                    style={{ borderRadius: "0 8px 8px 0", boxShadow: "none" }}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <Button
                  variant="dark"
                  className="w-100 fw-bold shadow-sm"
                  style={{ borderRadius: "8px" }}
                  onClick={() => {
                    setSearch(searchInput);
                    setPage(1);
                  }}
                >
                  Search Users
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Table Card */}
        <Card
          className="border-0 shadow-sm"
          style={{ borderRadius: "12px", overflow: "hidden" }}
        >
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light text-muted">
                  <tr>
                    <th
                      className="ps-4 py-3"
                      style={{
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      User Profile
                    </th>
                    <th
                      className="py-3"
                      style={{
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Email
                    </th>
                    <th
                      className="py-3"
                      style={{
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Role
                    </th>
                    {canWrite && (
                      <th
                        className="pe-4 text-end py-3"
                        style={{
                          fontSize: "0.85rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                              style={{
                                width: "40px",
                                height: "40px",
                                background:
                                  "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)",
                                fontSize: "14px",
                                marginRight: "12px",
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">
                                {user.name}
                              </div>
                              <small className="text-muted">
                                ID: #{user.id}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-dark">{user.email}</div>
                        </td>
                        <td>
                          <Badge
                            bg="light"
                            className="text-dark border px-3 py-2 fw-normal"
                            style={{ borderRadius: "6px" }}
                          >
                            🎭 {user.Role?.name || "No Role"}
                          </Badge>
                        </td>
                        {canWrite && (
                          <td className="pe-4 text-end">
                            <div className="d-flex gap-2 justify-content-end">
                              <Button
                                variant="light"
                                size="sm"
                                className="text-primary shadow-sm"
                                style={{
                                  borderRadius: "6px",
                                  backgroundColor: "#f0f7ff",
                                }}
                                onClick={() => handleEditClick(user)}
                                title="Edit"
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="light"
                                size="sm"
                                className="text-danger shadow-sm"
                                style={{
                                  borderRadius: "6px",
                                  backgroundColor: "#fff5f5",
                                }}
                                onClick={() => handleDelete(user.id)}
                                title="Delete"
                              >
                                🗑️
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={canWrite ? 4 : 3}
                        className="text-center py-5"
                      >
                        <div className="text-muted">
                          <div style={{ fontSize: "2rem" }}>🔦</div>
                          <p className="mt-2 mb-0">
                            No users found matching your search
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Section */}
          <div className="p-4 bg-light border-top d-flex justify-content-between align-items-center">
            <small className="text-muted fw-bold">
              Showing page {meta.page} of {meta.totalPages || 1}
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0 gap-1">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <Button
                    variant="white"
                    className="border shadow-sm px-3"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    style={{ borderRadius: "6px" }}
                  >
                    Previous
                  </Button>
                </li>
                <li
                  className={`page-item ${
                    page >= meta.totalPages ? "disabled" : ""
                  }`}
                >
                  <Button
                    variant="white"
                    className="border shadow-sm px-3 ms-2"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= meta.totalPages}
                    style={{ borderRadius: "6px" }}
                  >
                    Next
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </Card>
      </div>

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
