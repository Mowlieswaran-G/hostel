import { useState } from "react";
import Navbar from "../../components/Navbar";
import Skeleton from "../../components/Skeleton";
import DashboardGreeting from "../../components/DashboardGreeting";
import { useData } from "../../context/DataContext";
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
  const { rooms, maintenanceRequests: complaints, ready } = useData();
  const loading = !ready;
  const [selectedFloor, setSelectedFloor] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState(null);

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

        {/* Unified Control & Filter Bar */}
        <div className="glass rounded-2xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[color:var(--glass-border)] shadow-sm">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
              Status:
            </span>
            {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
              <span
                key={key}
                className="flex items-center gap-2 text-xs font-medium text-[color:var(--text-secondary)]"
              >
                <span
                  className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs"
                  style={{
                    background: cfg.color,
                    border: `1.5px solid ${cfg.border}`,
                  }}
                />
                {cfg.label}
              </span>
            ))}
          </div>

          {/* Floor Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] mr-1">
              Floor:
            </span>
            <button
              onClick={() => setSelectedFloor("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFloor === "all"
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "bg-[color:var(--segment-bg)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              }`}
            >
              All Floors
            </button>
            {floors.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(String(f))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFloor === String(f)
                    ? "bg-indigo-600 text-white shadow-sm font-bold"
                    : "bg-[color:var(--segment-bg)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
                }`}
              >
                Floor {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Heatmap Grid — explicit vertical gap */}
          <div className="flex-1 flex flex-col gap-8">
            {loading ? (
              <Skeleton rows={8} />
            ) : (
              floors
                .filter(
                  (f) => selectedFloor === "all" || String(f) === selectedFloor,
                )
                .map((f) => (
                  <div
                    key={f}
                    className="glass rounded-2xl overflow-hidden border border-[color:var(--glass-border)] shadow-sm"
                  >
                    {/* Dedicated Card Header Bar */}
                    <div className="px-6 py-4 bg-[color:var(--bg-surface-2)] border-b border-[color:var(--border-subtle)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                          <RiBuilding2Line size={18} />
                        </div>
                        <h2 className="font-bold text-base text-[color:var(--text-primary)]">
                          Floor {f} — Block {f === 1 ? "A" : f === 2 ? "B" : "C"}
                        </h2>
                      </div>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-[color:var(--bg-surface-3)] text-[color:var(--text-secondary)]">
                        {byFloor[f]?.filter((r) => r.complaintCount > 0).length}{" "}
                        rooms with issues
                      </span>
                    </div>

                    {/* Dedicated Card Body Grid */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {(byFloor[f] || []).map((room) => (
                          <button
                            key={room.id}
                            onClick={() =>
                              setSelectedRoom(
                                selectedRoom?.id === room.id ? null : room,
                              )
                            }
                            className="rounded-xl p-4 text-center transition-all hover:scale-[1.02] cursor-pointer flex flex-col items-center justify-center"
                            style={{
                              background: SEVERITY_CONFIG[room.severity].color,
                              border: `1.5px solid ${
                                selectedRoom?.id === room.id
                                  ? "#a590ff"
                                  : SEVERITY_CONFIG[room.severity].border
                              }`,
                              boxShadow:
                                selectedRoom?.id === room.id
                                  ? "0 0 0 3px rgba(165,144,255,0.4)"
                                  : "none",
                            }}
                          >
                            <p
                              className="text-base font-black tracking-wide"
                              style={{ color: SEVERITY_TEXT[room.severity] }}
                            >
                              {room.roomNumber}
                            </p>
                            <p
                              className="text-xs font-semibold mt-1"
                              style={{
                                color: SEVERITY_TEXT[room.severity],
                                opacity: 0.9,
                              }}
                            >
                              {room.complaintCount} issue
                              {room.complaintCount !== 1 ? "s" : ""}
                            </p>
                            <p className="text-[11px] text-[color:var(--text-muted)] font-medium mt-1">
                              {room.occupiedBeds}/{room.capacity} beds
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Detail Panel */}
          {selectedRoom && (
            <div className="w-80 shrink-0">
              <div className="glass rounded-2xl overflow-hidden border border-[color:var(--glass-border)] sticky top-6 shadow-sm">
                <div className="px-5 py-4 bg-[color:var(--bg-surface-2)] border-b border-[color:var(--border-subtle)] flex items-center justify-between">
                  <h3 className="font-bold text-base text-[color:var(--text-primary)]">
                    Room {selectedRoom.roomNumber}
                  </h3>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-surface-3)] transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5">
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
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
