import api from "./api";
export const getTechnicianTasks = () => api.get("/technician/tasks");
export const updateTechnicianJob = (data) =>
  api.put("/technician/update", data);
