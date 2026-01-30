import React, { useEffect, useState } from "react";
import CustomModal from "./modal";
import { Button, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "./axios";
import "bootstrap/dist/css/bootstrap.min.css";

import { getUserPermissions } from "./auth";
import { toast } from "react-toastify";

function BooksTable() {
  const navigate = useNavigate();
  const permissions = getUserPermissions();
  const canWrite = permissions.includes("create_book");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(2);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("DESC");
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 0,
    prevPage: null,
    nextPage: null,
  });

  // Yup validation schema
  const bookUpdateSchema = yup.object().shape({
    title: yup.string().required("Title is required"),
    isbn: yup.string().required("ISBN is required"),
    publishedDate: yup
      .date()
      .nullable()
      .typeError("Published date must be a valid date"),
    authorId: yup
      .number()
      .typeError("Author ID must be a number")
      .required("Author ID is required")
      .positive("Author ID must be positive")
      .integer("Author ID must be an integer"),
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bookUpdateSchema),
    mode: "onChange", // validate as user types
  });

  // Fetch books
  const fetchBooks = React.useCallback(
    async (page = 1, limit = 2, sort = "createdAt", order = "DESC") => {
      setLoading(true);
      try {
        const res = await api.get(
          `/bookRoutes?page=${page}&limit=${limit}&search=${search}&sort=${sort}&order=${order}`
        );
        setBooks(res.data.data || []);
        setMeta(res.data.meta || {});
      } catch (err) {
        console.error(err);
        setBooks([]);
        setMeta({});
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchBooks(page, limit, sort, order);
  }, [page, limit, sort, order, fetchBooks]);

  // Populate form when a book is selected
  useEffect(() => {
    if (selectedBook) {
      reset({
        title: selectedBook.title || "",
        isbn: selectedBook.isbn || "",
        publishedDate: selectedBook.publishedDate || "",
        authorId: selectedBook.authorId || "",
      });
    }
  }, [selectedBook, reset]);

  // Update book handler
  const handleUpdateBook = async (data) => {
    try {
      const res = await api.put(`/bookRoutes/${selectedBook.id}`, data);
      const updatedBook = res.data || { ...selectedBook, ...data };
      setBooks((prevBooks) =>
        prevBooks.map((b) => (b.id === selectedBook.id ? updatedBook : b))
      );
      setSelectedBook(null);
      toast("Book updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update book: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await api.delete(`/bookRoutes/${id}`);
      setBooks(books.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateBook = async (data) => {
    try {
      await api.post("/bookRoutes", data);
      toast.success("Book created successfully!");
      setShowCreateModal(false);
      reset();
      fetchBooks(page, limit, sort, order);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create book");
    }
  };

  if (loading) return <p>Loading books...</p>;

  if (!permissions.includes("read_book")) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          You do not have permission to view books.
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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark m-0">
              <span style={{ color: "#48bb78" }}>📚</span> Book Management
            </h2>
            <p className="text-muted mb-0">
              Browse, search, and edit your library's collection
            </p>
          </div>
          <div className="d-flex gap-2">
            {permissions.includes("create_book") && (
              <Button
                variant="success"
                onClick={() => {
                  reset({
                    title: "",
                    isbn: "",
                    publishedDate: "",
                    authorId: "",
                  });
                  setShowCreateModal(true);
                }}
                className="shadow-sm px-4 fw-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                ➕ Add New Book
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
                    placeholder="Search by title or ISBN..."
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
              <div className="col-md-2">
                <select
                  className="form-select"
                  style={{ borderRadius: "8px", boxShadow: "none" }}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="createdAt">Sort by: Date</option>
                  <option value="title">Sort by: Title</option>
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
              <div className="col-md-3 d-flex gap-2">
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
                    Book Details
                  </th>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    ISBN
                  </th>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Published
                  </th>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Author ID
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
                {books.length > 0 ? (
                  books.map((b) => (
                    <tr key={b.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                            style={{
                              width: "40px",
                              height: "50px",
                              background:
                                "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                              fontSize: "12px",
                              marginRight: "12px",
                              borderRadius: "4px",
                            }}
                          >
                            📖
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{b.title}</div>
                            <small className="text-muted">ID: #{b.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="text-secondary fw-bold">{b.isbn}</code>
                      </td>
                      <td>
                        <span
                          className="badge bg-light text-dark border p-2 fw-normal"
                          style={{ borderRadius: "6px" }}
                        >
                          📅 {b.publishedDate?.toString().split("T")[0]}
                        </span>
                      </td>
                      <td>
                        <Badge bg="info" className="px-3">
                          Author #{b.authorId}
                        </Badge>
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
                            onClick={() => setSelectedBook(b)}
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
                            onClick={() => handleDelete(b.id)}
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
                    <td colSpan={canWrite ? 5 : 4} className="text-center py-5">
                      <div className="text-muted">
                        <div style={{ fontSize: "2rem" }}>🔦</div>
                        <p className="mt-2 mb-0">
                          No books found in the collection
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

      {selectedBook && (
        <CustomModal
          show={true}
          modalId="bookModal"
          title="Edit Book"
          body={
            <form>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input {...register("title")} className="form-control" />
                {errors.title && (
                  <span className="text-danger">{errors.title.message}</span>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">ISBN</label>
                <input {...register("isbn")} className="form-control" />
                {errors.isbn && (
                  <span className="text-danger">{errors.isbn.message}</span>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Published Date</label>
                <input
                  type="date"
                  {...register("publishedDate")}
                  className="form-control"
                />
                {errors.publishedDate && (
                  <span className="text-danger">
                    {errors.publishedDate.message}
                  </span>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Author ID</label>
                <input
                  type="number"
                  {...register("authorId")}
                  className="form-control"
                />
                {errors.authorId && (
                  <span className="text-danger">{errors.authorId.message}</span>
                )}
              </div>
            </form>
          }
          onClose={() => setSelectedBook(null)}
          onCancel={() => setSelectedBook(null)}
          onSubmit={handleSubmit(handleUpdateBook)}
          submitText="Save Changes"
          cancelText="Close"
        />
      )}
      {/* Create Modal */}
      <CustomModal
        show={showCreateModal}
        modalId="createBookModal"
        title="Create New Book"
        body={
          <form>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input {...register("title")} className="form-control" />
              {errors.title && (
                <span className="text-danger">{errors.title.message}</span>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">ISBN</label>
              <input {...register("isbn")} className="form-control" />
              {errors.isbn && (
                <span className="text-danger">{errors.isbn.message}</span>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Published Date</label>
              <input
                type="date"
                {...register("publishedDate")}
                className="form-control"
              />
              {errors.publishedDate && (
                <span className="text-danger">
                  {errors.publishedDate.message}
                </span>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Author ID</label>
              <input
                type="number"
                {...register("authorId")}
                className="form-control"
              />
              {errors.authorId && (
                <span className="text-danger">{errors.authorId.message}</span>
              )}
            </div>
          </form>
        }
        onClose={() => setShowCreateModal(false)}
        onCancel={() => setShowCreateModal(false)}
        onSubmit={handleSubmit(handleCreateBook)}
        submitText="Create Book"
        cancelText="Close"
      />
    </div>
  );
}

export default BooksTable;
