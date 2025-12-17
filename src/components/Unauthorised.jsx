import React from "react";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🚫 Access Denied!</h1>
      <p>You do not have permission to view this page.</p>
      <button
        onClick={() => navigate("/main")}
        style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}
      >
        Go Back
      </button>
    </div>
  );
}

export default Unauthorized;
