import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./components/mainForm";
import CreateBookForm from "./components/createBook";
import CreateAuthorForm from "./components/createAuthor";
import BooksTable from "./components/updateBook";
import AuthorsTable from "./components/updateAuthor";
import ProtectedRoute from "./components/ProtectedRoute"; // import it
import Login from "./components/Login";
import Signup from "./components/signUp";
import ForgotPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import PublicRoute from "./components/PublicRoute";
import Unauthorized from "./components/Unauthorised";
import File from "./components/File";
function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/file" element={<File />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/main"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "User"]}>
              <MainPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "User"]}>
              <CreateBookForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/author"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "User"]}>
              <CreateAuthorForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/updateAuthor"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "User"]}>
              <AuthorsTable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/updateBook"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <BooksTable />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
