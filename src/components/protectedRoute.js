import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("auth");

  // If logged in → show children, else redirect to /login,,
  return isAuthenticated == "true" ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
