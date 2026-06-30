import axios from "axios";

const api = axios.create({
  baseURL: "https://dlfs-backend.onrender.com/api",
});

// Automatically attach the token to every request if one exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
