import React from "react";
import { useNavigate } from "react-router-dom";
import api from "./axios";
import { getUserRole } from "./auth";

function MainPage() {
  const navigate = useNavigate();
  const role = getUserRole(); // ✅ get user role from token

  const handleLogout = async (e) => {
    try {
      const res = await api.post(`/authRoutes/logout`);
      console.log(res);
      localStorage.removeItem("auth");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      // localStorage.removeItem("role");
      navigate("/login"); // redirect after login
    } catch (err) {
      console.log(err.response.data);
      alert(err.response?.data?.error || "Login failed");
    }
  };
  console.log(role, "<<role>>");
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Library Management</h1>

      <div style={styles.grid}>
        <button
          style={{
            ...styles.btn,
            backgroundColor: "turquoise",
            marginTop: "40px",
          }}
          onClick={() => navigate("/author")}
        >
          ➕ Create Author
        </button>

        <button
          style={{
            ...styles.btn,
            backgroundColor: "turquoise",
            marginTop: "40px",
          }}
          onClick={() => navigate("/book")}
        >
          ➕ Create Book
        </button>

        {(role === "Admin" || role === "Manager") && (
          <button
            style={{
              ...styles.btn,
              backgroundColor: "turquoise",
              marginTop: "40px",
            }}
            onClick={() => navigate("/updateAuthor")}
          >
            📄 Update Author...!
          </button>
        )}

        {(role === "Admin" || role === "Manager") && (
          <button
            style={{
              ...styles.btn,
              backgroundColor: "turquoise",
              marginTop: "40px",
            }}
            onClick={() => navigate("/updateBook")}
          >
            📄 Update Books...!
          </button>
        )}
        <button
          style={{
            ...styles.btn,
            backgroundColor: "ActiveText",
            marginTop: "100px",
          }}
          onClick={() => navigate("/file")}
        >
          😎 Update Profile Picture..!
        </button>
        <button
          style={{ ...styles.btn, backgroundColor: "tan", marginTop: "100px" }}
          onClick={() => {
            handleLogout();
          }}
        >
          LogOut...!
        </button>
      </div>
    </div>
  );
}

// --- Simple inline styles ---
const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  btn: {
    padding: "15px 20px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#4A90E2",
    color: "white",
    fontWeight: "bold",
  },
};

export default MainPage;
