import api from "./api";
export const submitMaintenance = (data) => api.post("/maintenance", data);
export const getMaintenance = () => api.get("/maintenance");
export const getAllMaintenance = () => api.get("/maintenance/all");
export const approveMaintenance = (data) =>
  api.put("/maintenance/approve", data);
export const assignTechnician = (data) => api.put("/maintenance/assign", data);
export const completeMaintenance = (data) =>
  api.put("/maintenance/complete", data);
