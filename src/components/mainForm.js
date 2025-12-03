import React from "react";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Library Management</h1>

      <div style={styles.grid}>
        <button style={styles.btn} onClick={() => navigate("/author")}>
          ➕ Create Author
        </button>

        <button style={styles.btn} onClick={() => navigate("/book")}>
          ➕ Create Book
        </button>

        <button style={styles.btn} onClick={() => navigate("/updateAuthor")}>
          📄 Authors Listing...!
        </button>

        <button style={styles.btn} onClick={() => navigate("/updateBook")}>
          📄 Books Listing...!
        </button>
        {/* <button style={{backgroundColor: ""}} onClick={() => navigate("/login")}>
          LogIn Page...!
        </button> */}
        <button
          style={styles.btn}
          onClick={() => {
            localStorage.removeItem("auth");
            navigate("/login");
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
