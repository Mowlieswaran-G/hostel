import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import { useData } from "../../context/DataContext";
import { assignTechnician, completeMaintenance } from "../../services/maintenance";
import toast from "react-hot-toast";
import {
  RiToolsLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiMapPinLine,
  RiArrowRightLine,
} from "react-icons/ri";

const TECH_NAME = "Rajan (Technician)";
const priorityColor = { low: "#4ade80", medium: "#fbbf24", high: "#ef4444" };

export default function TechnicianDashboard() {
  const { maintenanceRequests: tasks, ready, refreshCollection } = useData();
  const [filter, setFilter] = useState("all");

  const handleMarkInProgress = async (id) => {
    try {
      await assignTechnician({
        id,
        assignedTo: TECH_NAME,
        status: "inProgress",
      });
      toast.success("Marked as in progress");
      await refreshCollection("maintenanceRequests");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleResolve = async (id) => {
    try {
      await completeMaintenance({
        id,
        status: "resolved",
      });
      toast.success("Task resolved!");
      await refreshCollection("maintenanceRequests");
    } catch {
      toast.error("Update failed");
    }
  };

  const myTasks = tasks.filter(
    (t) => t.assignedTo === TECH_NAME || t.status === "pending",
  );
  const displayed =
    filter === "all" ? myTasks : myTasks.filter((t) => t.status === filter);

  const stats = [
    {
      label: "Pending",
      value: tasks.filter((t) => t.status === "pending").length,
      color: "#ef4444",
      icon: RiTimeLine,
    },
    {
      label: "In Progress",
      value: tasks.filter((t) => t.status === "inProgress").length,
      color: "#fbbf24",
      icon: RiToolsLine,
    },
    {
      label: "Resolved",
      value: tasks.filter((t) => t.status === "resolved").length,
      color: "#4ade80",
      icon: RiCheckboxCircleLine,
    },
    {
      label: "Total",
      value: tasks.length,
      color: "#a590ff",
      icon: RiToolsLine,
    },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Manage your assigned maintenance tasks" />
        {!ready ? (
          <Skeleton type="stat" count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((s) => (
              <div
                key={s.label}
                className="glass rounded-2xl p-6 flex items-center gap-4.5 shadow-sm"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: s.color + "20" }}
                >
                  <s.icon size={22} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-3xl font-black text-[color:var(--text-primary)] mb-1">
                    {s.value}
                  </p>
                  <p className="text-xs text-[color:var(--text-muted)] font-semibold uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link
          to="/technician/heatmap"
          className="glass rounded-2xl p-6 mb-10 group hover:border-purple-500/30 transition-all flex items-center gap-5"
          style={{
            border: "1.5px solid var(--glass-border)",
            textDecoration: "none",
          }}
        >
          <div
            className="w-13 h-13 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: "rgba(105,71,255,0.15)" }}
          >
            <RiMapPinLine size={24} style={{ color: "#a590ff" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-[color:var(--text-primary)]">
              Room Complaint Heatmap
            </p>
            <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">
              View which rooms have the most issues by floor
            </p>
          </div>
          <RiArrowRightLine
            size={20}
            className="text-[color:var(--text-muted)] group-hover:text-[color:var(--text-primary)] group-hover:translate-x-1.5 transition-transform shrink-0"
          />
        </Link>
        <div className="flex items-center gap-2 mb-5">
          {["all", "pending", "inProgress", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background:
                  filter === f ? "rgba(105,71,255,0.25)" : "var(--glass-bg)",
                color: filter === f ? "#a590ff" : "var(--text-muted)",
                border: `1px solid ${filter === f ? "rgba(105,71,255,0.4)" : "var(--border-subtle)"}`,
              }}
            >
              {f === "all"
                ? "All Tasks"
                : f === "inProgress"
                  ? "In Progress"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {!ready ? (
          <Skeleton rows={6} />
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            {displayed.length === 0 ? (
              <div className="empty-state">
                <RiCheckboxCircleLine
                  size={32}
                  className="text-[color:var(--text-muted)]"
                />
                <p className="text-sm">No tasks in this category.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Room</th>
                      <th>Floor</th>
                      <th>Category</th>
                      <th>Issue</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((task) => (
                      <tr key={task.id}>
                        <td className="text-xs text-[color:var(--text-muted)]">
                          {task.createdAt?.toDate?.()?.toLocaleDateString() ||
                            "N/A"}
                        </td>
                        <td className="font-bold text-[color:var(--text-primary)]">
                          {task.roomNumber}
                        </td>
                        <td className="text-[color:var(--text-secondary)]">
                          Floor {task.floor}
                        </td>
                        <td className="text-[color:var(--text-secondary)]">
                          {task.category}
                        </td>
                        <td className="text-sm text-[color:var(--text-muted)] max-w-xs truncate">
                          {task.issue}
                        </td>
                        <td>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1 shadow-xs"
                            style={{
                              background:
                                (priorityColor[task.priority] || "#888") + "18",
                              color: priorityColor[task.priority] || "#888",
                              borderColor:
                                (priorityColor[task.priority] || "#888") + "45",
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{
                                background:
                                  priorityColor[task.priority] || "#888",
                              }}
                            />
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={task.status} />
                        </td>
                        <td>
                          {task.status === "pending" && (
                            <button
                              onClick={() => handleMarkInProgress(task.id)}
                              className="px-3 py-1 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500/70 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Accept
                            </button>
                          )}
                          {task.status === "inProgress" && (
                            <button
                              onClick={() => handleResolve(task.id)}
                              className="px-3 py-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-500/70 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
