import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("authToken");

  // 1️⃣ Token nahi → login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    // 2️⃣ Token decode
    const decoded = jwtDecode(token);
    const userRole = decoded.role;
    console.log(userRole, decoded);

    // 3️⃣ Role allow hai ya nahi
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" />;
    }

    // 4️⃣ Sab ok → page dikhao
    return children;
  } catch (error) {
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;

// import React from "react";
// import { Navigate } from "react-router-dom";

// function ProtectedRoute({ children }) {
//   const isAuthenticated = localStorage.getItem("auth");

//   // If logged in → show children, else redirect to /login,,
//   return isAuthenticated == "true" ? children : <Navigate to="/login" />;
// }

// export default ProtectedRoute;
