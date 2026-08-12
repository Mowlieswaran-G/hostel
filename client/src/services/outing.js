import api from "./api";
export const submitOuting = (data) => api.post("/outing", data);
export const getMyOutings = () => api.get("/outing");
export const getAllOutings = () => api.get("/outing/all");
export const approveOuting = (data) => api.put("/outing/approve", data);
