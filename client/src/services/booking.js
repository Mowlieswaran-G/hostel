import api from "./api";

export const createBooking = async (data) => {
  // data: { roomId, roomNumber, memberRollNumbers, leaderId, leaderRoll }
  const res = await api.post("/bookings", data);
  return res.data;
};

export const approveBooking = async ({ id, roomId, memberCount }) => {
  const res = await api.put("/bookings/approve", { id, roomId, memberCount });
  return res.data;
};

export const rejectBooking = async (id, reason = "") => {
  const res = await api.put(`/bookings/${id}/reject`, { reason });
  return res.data;
};

export const getAllBookings = async () => {
  const res = await api.get("/bookings");
  return res.data;
};

export const getBookingStatus = async (uid) => {
  const res = await api.get(`/bookings/status/${uid}`);
  return res.data;
};
