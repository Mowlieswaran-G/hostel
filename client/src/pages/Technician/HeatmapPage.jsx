import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Skeleton from "../../components/Skeleton";
import DashboardGreeting from "../../components/DashboardGreeting";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { RiBuilding2Line } from "react-icons/ri";

// Aggregate complaints per room from maintenanceRequests
function buildHeatmap(rooms, complaints) {
  return rooms.map((room) => {
    const count = complaints.filter(
      (c) => c.roomNumber === room.roomNumber,
    ).length;
    const severity =
      count === 0
        ? "none"
        : count <= 1
          ? "low"
          : count <= 3
            ? "medium"
            : "high";
    return { ...room, complaintCount: count, severity };
  });
}

const SEVERITY_CONFIG = {
  none: {
    color: "var(--heatmap-none-bg)",
    border: "var(--heatmap-none-br)",
    label: "No Issues",
  },
  low: {
    color: "rgba(74,222,128,0.18)",
    border: "rgba(74,222,128,0.4)",
    label: "Low (1)",
  },
  medium: {
    color: "rgba(251,191,36,0.18)",
    border: "rgba(251,191,36,0.4)",
    label: "Medium (2–3)",
  },
  high: {
    color: "rgba(239,68,68,0.18)",
    border: "rgba(239,68,68,0.4)",
    label: "High (4+)",
  },
};

const SEVERITY_TEXT = {
  none: "var(--text-muted)",
  low: "#4ade80",
  medium: "#fbbf24",
  high: "#ef4444",
};

