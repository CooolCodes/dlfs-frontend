import api from "./axios";

// Submit a claim on a found item
export const submitClaim = (itemId, data) =>
  api.post(`/claims/${itemId}`, data);

// Get the logged-in user's own claims
export const getMyClaims = () => api.get("/claims/my");

// Get a single claim by ID
export const getClaimById = (id) => api.get(`/claims/${id}`);

// Confirm you collected your item
export const confirmCollection = (id) => api.patch(`/claims/${id}/confirm`);
