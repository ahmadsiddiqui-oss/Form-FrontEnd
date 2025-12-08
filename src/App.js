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

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book"
          element={
            <ProtectedRoute>
              <CreateBookForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/author"
          element={
            <ProtectedRoute>
              <CreateAuthorForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/updateAuthor"
          element={
            <ProtectedRoute>
              <AuthorsTable />
            </ProtectedRoute>
          }
        />

        <Route
          path="/updateBook"
          element={
            <ProtectedRoute>
              <BooksTable />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
