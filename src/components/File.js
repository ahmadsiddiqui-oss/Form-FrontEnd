import React, { useState } from "react";
import api from "./axios";

function AuthorForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    // other fields...
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // single file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object
    const data = new FormData();
    data.append("myFile", file); // must match multer field name
    data.append("name", formData.name);
    data.append("email", formData.email);
    console.log(data, file, formData.name, formData.email);
    // append other fields as needed

    try {
      const res = await api.post("/fileRoutes/upload", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(res.data);
      alert("Author added and file uploaded successfully!");
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      alert("Error uploading file");
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "20px auto" }}>
      <form onSubmit={handleSubmit} style={{ ...styles.form }}>
        <div>
          {" "}
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Author Name"
            style={{
              ...styles.input,
              borderRadius: "5px",
              border: "none",
              width: "100%",
            }}
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            style={{
              ...styles.input,
              borderRadius: "5px",
              border: "none",
              width: "100%",
            }}
            required
          />
        </div>
        <input type="file" name="myFile" onChange={handleFileChange} required />
        <button
          type="submit"
          style={{
            backgroundColor: "turquoise",
            borderRadius: "5px",
            border: "none",
            color: "white",
            padding: "10px 0px",
            fontWeight: "bolder",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f4f4",
  },
  form: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    border: "none",
    background: "#007bff",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
export default AuthorForm;
