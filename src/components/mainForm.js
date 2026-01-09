import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Navbar,
  Container,
  Card,
  Button,
  Badge,
  Row,
  Col,
  Offcanvas,
} from "react-bootstrap";
import api from "./axios";
import { getUserRole, getUserPermissions } from "./auth";
import { toast } from "react-toastify";
import CustomModal from "./modal";

function MainPage() {
  const navigate = useNavigate();
  const role = getUserRole();
  const permissions = getUserPermissions();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Sidebar toggle state
  const [showSidebar, setShowSidebar] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    file: null,
  });

  const handleEditClick = () => {
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      file: null,
    });
    setShowEditModal(true);
  };

  const handleEditUpdate = async () => {
    setUpdating(true);
    try {
      // 1. Update Name/Email if changed
      const updatedData = {};
      if (editFormData.name !== user.name) updatedData.name = editFormData.name;
      if (editFormData.email !== user.email)
        updatedData.email = editFormData.email;

      if (Object.keys(updatedData).length > 0) {
        // Pass the existing role to satisfy validaton, but don't change it.
        const currentRoleId = user.roleId || user.Role?.id || user.role;
        if (currentRoleId) {
          updatedData.role = currentRoleId;
        }

        await api.put(`/userRoutes/${user.id}`, updatedData);
        // Update user object in local storage
        const newUser = { ...user, ...updatedData };
        // Ensure role is preserved in local storage update if needed
        if (currentRoleId) newUser.roleId = currentRoleId;

        localStorage.setItem("user", JSON.stringify(newUser));
      }

      // 2. Upload File if selected
      if (editFormData.file) {
        const data = new FormData();
        data.append("myFile", editFormData.file);

        const res = await api.post("/fileRoutes/upload", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Update profile image in user object
        const currentUser = JSON.parse(localStorage.getItem("user"));
        currentUser.profileImage = { filename: res.data.profileImage.filename };
        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      toast.success("Profile updated successfully!");
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async (e) => {
    try {
      await api.post(`/authRoutes/logout`);
      localStorage.removeItem("auth");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Logout failed");
    }
  };

  const handleNavigation = (path) => {
    setShowSidebar(false); // Close sidebar after navigation
    navigate(path);
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" className="shadow py-2">
        <Container fluid>
          {/* Hamburger Menu Button */}
          <Button
            variant="outline-light"
            className="me-3"
            onClick={() => setShowSidebar(true)}
            style={{
              border: "none",
              fontSize: "24px",
              padding: "5px 10px",
            }}
          >
            ☰
          </Button>

          <Navbar.Brand href="#" className="fw-bold text-warning me-auto">
            📚 Library App
          </Navbar.Brand>

          <div className="d-flex align-items-center gap-3">
            <span className="text-light d-none d-md-block">{user.name}</span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Main Content Area */}
      <Container style={{ paddingTop: "30px" }}>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card
              className="shadow-lg border-0"
              onMouseEnter={() => setIsCardHovered(true)}
              onMouseLeave={() => setIsCardHovered(false)}
              style={{ position: "relative" }}
            >
              {isCardHovered && (
                <Button
                  variant="light"
                  className="position-absolute top-0 end-0 m-2 shadow-sm"
                  style={{
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}
                  onClick={handleEditClick}
                  title="Edit Profile"
                >
                  ✏️
                </Button>
              )}
              <Card.Header className="bg-primary text-white fw-bold text-center py-3">
                👤 User Dashboard
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-4 text-center">
                  <div
                    className="rounded-circle bg-light d-flex justify-content-center align-items-center mx-auto mb-3 border border-3 border-primary"
                    style={{
                      width: "100px",
                      height: "100px",
                      color: "#0d6efd",
                      fontSize: "2.5rem",
                      fontWeight: "bold",
                      overflow: "hidden", // Ensure image stays inside circle
                    }}
                  >
                    {user.profileImage?.filename ? (
                      <img
                        src={`http://localhost:5000/api/uploads/${user.profileImage.filename}`}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      (user.name?.charAt(0) || "U").toUpperCase()
                    )}
                  </div>
                  <h4 className="card-title fw-bold mb-1">
                    {user.name || "Guest User"}
                  </h4>
                  <p className="text-muted mb-0">{user.email}</p>
                </div>

                <div className="bg-light p-3 rounded mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fw-bold">Role:</span>
                    <Badge bg="success" className="px-3 py-2">
                      {user.role?.name || role || "N/A"}
                    </Badge>
                  </div>
                  {user.id && (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted fw-bold">User ID:</span>
                      <span className="fw-bold text-dark">#{user.id}</span>
                    </div>
                  )}
                </div>

                {/* Quick hint */}
                <div className="alert alert-info text-center" role="alert">
                  <small>
                    💡 Click the <strong>☰</strong> menu button in the navbar to
                    access quick actions
                  </small>
                </div>
              </Card.Body>
            </Card>

            {/* Edit Profile Modal */}
            <CustomModal
              show={showEditModal}
              title="Edit Profile"
              body={
                <form>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Profile Image</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          file: e.target.files[0],
                        })
                      }
                    />
                  </div>
                </form>
              }
              onClose={() => setShowEditModal(false)}
              onCancel={() => setShowEditModal(false)}
              onSubmit={handleEditUpdate}
              submitText={updating ? "Saving..." : "Save Changes"}
              cancelText="Close"
            />
          </Col>
        </Row>
      </Container>

      {/* Slide-out Sidebar (Offcanvas) */}
      <Offcanvas
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        placement="start"
        backdrop={true}
        scroll={false}
      >
        <Offcanvas.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
          }}
        >
          <Offcanvas.Title className="fw-bold">Quick Actions</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: "20px" }}>
          {/* Author Button */}
          {permissions.includes("read_author") && (
            <div className="mb-3">
              <Button
                variant="info"
                className="w-100 text-start fw-bold mb-2 text-white shadow-sm"
                style={{
                  borderRadius: "10px",
                  padding: "14px 18px",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleNavigation("/updateAuthor")}
              >
                📚 Authors
              </Button>
            </div>
          )}

          {/* Books Button */}
          {permissions.includes("read_book") && (
            <div className="mb-3">
              <Button
                variant="success"
                className="w-100 text-start fw-bold mb-2 shadow-sm"
                style={{
                  borderRadius: "10px",
                  padding: "14px 18px",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleNavigation("/updateBook")}
              >
                ✍️ Books
              </Button>
            </div>
          )}

          {/* User Button */}
          {permissions.includes("read_user") && (
            <div className="mb-3">
              <Button
                variant="warning"
                className="w-100 text-start fw-bold mb-2 text-white shadow-sm"
                style={{
                  borderRadius: "10px",
                  padding: "14px 18px",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleNavigation("/users")}
              >
                👥 Users
              </Button>
            </div>
          )}

          {/* Permissions Button */}
          {permissions.includes("manage_permissions") && (
            <div className="mb-3">
              <Button
                variant="danger"
                className="w-100 text-start fw-bold mb-2 text-white shadow-sm"
                style={{
                  borderRadius: "10px",
                  padding: "14px 18px",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleNavigation("/permission")}
              >
                🛡️ Permissions
              </Button>
            </div>
          )}

          {/* Info message if no permissions */}
          {!permissions.includes("read_author") &&
            !permissions.includes("read_book") &&
            !permissions.includes("read_user") &&
            !permissions.includes("create_author") &&
            !permissions.includes("create_book") &&
            !permissions.includes("manage_permissions") && (
              <div className="alert alert-warning" role="alert">
                <small>You don't have any permissions assigned yet.</small>
              </div>
            )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}

export default MainPage;
