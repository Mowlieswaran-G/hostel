import { useState } from "react";
import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import Skeleton from "../../components/Skeleton";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import { useData } from "../../context/DataContext";
import { updateRoom, createRoom, freeRoom, deleteRoom } from "../../services/rooms";
import toast from "react-hot-toast";
import {
  RiBuilding2Line,
  RiAddLine,
  RiCheckLine,
  RiEditLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiSearchLine,
  RiHotelBedLine,
  RiShieldCheckLine,
} from "react-icons/ri";

export default function RoomManagement() {
  const { rooms, ready, refreshCollection } = useData();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New room form
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    block: "A Block",
    floor: 1,
    capacity: 4,
    type: "Standard",
    gender: "Co-ed",
    pricePerSemester: 25000,
    status: "available",
  });

  // Edit room form
  const [editForm, setEditForm] = useState({
    roomNumber: "",
    block: "A Block",
    floor: 1,
    capacity: 4,
    occupiedBeds: 0,
    type: "Standard",
    status: "available",
  });

  // Filtered rooms
  const filtered = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber?.toString().toLowerCase().includes(search.toLowerCase()) ||
      r.block?.toLowerCase().includes(search.toLowerCase()) ||
      r.floor?.toString().includes(search);

    const vacant = (r.capacity || 4) - (r.occupiedBeds || 0);
    const isFree = r.status === "available" && vacant > 0;

    if (!matchesSearch) return false;
    if (filter === "free") return isFree;
    if (filter === "occupied") return r.status === "occupied" || vacant <= 0;
    if (filter === "maintenance") return r.status === "maintenance";
    return true;
  });

  const stats = {
    total: rooms.length,
    free: rooms.filter((r) => r.status === "available" && (r.capacity - r.occupiedBeds) > 0).length,
    occupied: rooms.filter((r) => r.status === "occupied" || (r.capacity - r.occupiedBeds) <= 0).length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  };

  // One-click Free up room
  const handleFreeRoom = async (room) => {
    try {
      await freeRoom(room.id);
      toast.success(`Room ${room.roomNumber} is now freed & available for booking!`);
      await refreshCollection("rooms");
    } catch {
      toast.error("Failed to update room");
    }
  };

  // Open edit modal
  const handleOpenEdit = (room) => {
    setSelectedRoom(room);
    setEditForm({
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor,
      capacity: room.capacity,
      occupiedBeds: room.occupiedBeds,
      type: room.type || "Standard",
      status: room.status || "available",
    });
    setShowEditModal(true);
  };

  // Submit edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setSubmitting(true);
    try {
      await updateRoom(selectedRoom.id, editForm);
      toast.success(`Room ${editForm.roomNumber} updated successfully!`);
      setShowEditModal(false);
      await refreshCollection("rooms");
    } catch {
      toast.error("Failed to update room");
    } finally {
      setSubmitting(false);
    }
  };

  // Create room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.roomNumber) {
      toast.error("Please enter a room number");
      return;
    }
    setSubmitting(true);
    try {
      await createRoom(newRoom);
      toast.success(`Room ${newRoom.roomNumber} created!`);
      setShowAddModal(false);
      setNewRoom({
        roomNumber: "",
        block: "A Block",
        floor: 1,
        capacity: 4,
        type: "Standard",
        gender: "Co-ed",
        pricePerSemester: 25000,
        status: "available",
      });
      await refreshCollection("rooms");
    } catch {
      toast.error("Failed to create room. Room number may already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete room
  const handleDeleteRoom = async (id, roomNum) => {
    if (!window.confirm(`Are you sure you want to delete Room ${roomNum}?`)) return;
    try {
      await deleteRoom(id);
      toast.success(`Room ${roomNum} deleted`);
      await refreshCollection("rooms");
    } catch {
      toast.error("Failed to delete room");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <div className="flex items-center justify-between mb-2">
          <DashboardGreeting subtitle="Control room inventory, allocate beds, and release free rooms for residents" />
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <RiAddLine size={16} />
            Add New Room
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[color:var(--text-muted)] uppercase tracking-wider font-semibold">
                  Total Rooms
                </p>
                <p className="text-2xl font-black text-[color:var(--text-primary)] mt-1.5">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                <RiBuilding2Line size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[color:var(--text-muted)] uppercase tracking-wider font-semibold">
                  Free for Booking
                </p>
                <p className="text-2xl font-black text-emerald-500 mt-1.5">
                  {stats.free}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                <RiHotelBedLine size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[color:var(--text-muted)] uppercase tracking-wider font-semibold">
                  Full / Occupied
                </p>
                <p className="text-2xl font-black text-amber-500 mt-1.5">
                  {stats.occupied}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                <RiShieldCheckLine size={22} />
              </div>
            </div>
          </div>

          <div className="stat-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[color:var(--text-muted)] uppercase tracking-wider font-semibold">
                  Maintenance
                </p>
                <p className="text-2xl font-black text-rose-500 mt-1.5">
                  {stats.maintenance}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 shadow-sm">
                <RiRefreshLine size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2.5">
            {[
              ["all", `All Rooms (${stats.total})`],
              ["free", `Free for Residents (${stats.free})`],
              ["occupied", `Occupied (${stats.occupied})`],
              ["maintenance", `Maintenance (${stats.maintenance})`],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  filter === k
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border-indigo-400/50"
                    : "bg-[color:var(--segment-bg)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] border-[color:var(--border-subtle)] hover:border-[color:var(--text-muted)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-72 flex items-center">
            <RiSearchLine
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none z-10"
              size={17}
            />
            <input
              className="input-field input-with-icon"
              style={{ paddingLeft: "2.5rem", paddingRight: "1rem" }}
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Rooms Table */}
        {!ready ? (
          <Skeleton rows={6} />
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="empty-state py-12 text-center text-[color:var(--text-muted)]">
                No rooms match the selected filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Beds (Occupied / Cap)</th>
                      <th>Vacant Beds</th>
                      <th>Status</th>
                      <th className="text-right">Warden Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((room) => {
                      const vacant = (room.capacity || 4) - (room.occupiedBeds || 0);
                      const isFree = room.status === "available" && vacant > 0;

                      return (
                        <tr key={room.id}>
                          <td className="font-bold text-[color:var(--text-primary)] text-base">
                            {room.roomNumber}
                          </td>
                          <td className="text-[color:var(--text-secondary)]">
                            {room.block} · Floor {room.floor}
                          </td>
                          <td className="text-[color:var(--text-secondary)]">
                            {room.type}
                          </td>
                          <td>
                            <span className="font-semibold">
                              {room.occupiedBeds} / {room.capacity}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                vacant > 0
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              }`}
                            >
                              {vacant > 0 ? `${vacant} Free Beds` : "Full"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                isFree
                                  ? "badge-approved"
                                  : room.status === "maintenance"
                                    ? "badge-inprogress"
                                    : "badge-rejected"
                              }`}
                            >
                              {isFree
                                ? "Available for Resident"
                                : room.status === "maintenance"
                                  ? "Maintenance"
                                  : "Occupied"}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* One-click release button */}
                              {room.occupiedBeds > 0 && (
                                <button
                                  onClick={() => handleFreeRoom(room)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1"
                                  title="Free up room so residents can book"
                                >
                                  <RiCheckLine size={14} />
                                  Make Free
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEdit(room)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all flex items-center gap-1"
                              >
                                <RiEditLine size={14} />
                                Update
                              </button>

                              <button
                                onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                                title="Delete room"
                              >
                                <RiDeleteBinLine size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Edit Room Modal ─────────────────────────────────────── */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Update Room ${selectedRoom?.roomNumber || ""}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="input-label">Room Number</label>
                <input
                  className="input-field"
                  value={editForm.roomNumber}
                  onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Block</label>
                <select
                  className="select-field"
                  value={editForm.block}
                  onChange={(e) => setEditForm({ ...editForm, block: e.target.value })}
                >
                  <option value="A Block">A Block</option>
                  <option value="B Block">B Block</option>
                  <option value="C Block">C Block</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="form-group">
                <label className="input-label">Floor</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input-field"
                  value={editForm.floor}
                  onChange={(e) => setEditForm({ ...editForm, floor: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Total Beds</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  className="input-field"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Occupied Beds</label>
                <input
                  type="number"
                  min="0"
                  max={editForm.capacity}
                  className="input-field"
                  value={editForm.occupiedBeds}
                  onChange={(e) => setEditForm({ ...editForm, occupiedBeds: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="input-label">Room Type</label>
                <select
                  className="select-field"
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Premium Single/Double">Premium</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Status (Warden Control)</label>
                <select
                  className="select-field"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="available">Available (Free for Booking)</option>
                  <option value="occupied">Occupied / Full</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-[color:var(--text-muted)] bg-[color:var(--bg-surface-2)] p-2.5 rounded-lg border border-[color:var(--border-subtle)]">
              💡 When status is <b>Available</b> and occupied beds are less than total beds, residents will be able to see and book this room.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
                style={{ padding: "0.75rem 1.25rem", fontSize: "0.9rem" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ── Add Room Modal ─────────────────────────────────────── */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Hostel Room"
          size="md"
        >
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="input-label">Room Number</label>
                <input
                  className="input-field"
                  placeholder="e.g. 104"
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Block</label>
                <select
                  className="select-field"
                  value={newRoom.block}
                  onChange={(e) => setNewRoom({ ...newRoom, block: e.target.value })}
                >
                  <option value="A Block">A Block</option>
                  <option value="B Block">B Block</option>
                  <option value="C Block">C Block</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="input-label">Floor</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input-field"
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Total Beds</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  className="input-field"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="input-label">Room Type</label>
                <select
                  className="select-field"
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Premium Single/Double">Premium</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Status</label>
                <select
                  className="select-field"
                  value={newRoom.status}
                  onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
                >
                  <option value="available">Available (Free for Booking)</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
                style={{ padding: "0.75rem 1.25rem", fontSize: "0.9rem" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem" }}
              >
                {submitting ? "Creating..." : "Create Room"}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
