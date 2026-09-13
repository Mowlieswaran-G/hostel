import api from "./api";

export const getRooms = () => api.get("/rooms");
export const getRoomById = (id) => api.get(`/rooms/${id}`);
export const createRoom = (data) => api.post("/rooms", data);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);
export const freeRoom = (id) => api.put(`/rooms/${id}/free`);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);
