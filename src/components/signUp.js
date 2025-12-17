import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./axios";

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/authRoutes/signup", user);

      if (res.status === 201) {
        alert("User created successfully!");
        navigate("/main"); // Redirect to login page
      }
    } catch (err) {
      console.log(err.message);
      alert(err.response?.data?.error || err.message || "Signup failed");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSignup}>
        <h2>Sign Up</h2>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={user.name}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={user.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            justifyContent: "space-between",
            border: styles.input.border,
            borderRadius: styles.input.borderRadius,
          }}
        >
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter Password"
            value={user.password}
            onChange={handleChange}
            style={{ ...styles.input, border: "none", width: "100%" }}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ marginRight: "10px", position: "absolute", right: "7px" }}
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        </div>
        {/* Role dropdown */}
        <select
          name="role"
          onChange={handleChange}
          value={user.role}
          style={styles.input}
          // required
        >
          <option value="User">User</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>

        <button
          type="submit"
          style={{ ...styles.button, fontWeight: "bolder" }}
        >
          Sign Up
        </button>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Don't have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#007bff",
              textDecoration: "none",
              fontWeight: "bolder",
            }}
          >
            Login.
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f4f4",
  },
  form: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    border: "none",
    background: "#28a745",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Signup;
