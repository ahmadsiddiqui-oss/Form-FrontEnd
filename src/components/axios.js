import axios from "axios";

// Create instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // replace with your backend URL
});

// Request interceptor (attach token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // or wherever you store JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // handle , maybe logout user
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
