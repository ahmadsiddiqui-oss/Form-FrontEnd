import React, { useEffect, useState } from "react";
import CustomModal from "./modal";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "./axios";

function AuthorsTable() {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  // const [authorForm, setAuthorForm] = useState({ name: "", email: "" });
  // const [errors, setErrors] = useState("");

  const authorUpdateSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Invalid format email")
      .required("Email is required"),
  });
  const {
    register,
    getValues,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(authorUpdateSchema),
    mode: "onChange",
  });
  // Fetch authors
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await api.get("/authorRoutes");
        setAuthors(res.data);
      } catch (err) {
        console.log();
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  // Sync form when a new author is selected
  useEffect(() => {
    if (selectedAuthor) {
      reset({
        name: selectedAuthor.name || "",
        email: selectedAuthor.email || "",
      });
    }
  }, [selectedAuthor, reset]);

  const handleUpdate = async (data) => {
    if (!selectedAuthor) return;
    try {
      const res = await api.put(`/authorRoutes/${selectedAuthor.id}`, data);
      const updatedAuthor = res.data || { ...selectedAuthor, ...data };
      setAuthors((prev) =>
        prev.map((a) => (a.id === selectedAuthor.id ? updatedAuthor : a))
      );
      setSelectedAuthor(null); // clear selection
      alert("Author updated successfully..!");
    } catch (err) {
      console.log(err);
      console.log("err", err?.toString()?.split(": ")[1]);
      alert("Failed to update book: " + err.message);
    }
  };
  console.log(errors, getValues());

  const handleDelete = async (id) => {
    console.log(id, "id errorrrrr");
    if (!window.confirm("Are you sure you want to delete this author?")) return;
    try {
      await api.delete(`/authorRoutes/${id}`);
      setAuthors((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading authors...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto" }}>
      <h2 style={{ display: "flex", justifyContent: "space-between" }}>
        Authors....!
        <button
          style={{
            display: "flex",
            padding: "10px 25px",
            backgroundColor: "peachpuff",
            border: "none",
            marginLeft: "186px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/main")}
        >
          🏠 Home
        </button>
      </h2>
      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", textAlign: "left" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>
                <button
                  style={{
                    background: "#f86e48ff",
                    border: "0px",
                    padding: "7px 25px",
                    borderRadius: "5px",
                  }}
                  onClick={() => setSelectedAuthor(a)}
                >
                  Edit
                </button>{" "}
                <Button
                  variant="primary"
                  onClick={() => {
                    handleDelete(a.id);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Reusable Modal */}
      {selectedAuthor && (
        <CustomModal
          show={true}
          modalId="authorModal"
          title="Edit Author"
          body={
            <form>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input {...register("name")} className="form-control" />
                {errors.name && (
                  <span className="text-danger">{errors.name.message}</span>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input {...register("email")} className="form-control" />
                {errors.email && (
                  <span className="text-danger">{errors.email.message}</span>
                )}
              </div>
            </form>
          }
          onClose={() => setSelectedAuthor(null)}
          onCancel={() => setSelectedAuthor(null)}
          onSubmit={handleSubmit(handleUpdate)}
          submitText="Save Changes"
          cancelText="Close"
        />
      )}
    </div>
  );
}

export default AuthorsTable;
