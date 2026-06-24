import api from "./axios";

// Get all approved items with optional filters
export const getItems = (params) => api.get("/items", { params });

// Get a single item by ID
export const getItemById = (id) => api.get(`/items/${id}`);

// Submit a lost or found report (form data because it includes images)
export const createItem = (formData) =>
  api.post("/items", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Get the logged-in user's own reports
export const getMyItems = () => api.get("/items/user/my");
