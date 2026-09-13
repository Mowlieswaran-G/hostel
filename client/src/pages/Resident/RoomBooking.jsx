import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { createBooking, getBookingStatus } from "../../services/booking";
import toast from "react-hot-toast";
import { RiBuilding2Line, RiGroupLine, RiSearchLine } from "react-icons/ri";

export default function RoomBooking() {
  const { rooms, ready, refreshCollection } = useData();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // ONLY show rooms that the warden has released as available with vacant beds
  const availableRooms = rooms.filter((r) => {
    const vacant = (r.capacity || 4) - (r.occupiedBeds || 0);
    return r.status === "available" && vacant > 0;
  });

  const filtered = availableRooms.filter(
    (r) =>
      r.roomNumber?.toString().includes(search) ||
      r.floor?.toString().includes(search) ||
      r.block?.toLowerCase().includes(search.toLowerCase()),
  );

  const getOccupancyColor = (room) => {
    const vacant = (room.capacity || 4) - (room.occupiedBeds || 0);
    if (vacant === room.capacity) return "#10b981"; // 100% free
    return "#f59e0b"; // Partial free
  };

  const handleCreateGroup = async () => {
    const validMembers = members.filter(Boolean);
    if (!selected) {
      toast.error("Select a room first");
      return;
    }
    setSubmitting(true);
    try {
      await createBooking({
        roomId: selected.id,
        roomNumber: selected.roomNumber,
        memberRollNumbers: validMembers,
        leaderId: user.uid,
        leaderRoll: profile?.rollNumber,
      });
      toast.success("Booking request submitted! Awaiting warden approval.");
      await refreshCollection("bookingGroups");
      navigate("/resident/my-bookings");
    } catch {
      toast.error("Failed to create booking");
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Browse rooms released and made available by the warden for booking" />
        <div className="relative mb-6 max-w-md flex items-center">
          <RiSearchLine
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none z-10"
            size={19}
          />
          <input
            className="input-field input-with-icon"
            style={{ paddingLeft: "2.85rem" }}
            placeholder="Search by room or floor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-5 mb-5 text-xs text-[color:var(--text-secondary)] font-medium">
          {[
            ["#4ade80", "Available"],
            ["#fbbf24", "Half Full"],
            ["#ef4444", "Full"],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-xs"
                style={{ background: c }}
              />
              {l}
            </span>
          ))}
        </div>
        {!ready ? (
          <Skeleton rows={8} />
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Floor</th>
                  <th>Block</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Occupied</th>
                  <th>Vacant</th>
                  <th>Rent/Month</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-[color:var(--text-secondary)] font-medium">
                      No rooms currently released or available for booking. Only rooms updated and freed by the Warden will appear here.
                    </td>
                  </tr>
                ) : (
                  filtered.map((room) => {
                  const vacant = room.capacity - room.occupiedBeds;
                  const isFull = vacant <= 0;
                  return (
                    <tr key={room.id}>
                      <td className="font-bold text-[color:var(--text-primary)]">
                        {room.roomNumber}
                      </td>
                      <td className="text-[color:var(--text-secondary)]">
                        Floor {room.floor}
                      </td>
                      <td className="text-[color:var(--text-secondary)]">
                        Block {room.block}
                      </td>
                      <td className="text-[color:var(--text-secondary)]">
                        {room.type}
                      </td>
                      <td className="text-[color:var(--text-secondary)]">
                        {room.capacity}
                      </td>
                      <td className="text-[color:var(--text-secondary)]">
                        {room.occupiedBeds}
                      </td>
                      <td>
                        <span
                          className="font-bold"
                          style={{ color: getOccupancyColor(room) }}
                        >
                          {vacant}
                        </span>
                      </td>
                      <td className="text-[color:var(--text-secondary)]">
                        ₹{room.monthlyRent?.toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                            isFull
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-xs"
                              : vacant === room.capacity
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-xs"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-xs"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isFull
                                ? "bg-rose-400"
                                : vacant === room.capacity
                                  ? "bg-emerald-400"
                                  : "bg-amber-400"
                            }`}
                          />
                          {isFull
                            ? "Full"
                            : vacant === room.capacity
                              ? "Available"
                              : "Partial"}
                        </span>
                      </td>
                      <td>
                        {!isFull && (
                          <button
                            onClick={() => {
                              setSelected(room);
                              setShowModal(true);
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-white transition-all cursor-pointer hover:opacity-90 active:scale-95 shadow-sm border border-purple-400/40 hover:border-purple-300/70"
                            style={{
                              background:
                                "linear-gradient(135deg,#6947ff,#eb69ff)",
                            }}
                          >
                            Book
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        )}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Book Room ${selected?.roomNumber}`}
        >
          <p className="text-sm text-[color:var(--text-secondary)] mb-4">
            Add your group members' roll numbers (optional).
          </p>
          <div className="space-y-2 mb-4">
            {members.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder={`Member ${i + 1} Roll No.`}
                  value={m}
                  onChange={(e) => {
                    const arr = [...members];
                    arr[i] = e.target.value;
                    setMembers(arr);
                  }}
                />
                {members.length > 1 && (
                  <button
                    onClick={() =>
                      setMembers(members.filter((_, j) => j !== i))
                    }
                    className="px-2 text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {members.length < selected?.capacity - 1 && (
            <button
              onClick={() => setMembers([...members, ""])}
              className="text-xs text-purple-400 hover:text-purple-300 mb-4 block"
            >
              + Add Member
            </button>
          )}
          <button
            onClick={handleCreateGroup}
            disabled={submitting}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6947ff,#eb69ff)" }}
          >
            {submitting ? "Submitting..." : "Submit Booking Request"}
          </button>
        </Modal>
      </main>
    </div>
  );
}
