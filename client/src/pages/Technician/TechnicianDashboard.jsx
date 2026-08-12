import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import { useData } from "../../context/DataContext";
import { db } from "../../firebase/config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
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
      await updateDoc(doc(db, "maintenanceRequests", id), {
        assignedTo: TECH_NAME,
        status: "inProgress",
        updatedAt: serverTimestamp(),
      });
      toast.success("Marked as in progress");
      await refreshCollection("maintenanceRequests");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleResolve = async (id) => {
    try {
      await updateDoc(doc(db, "maintenanceRequests", id), {
        status: "resolved",
        resolvedAt: serverTimestamp(),
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
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div
                key={s.label}
                className="glass rounded-2xl p-5 flex items-center gap-4"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: s.color + "20" }}
                >
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-black text-[color:var(--text-primary)]">
                    {s.value}
                  </p>
                  <p className="text-xs text-[color:var(--text-muted)] font-medium">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link
          to="/technician/heatmap"
          className="glass rounded-2xl p-5 mb-8 group hover:border-purple-500/30 transition-all"
          style={{
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            textDecoration: "none",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(105,71,255,0.15)" }}
          >
            <RiMapPinLine size={22} style={{ color: "#a590ff" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[color:var(--text-primary)]">
              Room Complaint Heatmap
            </p>
            <p className="text-xs text-[color:var(--text-secondary)]">
              View which rooms have the most issues by floor
            </p>
          </div>
          <RiArrowRightLine
            size={18}
            className="text-[color:var(--text-muted)] group-hover:translate-x-1 transition-transform"
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
                            className="px-2 py-0.5 rounded-md text-xs font-semibold"
                            style={{
                              background:
                                (priorityColor[task.priority] || "#888") + "20",
                              color: priorityColor[task.priority] || "#888",
                            }}
                          >
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
                              className="px-3 py-1 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Accept
                            </button>
                          )}
                          {task.status === "inProgress" && (
                            <button
                              onClick={() => handleResolve(task.id)}
                              className="px-3 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors"
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
