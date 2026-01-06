/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import CustomModal from "./modal";
import Button from "react-bootstrap/Button";
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

  if (loading) return <p>Loading authors...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto" }}>
      <h2 style={{ display: "flex", justifyContent: "space-between" }}>
        Authors....!
        <button
          style={{
            display: "flex",
            padding: "10px 25px",
            backgroundColor: "peachPuff",
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
      <h4>
        <input
          type="text"
          placeholder="Search author..."
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
            backgroundColor: "springGreen",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => fetchAuthors()}
        >
          Search Author
        </button>
      </h4>
      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", textAlign: "left" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            {canWrite && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              {canWrite && (
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
