import React, { useState } from "react";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/userRoutes/forgot-password",
        {
          email,
        }
      );
      res.sendStatus === 200 &&
        setMessage("Reset link sent! Check your email.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div style={{ width: "400px", margin: "50px auto" }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="btn btn-primary mt-3" type="submit">
          Send Reset Email
        </button>

        {message && <p className="mt-3">{message}</p>}
      </form>
    </div>
  );
}

export default ForgotPassword;
