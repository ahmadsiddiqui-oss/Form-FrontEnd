import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UsersTable() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    classId: "",
  });

  const apiUrl = "http://localhost:5000/api/users";

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(apiUrl);
      console.log("RESPONSEEEE>>>>", response);
      const fetchedUsers = Array.isArray(response.data.data)
        ? response.data?.data
        : [];
      console.log("FETHCHUSERSSS>>>>", fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  console.error("USERS>>>>>>>:", users);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, classId: user.classId });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${apiUrl}/${id}`, formData);
      setEditingUser(null);
      setFormData({ name: "", email: "", classId: "" });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div
      style={{
        justifyContent: "center",
      }}
    >
        <h2>Users Table....!
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 25px",
            backgroundColor: "red",
            marginLeft: "400px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login Form...!
        </button>
        </h2>
       
      {/* Edit Form */}
      {editingUser && (
        <div
        style={{
          marginBottom: "50px",
        }}>
          <h3>Edit User</h3>
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            style={{
              padding: "8px",
            }}
          />
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={{
              padding: "8px",
            }}
          />
          <input
            name="classId"
            placeholder="ClassId"
            value={formData.classId}
            onChange={handleChange}
            style={{
              padding: "8px",
            }}
          />
          <button
            onClick={() => handleUpdate(editingUser.id)}
            style={{
              padding: "10px 25px",
              backgroundColor: "red",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Update
          </button>
        </div>
      )}

      {/* Users Table */}
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th
              style={{
                padding: "8px",
                backgroundColor: "silver",
              }}
            >
              ID
            </th>
            <th
              style={{
                padding: "8px",
                backgroundColor: "silver",
              }}
            >
              Name
            </th>
            <th
              style={{
                padding: "8px",
                backgroundColor: "silver",
              }}
            >
              Email
            </th>
            <th
              style={{
                padding: "8px",
                backgroundColor: "silver",
              }}
            >
              Class-Id
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) &&
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.classId}</td>

                <td>
                  <button
                    onClick={() => handleEdit(user)}
                    style={{
                      padding: "10px 25px",
                      backgroundColor: "gold",
                      marginRight: "10px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{
                      padding: "10px 25px",
                      backgroundColor: "gold",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
