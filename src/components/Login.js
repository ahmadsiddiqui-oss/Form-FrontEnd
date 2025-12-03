import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import "./login.css";
function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/userRoutes/login",
        credentials
      );
      if (res.data.user) {
        localStorage.setItem("auth", "true"); // used by ProtectedRoute
        navigate("/main"); // redirect after login
      }
    } catch (err) {
      console.log(err.response.data);
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleLogin}>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={credentials.email}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <div
          id="pass"
          style={{
            display: "flex",
            margin: "0px",
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
            value={credentials.password}
            onChange={handleChange}
            style={{
              padding: styles.input.padding,
              borderRadius: "5px",
              border: "none",
              width: "calc(100% - 2.5rem)",
            }}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ marginRight: "10px", position: "absolute", right: "7px" }}
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        </div>

        <button type="submit" style={{...styles.button, fontWeight: "bolder" }}>
          Login
        </button>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          I don't have an account?{" "}
          <Link to="/" style={{ color: "#007bff", textDecoration: "none", fontWeight: "bolder" }}>
            Sign Up.
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
    background: "#007bff",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Login;
