import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(`/authRoutes/reset-password/${token}`, {
        password,
      });
      res.sendStatus === 200 && setMessage("Password reset successful!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "Invalid or expired link.");
    }
  };

  return (
    <div style={{ width: "400px", margin: "50px auto" }}>
      <h2>Reset Password</h2>

      <form onSubmit={handleReset}>
        <label>New Password:</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-success mt-3" type="submit">
          Reset Password
        </button>

        {message && <p className="mt-3">{message}</p>}
      </form>
    </div>
  );
}
export default ResetPassword;
