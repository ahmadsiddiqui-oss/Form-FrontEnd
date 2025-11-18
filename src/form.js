import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SimpleForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    classId: "",
  });

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classError, setClassError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveRecord = async () => {
    const payload = {
      name: formData.name,
      email: formData.email,
      classId: formData.classId,
    };
    // NOTE: confirm backend users endpoint/port (your server in repo runs on 5000)
    const response = await axios.post(
      "http://localhost:5000/api/users/",
      payload
    );
    console.log("Record saved:", response.data);
  };

  // const searchData = async (searchKey) => {
  //   const response = await axios.get(
  //     `http://localhost:5000/api/users?searchKey=${searchKey}`
  //   );
  //   console.log("Search Data", response.data);
  // };

  useEffect(() => {
    setLoadingClasses(false);
    setClassError("");
    axios
      .get("http://localhost:5000/api/classes")
      .then((res) => {
        const message = res?.data?.message;
        const raw = Array.isArray(res?.data?.data) ? res.data.data : [];
        const list = raw.map((c) => ({
          id: c.id ?? c._id ?? c.value ?? c.classId,
          className: c.name ?? c.class ?? `Class ${c.id ?? c._id}`,
        }));
        if (!list.length) setClassError(message || "No classes found");
        setClasses(list);
      })
      .catch((err) => {
        console.error(err);
        setClassError(err.response?.data?.message || "Failed to load classes");
        setClasses([]);
      })
      .finally(() => setLoadingClasses(false));
  }, []);

  const handleSubmit = (e) => {
    console.log("I am handleSubmit");
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.classId) {
      alert("Please fill in all fields, including class");
      return;
    }
    handleSaveRecord();
    console.log("handleSubmit>>>>>>>>>>>>", handleSubmit);
  };

  return (
    <div>
      <div style={{ maxWidth: "400px", margin: "50px auto" }}>
        <h2>Simple React Form</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
              placeholder="Enter your name"
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Class:</label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              style={{ width: "420px", padding: "8px" }}
            >
              <option value="">Select Class</option>
              {(Array.isArray(classes) ? classes : []).map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "10px 25px",
                backgroundColor: "skyblue",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Submit
            </button>
            <button
              onClick={() => navigate("/update")}
              style={{
                padding: "10px 25px",
                backgroundColor: "skyblue",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              UPDATE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SimpleForm;
