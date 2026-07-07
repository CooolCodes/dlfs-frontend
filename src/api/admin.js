import api from "./axios";

// Get items by status (pending, approved, etc.)
export const getItemsByStatus = (status) =>
  api.get("/admin/items", { params: { status } });

// Approve a report
export const approveItem = (id) => api.patch(`/admin/items/${id}/approve`);

// Reject a report
export const rejectItem = (id, reason) =>
  api.patch(`/admin/items/${id}/reject`, { reason });

// Get claims by status
export const getClaims = (status) =>
  api.get("/admin/claims", { params: { status } });

// Approve a claim
export const approveClaim = (id) => api.patch(`/admin/claims/${id}/approve`);

// Reject a claim
export const rejectClaim = (id, reason) =>
  api.patch(`/admin/claims/${id}/reject`, { reason });

//Revoke an item
export const revokeItem = (id) => api.patch(`/admin/items/${id}/revoke`);

// Get dashboard stats
export const getStats = () => api.get("/admin/stats");
