import React from "react";
import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const token = localStorage.getItem("authToken");

  // If token exists → user is already logged in → send to main page
  if (token) {
    return <Navigate to="/main" replace />;
  }

  return children;
}
export default PublicRoute;
