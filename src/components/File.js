import React, { useRef, useState } from "react";
import api from "./axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AuthorForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // single file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object
    const data = new FormData();
    data.append("myFile", file);
    data.append("name", formData.name);
    data.append("email", formData.email);
    // append other fields as needed

    try {
      const res = await api.post("/fileRoutes/upload", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // get user from local storage
      const user = JSON.parse(localStorage.getItem("user"));
      user.profileImage = {filename: res.data.profileImage.filename};
      localStorage.setItem("user", JSON.stringify(user));
      setFile(null);
      fileInputRef.current.value = "";
      toast("Author added and file uploaded successfully!");
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      toast.error("Error uploading file");
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "20px auto" }}>
      <form onSubmit={handleSubmit} style={{ ...styles.form }}>
        <div>
          {" "}
          <h2
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontFamily: "ui-sans-serif",
              marginBottom: "20px",
            }}
          >
            Upload File
          </h2>
        </div>
        <input
          type="file"
          name="myFile"
          ref={fileInputRef}
          onChange={handleFileChange}
          required
          style={{
            cursor: "pointer",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "turquoise",
            borderRadius: "5px",
            border: "none",
            marginTop: "20px",
            color: "white",
            padding: "10px 0px",
            fontWeight: "bolder",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
        <button
          type="button"
          style={{
            padding: "10px 25px",
            backgroundColor: "springGreen",
            border: "none",
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