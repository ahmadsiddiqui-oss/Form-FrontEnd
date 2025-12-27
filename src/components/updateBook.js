import React, { useEffect, useState } from "react";
import CustomModal from "./modal";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "./axios";
import "bootstrap/dist/css/bootstrap.min.css";

import { getUserPermissions } from "./auth";

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
        console.log(res.data.data, page, limit, "res.data");
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
  console.log(page, limit, sort, order, "page, limit");

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
      alert("Book updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update book: " + err.message);
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

  if (loading) return <p>Loading books...</p>;

  return (
    <div style={{ maxWidth: "1000px", margin: "20px auto" }}>
      <h2 style={{ display: "flex", justifyContent: "space-between" }}>
        Books....!
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
      <h3>
        <input
          type="text"
          placeholder="Search book..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset page
          }}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt">Created Date</option>
          <option value="name">Name</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="DESC">DESC</option>
          <option value="ASC">ASC</option>
        </select>
        <button
          style={{
            // padding: "10px 25px",
            backgroundColor: "springGreen",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => fetchBooks()}
        >
          Search Author
        </button>
      </h3>
      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", textAlign: "left" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>ISBN</th>
            <th>Published Date</th>
            <th>Author ID</th>
            {canWrite && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.title}</td>
              <td>{b.isbn}</td>
              <td>{b.publishedDate.toString().split("T")[0]}</td>
              <td>{b.authorId}</td>
              {canWrite && (
                <td>
                  <button
                    style={{
                      padding: "6px 25px",
                      backgroundColor: "#f86e48ff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                    onClick={() => setSelectedBook(b)}
                  >
                    Edit
                  </button>{" "}
                  <Button variant="primary" onClick={() => handleDelete(b.id)}>
                    Delete
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${!meta?.prevPage ? "disabled" : ""}`}>
            <Button
              variant="link"
              className="page-link"
              onClick={() => setPage(meta?.prevPage)}
              disabled={!meta?.prevPage}
            >
              Previous
            </Button>
          </li>

          <span style={{ margin: "0 10px", alignSelf: "center" }}>
            Page {meta.page} of {meta.totalPages}
          </span>
          <li className={`page-item ${!meta?.nextPage ? "disabled" : ""}`}>
            <Button
              variant="link"
              className="page-link"
              onClick={() => setPage(meta?.nextPage)}
              disabled={!meta?.nextPage}
            >
              Next
            </Button>
          </li>
        </ul>
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
    </div>
  );
}

export default BooksTable;
