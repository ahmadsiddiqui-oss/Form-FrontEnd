import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import api from "./axios";

// Define Yup validation schema
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
});

function CreateAuthorForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setErrors("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors("");

    try {
      await schema.validate(formData, { abortEarly: false });

      const res = await api.post("/authorRoutes", formData);
      alert("Author created successfully!");
      console.log(res.data);

      // Reset form
      setFormData({ name: "", email: "" });
    } catch (err) {
      if (err.name === "ValidationError") {
        // Collect all validation errors
        const formErrors = {};
        err.inner.forEach((e) => {
          formErrors[e.path] = e.message;
        });
        // setErrors(formErrors);
      } else {
        // Extract error from response
        let errorMsg = err.response?.data?.errors || "Unknown error";

        // Normalize: if it's an array, join; if string, keep as is
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg.join(", ");
        }

        console.log("Error creating author:", errorMsg);
        // alert(`Failed to create author: ${errorMsg}`);
        setErrors(errorMsg); // or setErrors({ general: errorMsg }) for consistency
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "20px auto" }}>
      <h2>Create Author</h2>

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Author name"
          style={{ width: "100%", padding: "8px" }}
          value={formData.name}
          onChange={handleChange}
          required
        />

        <div style={{ margin: "20px 0px" }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Author email"
            style={{ width: "100%", padding: "8px" }}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>{errors && <span className="text-danger">{errors}</span>}</div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 25px",
            backgroundColor: "skyblue",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {submitting ? "Saving..." : "Create Author"}
        </button>
        <button
          style={{
            padding: "10px 25px",
            backgroundColor: "springgreen",
            border: "none",
            marginLeft: "185px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/main")}
        >
          🏠 Home
        </button>
      </form>
    </div>
  );
}

export default CreateAuthorForm;
