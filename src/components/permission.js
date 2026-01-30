import React, { useState, useEffect } from "react";
import { Form, Spinner, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import CustomModal from "./modal";
import api from "./axios";
import styles from "./Css"; // Using the styles you created
import { toast } from "react-toastify";
const UserPermissionsModal = ({ show, onClose, userId, userName }) => {
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]); // Array of Direct Permission IDs
  const [rolePermissions, setRolePermissions] = useState([]); // Array of Role-based Permission IDs
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRoleName, setUserRoleName] = useState("");

  useEffect(() => {
    if (show && userId) {
      fetchData();
    }
  }, [show, userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all available permissions from the system
      const permsRes = await api.get("/permissionRoutes/permissions");
      setAllPermissions(permsRes.data || []);

      // 2. Fetch user's current data
      const userRes = await api.get(`/userRoutes/${userId}`);
      const userData = userRes.data.data || userRes.data;

      // 3. Extract Direct Permissions
      const directPerms =
        userData?.userPermissions || userData?.UserPermissions || [];
      setUserPermissions(directPerms.map((p) => String(p.id)));

      // 4. Extract Role-based Permissions (based on your screenshot casing)
      const roleData = userData?.Role || userData?.role;
      const rolePerms = roleData?.Permissions || roleData?.permissions || [];
      setRolePermissions(rolePerms.map((p) => String(p.id)));
      setUserRoleName(roleData?.name || roleData?.Name || "No Role");
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (permId) => {
    const idStr = String(permId);
    if (userPermissions.includes(idStr)) {
      setUserPermissions((prev) => prev.filter((id) => id !== idStr));
    } else {
      setUserPermissions((prev) => [...prev, idStr]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/permissionRoutes/assign-permissions`, {
        userId,
        permissions: userPermissions,
      });

      toast("Permissions updated successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions.");
    } finally {
      setSaving(false);
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }
    return (
      <div className="container-fluid p-0">
        <div className="mb-3">
          <p className="text-muted">
            Manage access control for <strong>{userName || "User"}</strong>.
            Enable or disable permissions below.
          </p>
        </div>
        <div className="row g-2">
          {allPermissions.length > 0 ? (
            allPermissions.map((perm) => {
              const idStr = String(perm.id);
              const isDirect = userPermissions.includes(idStr);
              const isInherited = rolePermissions.includes(idStr);
              const isChecked = isDirect;

              return (
                <div className="col-12" key={perm.id}>
                  <div
                    className="p-3 border rounded d-flex justify-content-between align-items-center transition-all shadow-sm mb-2"
                    style={{
                      backgroundColor: isChecked ? "#f0f9ff" : "#fff",
                      borderColor: isChecked ? "#0ea5e9" : "#e5e7eb",
                      transition: "0.2s all ease-in-out",
                      cursor: "pointer",
                      borderLeft: isInherited
                        ? "4px solid #0ea5e9"
                        : "1px solid #e5e7eb",
                    }}
                    onClick={() => handleToggle(perm.id)}
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong
                          style={{ color: isChecked ? "#0284c7" : "#333" }}
                        >
                          {perm.name}
                        </strong>
                      </div>
                      {perm.description && (
                        <div
                          className="text-muted small"
                          style={{ fontSize: "0.85em" }}
                        >
                          {perm.description}
                        </div>
                      )}
                    </div>
                    <Form.Check
                      type="switch"
                      id={`perm-switch-${perm.id}`}
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ pointerEvents: "none" }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center py-4 text-muted">
              No permissions found in the system.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <CustomModal
      show={show}
      title="Manage Permissions"
      modalId="permissionModal"
      body={renderBody()}
      onClose={onClose}
      onCancel={onClose}
      onSubmit={handleSave}
      submitText={saving ? "Saving..." : "Save Changes"}
      cancelText="Cancel"
    />
  );
};

const ManagePermissions = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [searchTerm, setSearchTerm] = useState("");
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    prevPage: null,
    nextPage: null,
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // api call with query params
      const res = await api.get(
        `/userRoutes?page=${page}&limit=${limit}&search=${searchTerm}`
      );
      // Expected response format: { data: [...], meta: { ... } }
      setUsers(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      console.error("Error fetching users:", err);
      // Fallback if structure is different
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page
    fetchUsers(); // Force fetch
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>All Users Permissions</h2>

      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex gap-2 w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <button style={styles.btn} onClick={() => navigate("/main")}>
          Home
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table hover responsive bordered className="mt-3">
            <thead className="bg-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.Role.name}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="text-white fw-bold"
                        onClick={() => handleEditClick(user)}
                      >
                        Manage Permissions
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination Controls */}
          {users.length > 0 && (
            <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
              <Button
                variant="outline-primary"
                disabled={!meta.prevPage}
                onClick={() => setPage(meta.prevPage)}
              >
                Previous
              </Button>
              <span>
                Page {meta.page} of {meta.totalPages || 1}
              </span>
              <Button
                variant="outline-primary"
                disabled={!meta.nextPage}
                onClick={() => setPage(meta.nextPage)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <UserPermissionsModal
        show={showModal}
        userId={selectedUser?.id}
        userName={selectedUser?.name}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default ManagePermissions;