export default function HeatmapPage() {
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [roomSnap, cmpSnap] = await Promise.all([
          getDocs(collection(db, "rooms")),
          getDocs(collection(db, "maintenanceRequests")),
        ]);
        const roomData = roomSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
        const cmpData = cmpSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRooms(roomData);
        setComplaints(cmpData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const heatmap = buildHeatmap(rooms, complaints);
  const floors = [...new Set(rooms.map((r) => r.floor))].sort();

  const displayed =
    selectedFloor === "all"
      ? heatmap
      : heatmap.filter((r) => r.floor === Number(selectedFloor));

  // Group by floor for visual layout
  const byFloor = floors.reduce((acc, f) => {
    acc[f] = displayed.filter((r) => r.floor === f);
    return acc;
  }, {});

  const roomComplaints = selectedRoom
    ? complaints.filter((c) => c.roomNumber === selectedRoom.roomNumber)
    : [];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Visual heatmap of room complaints and maintenance issues" />

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6">
          {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
            <span
              key={key}
              className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]"
            >
              <span
                className="w-4 h-4 rounded"
                style={{
                  background: cfg.color,
                  border: `1px solid ${cfg.border}`,
                }}
              />
              {cfg.label}
            </span>
          ))}
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setSelectedFloor("all")}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background:
                selectedFloor === "all"
                  ? "rgba(105,71,255,0.25)"
                  : "var(--glass-bg)",
              color: selectedFloor === "all" ? "#a590ff" : "var(--text-muted)",
              border: `1px solid ${selectedFloor === "all" ? "rgba(105,71,255,0.4)" : "var(--border-subtle)"}`,
            }}
          >
            All Floors
          </button>
          {floors.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFloor(String(f))}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background:
                  selectedFloor === String(f)
                    ? "rgba(105,71,255,0.25)"
                    : "var(--glass-bg)",
                color:
                  selectedFloor === String(f) ? "#a590ff" : "var(--text-muted)",
                border: `1px solid ${selectedFloor === String(f) ? "rgba(105,71,255,0.4)" : "var(--border-subtle)"}`,
              }}
            >
              Floor {f}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Heatmap Grid */}
          <div className="flex-1 space-y-6">
            {loading ? (
              <Skeleton rows={8} />
            ) : (
              floors
                .filter(
                  (f) => selectedFloor === "all" || String(f) === selectedFloor,
                )
                .map((f) => (
                  <div key={f} className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <RiBuilding2Line size={16} style={{ color: "#a590ff" }} />
                      <h3 className="font-semibold text-[color:var(--text-primary)]">
                        Floor {f} — Block {f === 1 ? "A" : f === 2 ? "B" : "C"}
                      </h3>
                      <span className="ml-auto text-xs text-[color:var(--text-muted)]">
                        {byFloor[f]?.filter((r) => r.complaintCount > 0).length}{" "}
                        rooms with issues
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {(byFloor[f] || []).map((room) => (
                        <button
                          key={room.id}
                          onClick={() =>
                            setSelectedRoom(
                              selectedRoom?.id === room.id ? null : room,
                            )
                          }
                          className="rounded-xl p-3 text-center transition-all hover:scale-105 cursor-pointer"
                          style={{
                            background: SEVERITY_CONFIG[room.severity].color,
                            border: `1.5px solid ${
                              selectedRoom?.id === room.id
                                ? "#a590ff"
                                : SEVERITY_CONFIG[room.severity].border
                            }`,
                            outline:
                              selectedRoom?.id === room.id
                                ? "2px solid rgba(165,144,255,0.5)"
                                : "none",
                          }}
                        >
                          <p
                            className="text-sm font-bold"
                            style={{ color: SEVERITY_TEXT[room.severity] }}
                          >
                            {room.roomNumber}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{
                              color: SEVERITY_TEXT[room.severity],
                              opacity: 0.8,
                            }}
                          >
                            {room.complaintCount} issue
                            {room.complaintCount !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs mt-0.5 text-[color:var(--text-muted)]">
                            {room.occupiedBeds}/{room.capacity} beds
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Detail Panel */}
          {selectedRoom && (
            <div className="w-80 shrink-0">
              <div className="glass rounded-2xl p-5 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[color:var(--text-primary)]">
                    Room {selectedRoom.roomNumber}
                  </h3>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
                  >
                    ✕
                  </button>
                </div>

                {/* Room Details */}
                <div className="space-y-2 mb-5">
                  {[
                    ["Floor", `Floor ${selectedRoom.floor}`],
                    ["Block", `Block ${selectedRoom.block}`],
                    ["Type", selectedRoom.type],
                    [
                      "Occupancy",
                      `${selectedRoom.occupiedBeds} / ${selectedRoom.capacity} beds`,
                    ],
                    [
                      "Monthly Rent",
                      `₹${selectedRoom.monthlyRent?.toLocaleString()}`,
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-[color:var(--text-muted)]">
                        {k}
                      </span>
                      <span className="font-medium text-[color:var(--text-primary)]">
                        {v}
                      </span>
                    </div>
                  ))}
                  <div className="text-sm">
                    <span className="text-[color:var(--text-muted)]">
                      Amenities
                    </span>
                    <p className="text-xs text-[color:var(--text-secondary)] mt-1">
                      {selectedRoom.amenities?.join(", ") || "—"}
                    </p>
                  </div>
                </div>

                {/* Complaints List */}
                <div>
                  <h4 className="text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-widest mb-2">
                    Complaints ({roomComplaints.length})
                  </h4>
                  {roomComplaints.length === 0 ? (
                    <p className="text-xs text-[color:var(--text-muted)]">
                      No complaints for this room. ✓
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {roomComplaints.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl p-3"
                          style={{
                            background: "var(--glass-bg)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xs font-bold"
                              style={{
                                color: {
                                  low: "#4ade80",
                                  medium: "#fbbf24",
                                  high: "#ef4444",
                                }[c.priority],
                              }}
                            >
                              {c.priority?.toUpperCase()}
                            </span>
                            <span className="text-xs text-[color:var(--text-muted)]">
                              {c.category}
                            </span>
                          </div>
                          <p className="text-xs text-[color:var(--text-secondary)]">
                            {c.issue}
                          </p>
                          <p className="text-xs text-[color:var(--text-muted)] mt-1">
                            Status: {c.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
