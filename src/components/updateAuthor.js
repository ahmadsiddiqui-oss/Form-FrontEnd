/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import CustomModal from "./modal";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "./axios";
import "bootstrap/dist/css/bootstrap.min.css";

import { getUserPermissions } from "./auth";
import { toast } from "react-toastify";

function AuthorsTable() {
  const navigate = useNavigate();
  const permissions = getUserPermissions();
  const canWrite = permissions.includes("create_author");
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(2);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("ASC");

  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 0,
    prevPage: null,
    nextPage: null,
  });

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
  const fetchAuthors = React.useCallback(
    async (page = 1, limit = 2, sort = "", order = "") => {
      setLoading(true);
      try {
        const res = await api.get(
          `/authorRoutes?page=${page}&limit=${limit}&search=${search}&sort=${sort}&order=${order}`,
          {
            params: { page, limit },
          }
        );
        setAuthors(res.data.data || []);
        setMeta(res.data.meta || {});
      } catch (err) {
        console.error(err);
        setAuthors([]);
        setMeta({});
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchAuthors(page, limit, sort, order);
  }, [page, limit, sort, order, fetchAuthors]);
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
      toast("Author updated successfully..!");
    } catch (err) {
      console.log(err);
      console.log("err", err?.toString()?.split(": ")[1]);
      toast.error("Failed to update book: " + err.message);
    }
  };
  console.log(errors, getValues());

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this author?")) return;
    try {
      await api.delete(`/authorRoutes/${id}`);
      setAuthors((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = async (data) => {
    try {
      await api.post("/authorRoutes", data);
      toast.success("Author created successfully!");
      setShowCreateModal(false);
      reset(); // clear form
      fetchAuthors(page, limit, sort, order); // refresh list
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create author");
    }
  };

  if (loading) return <p>Loading authors...</p>;

  if (!permissions.includes("read_author")) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          You do not have permission to view authors.
        </div>
        <Button onClick={() => navigate("/main")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark m-0">
              <span style={{ color: "#667eea" }}>📚</span> Author Management
            </h2>
            <p className="text-muted mb-0">
              View, search, and manage your library's authors
            </p>
          </div>
          <div className="d-flex gap-2">
            {permissions.includes("create_author") && (
              <Button
                variant="primary"
                onClick={() => {
                  reset({ name: "", email: "" });
                  setShowCreateModal(true);
                }}
                className="shadow-sm px-4 fw-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                ➕ Add Author
              </Button>
            )}
            <Button
              variant="outline-secondary"
              className="shadow-sm px-4 fw-bold"
              style={{ borderRadius: "8px" }}
              onClick={() => navigate("/main")}
            >
              🏠 Home
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card
          className="border-0 shadow-sm mb-4"
          style={{ borderRadius: "12px" }}
        >
          <Card.Body className="p-3">
            <div className="row g-3">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    🔍
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setSearch(searchInput);
                        setPage(1);
                      }
                    }}
                    style={{ borderRadius: "0 8px 8px 0", boxShadow: "none" }}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  style={{ borderRadius: "8px", boxShadow: "none" }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="createdAt">Sort by: Date</option>
                  <option value="name">Sort by: Name</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  style={{ borderRadius: "8px", boxShadow: "none" }}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                >
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>
              </div>
              <div className="col-md-2">
                <Button
                  variant="dark"
                  className="w-100 fw-bold"
                  style={{ borderRadius: "8px" }}
                  onClick={() => {
                    setSearch(searchInput);
                    setPage(1);
                  }}
                >
                  Search
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Table Card */}
        <Card
          className="border-0 shadow-sm"
          style={{ borderRadius: "12px", overflow: "hidden" }}
        >
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted">
                <tr>
                  <th
                    className="ps-4 py-3"
                    style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Author Info
                  </th>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Contact
                  </th>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Joined Date
                  </th>
                  {canWrite && (
                    <th
                      className="pe-4 text-end py-3"
                      style={{
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {authors.length > 0 ? (
                  authors.map((a) => (
                    <tr key={a.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                            style={{
                              width: "40px",
                              height: "40px",
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              fontSize: "14px",
                              marginRight: "12px",
                            }}
                          >
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{a.name}</div>
                            <small className="text-muted">ID: #{a.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-dark">{a.email}</div>
                      </td>
                      <td>
                        <span
                          className="badge bg-light text-dark border p-2 fw-normal"
                          style={{ borderRadius: "6px" }}
                        >
                          📅 {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      {canWrite && (
                        <td className="pe-4 text-end">
                          <Button
                            variant="light"
                            size="sm"
                            className="me-2 text-primary shadow-sm"
                            style={{
                              borderRadius: "6px",
                              backgroundColor: "#f0f7ff",
                            }}
                            onClick={() => setSelectedAuthor(a)}
                            title="Edit"
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="text-danger shadow-sm"
                            style={{
                              borderRadius: "6px",
                              backgroundColor: "#fff5f5",
                            }}
                            onClick={() => handleDelete(a.id)}
                            title="Delete"
                          >
                            🗑️
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canWrite ? 4 : 3} className="text-center py-5">
                      <div className="text-muted">
                        <div style={{ fontSize: "2rem" }}>🔦</div>
                        <p className="mt-2 mb-0">
                          No authors found matching your criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="p-4 bg-light border-top d-flex justify-content-between align-items-center">
            <small className="text-muted fw-bold">
              Showing page {meta.page} of {meta.totalPages || 1}
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0 gap-1">
                <li
                  className={`page-item ${!meta?.prevPage ? "disabled" : ""}`}
                >
                  <Button
                    variant="white"
                    className="border shadow-sm px-3"
                    onClick={() => setPage(meta?.prevPage)}
                    disabled={!meta?.prevPage}
                    style={{ borderRadius: "6px" }}
                  >
                    Previous
                  </Button>
                </li>
                <li
                  className={`page-item ${!meta?.nextPage ? "disabled" : ""}`}
                >
                  <Button
                    variant="white"
                    className="border shadow-sm px-3 ms-2"
                    onClick={() => setPage(meta?.nextPage)}
                    disabled={!meta?.nextPage}
                    style={{ borderRadius: "6px" }}
                  >
                    Next
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </Card>
      </div>

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
      {/* Create Modal */}
      <CustomModal
        show={showCreateModal}
        modalId="createAuthorModal"
        title="Create New Author"
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
        onClose={() => setShowCreateModal(false)}
        onCancel={() => setShowCreateModal(false)}
        onSubmit={handleSubmit(handleCreate)}
        submitText="Create Author"
        cancelText="Close"
      />
    </div>
  );
}

export default AuthorsTable;
