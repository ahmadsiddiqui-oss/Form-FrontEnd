import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import api from "./axios";

const schema = yup.object().shape({
  title: yup.string().required("title is required"),
  isbn: yup.string().required("isbn is required"),
  publishedDate: yup.date().required("publishedDate is required"),
});

function CreateBookForm() {
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    publishedDate: "",
    authorId: "",
  });

  const [authors, setAuthors] = useState([]);
  const [errors, setErrors] = useState("");
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // --- Auto Fill Published Date with Local Timezone ---
  useEffect(() => {
    const localDate = new Date().toISOString().slice(0, 16); // yyyy-mm-ddThh:mm
    setFormData((prev) => ({ ...prev, publishedDate: localDate }));
  }, []);

  // --- Fetch authors for dropdown ---
  useEffect(() => {
    const fetchAuthors = async () => {
      setLoadingAuthors(true);
      try {
        const res = await api.get("/authorRoutes");
        setAuthors(res.data);
      } catch (err) {
        console.error("Error fetching authors:", err);
      } finally {
        setLoadingAuthors(false);
      }
    };

    fetchAuthors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await schema.validate(formData, { abortEarly: false });

      const res = await api.post("/bookRoutes", formData);
      alert("Book created successfully!");
      console.log(res.data);

      setFormData({
        title: "",
        isbn: "",
        publishedDate: new Date().toISOString().slice(0, 16),
        authorId: "",
      });
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
      <h2>Create Book</h2>

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          placeholder="Book title"
          style={{ width: "100%", padding: "8px" }}
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div style={{ margin: "20px 0px" }}>
          <label>ISBN</label>
          <input
            type="text"
            name="isbn"
            placeholder="ISBN number"
            style={{ width: "100%", padding: "8px" }}
            value={formData.isbn}
            onChange={handleChange}
            required
          />
        </div>

        <label>Published Date</label>
        <input
          type="datetime-local"
          name="publishedDate"
          style={{ width: "100%", padding: "8px" }}
          value={formData.publishedDate}
          onChange={handleChange}
          required
        />

        <div style={{ margin: "20px 0px" }}>
          <label>Author</label>
          <select
            name="authorId"
            value={formData.authorId}
            style={{ width: "100%", padding: "8px" }}
            onChange={handleChange}
            required
          >
            <option value="">Select Author</option>
            {loadingAuthors ? (
              <option>Loading...</option>
            ) : (
              authors.map((auth) => (
                <option key={auth.id} value={auth.id}>
                  {auth.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div>{errors && <span className="text-danger">{errors}</span>}</div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 25px",
            backgroundColor: "skyBlue",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {submitting ? "Saving..." : "Create Book"}
        </button>
        <button
          style={{
            padding: "10px 25px",
            backgroundColor: "springgreen",
            border: "none",
            marginLeft: "186px",
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

export default CreateBookForm;
