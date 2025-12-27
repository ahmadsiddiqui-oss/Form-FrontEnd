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

function MainPage() {
  const navigate = useNavigate();
  const role = getUserRole();
  const permissions = getUserPermissions();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Sidebar toggle state
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = async (e) => {
    try {
      await api.post(`/authRoutes/logout`);
      localStorage.removeItem("auth");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.error || "Logout failed");
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
            <Card className="shadow-lg border-0">
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
                    }}/>
                  ) : (
                    user.name.charAt(0).toUpperCase()
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
          {/* Read Dropdown Section */}
          {(permissions.includes("read_author") ||
            permissions.includes("read_book") ||
            permissions.includes("read_user")) && (
            <div className="mb-4">
              <Button
                variant="info"
                className="w-100 text-start fw-bold mb-2"
                style={{
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "16px",
                }}
                onClick={(e) => {
                  const dropdown = e.currentTarget.nextElementSibling;
                  dropdown.style.display =
                    dropdown.style.display === "none" ? "block" : "none";
                }}
              >
                📖 Read
              </Button>
              <div style={{ paddingLeft: "15px", display: "none" }}>
                {permissions.includes("read_author") && (
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="w-100 text-start mb-2"
                    onClick={() => handleNavigation("/updateAuthor")}
                    style={{
                      borderRadius: "6px",
                      padding: "10px 15px",
                    }}
                  >
                    👤 View/Edit Authors
                  </Button>
                )}
                {permissions.includes("read_book") && (
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="w-100 text-start mb-2"
                    onClick={() => handleNavigation("/updateBook")}
                    style={{
                      borderRadius: "6px",
                      padding: "10px 15px",
                    }}
                  >
                    📚 View/Edit Books
                  </Button>
                )}
                {permissions.includes("create_user") && (
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="w-100 text-start mb-2"
                    onClick={() => handleNavigation("/users")}
                    style={{
                      borderRadius: "6px",
                      padding: "10px 15px",
                    }}
                  >
                    👥 View Users
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Write Dropdown Section */}
          {(permissions.includes("create_author") ||
            permissions.includes("create_book") ||
            permissions.includes("read_user")) && (
            <div className="mb-4">
              <Button
                variant="success"
                className="w-100 text-start fw-bold mb-2"
                style={{
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "16px",
                }}
                onClick={(e) => {
                  const dropdown = e.currentTarget.nextElementSibling;
                  dropdown.style.display =
                    dropdown.style.display === "none" ? "block" : "none";
                }}
              >
                ✍️ Write
              </Button>
              <div style={{ paddingLeft: "15px", display: "none" }}>
                {permissions.includes("create_author") && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="w-100 text-start mb-2"
                    onClick={() => handleNavigation("/author")}
                    style={{
                      borderRadius: "6px",
                      padding: "10px 15px",
                    }}
                  >
                    ➕ Create Author
                  </Button>
                )}
                {permissions.includes("create_book") && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="w-100 text-start mb-2"
                    onClick={() => handleNavigation("/book")}
                    style={{
                      borderRadius: "6px",
                      padding: "10px 15px",
                    }}
                  >
                    ➕ Create Book
                  </Button>
                )}
                {permissions.includes("read_user") && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="w-100 text-start mb-2"
                    onClick={() => handleNavigation("/file")}
                    style={{
                      borderRadius: "6px",
                      padding: "10px 15px",
                    }}
                  >
                    📤 Upload Profile Picture
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Permissions Dropdown Section */}
          {permissions.includes("manage_permissions") && (
            <div className="mb-4">
              <Button
                variant="danger"
                className="w-100 text-start fw-bold mb-2"
                style={{
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "16px",
                }}
                onClick={(e) => {
                  const dropdown = e.currentTarget.nextElementSibling;
                  dropdown.style.display =
                    dropdown.style.display === "none" ? "block" : "none";
                }}
              >
                🛡️ Permissions
              </Button>
              <div style={{ paddingLeft: "15px", display: "none" }}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="w-100 text-start mb-2"
                  onClick={() => handleNavigation("/permission")}
                  style={{
                    borderRadius: "6px",
                    padding: "10px 15px",
                  }}
                >
                  ⚙️ Manage Permissions
                </Button>
              </div>
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
