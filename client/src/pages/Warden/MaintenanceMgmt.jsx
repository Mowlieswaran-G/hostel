import { useState } from "react";
import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import { useData } from "../../context/DataContext";
import { db } from "../../firebase/config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { RiToolsLine } from "react-icons/ri";

const TECHNICIANS = [
  "Rajan (Technician)",
  "Murugan (Technician)",
  "Selvan (Technician)",
  "Cleaning Staff",
];
const priorityColor = { low: "#4ade80", medium: "#fbbf24", high: "#ef4444" };

export default function MaintenanceMgmt() {
  const { maintenanceRequests: requests, ready, refreshCollection } = useData();
  const [assigningId, setAssigningId] = useState(null);

  const handleAssign = async (id, techName) => {
    setAssigningId(id);
    try {
      await updateDoc(doc(db, "maintenanceRequests", id), {
        assignedTo: techName,
        status: "inProgress",
        updatedAt: serverTimestamp(),
      });
      toast.success("Assigned to " + techName);
      await refreshCollection("maintenanceRequests");
    } catch {
      toast.error("Failed to assign");
    } finally {
      setAssigningId(null);
    }
  };

  const handleResolve = async (id) => {
    try {
      await updateDoc(doc(db, "maintenanceRequests", id), {
        status: "resolved",
        resolvedAt: serverTimestamp(),
      });
      toast.success("Marked as resolved!");
      await refreshCollection("maintenanceRequests");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "inProgress").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Assign technicians and manage maintenance requests" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            ["Pending", stats.pending, "#ef4444"],
            ["In Progress", stats.inProgress, "#fbbf24"],
            ["Resolved", stats.resolved, "#4ade80"],
          ].map(([l, v, c]) => (
            <div key={l} className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-black" style={{ color: c }}>
                {v}
              </p>
              <p className="text-xs text-[color:var(--text-secondary)] mt-1 font-medium">
                {l}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[color:var(--text-secondary)] uppercase tracking-widest">
            All Requests
          </h2>
        </div>
        {!ready ? (
          <Skeleton rows={6} />
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            {requests.length === 0 ? (
              <div className="empty-state">
                <RiToolsLine
                  size={32}
                  className="text-[color:var(--text-muted)]"
                />
                <p className="text-sm">No maintenance requests.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Resident</th>
                      <th>Room</th>
                      <th>Category</th>
                      <th>Issue</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className="text-xs text-[color:var(--text-muted)]">
                          {r.createdAt?.toDate?.()?.toLocaleDateString() ||
                            "N/A"}
                        </td>
                        <td className="font-medium text-[color:var(--text-primary)]">
                          {r.residentName}
                        </td>
                        <td className="font-bold">{r.roomNumber}</td>
                        <td className="text-[color:var(--text-secondary)]">
                          {r.category}
                        </td>
                        <td className="text-sm text-[color:var(--text-secondary)] max-w-xs truncate">
                          {r.issue}
                        </td>
                        <td>
                          <span
                            className="px-2 py-0.5 rounded-md text-xs font-semibold"
                            style={{
                              background:
                                (priorityColor[r.priority] || "#888") + "20",
                              color: priorityColor[r.priority] || "#888",
                            }}
                          >
                            {r.priority}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="text-xs text-[color:var(--text-muted)]">
                          {r.assignedTo || "—"}
                        </td>
                        <td>
                          {r.status !== "resolved" && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <select
                                className="text-xs px-2 py-1 rounded-lg"
                                style={{
                                  background: "var(--input-bg)",
                                  border: "1px solid var(--input-border)",
                                  color: "var(--text-primary)",
                                }}
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value)
                                    handleAssign(r.id, e.target.value);
                                }}
                                disabled={assigningId === r.id}
                              >
                                <option value="" disabled>
                                  Assign...
                                </option>
                                {TECHNICIANS.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                              {r.status === "inProgress" && (
                                <button
                                  onClick={() => handleResolve(r.id)}
                                  className="px-2 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  Resolve
                                </button>
                              )}
                            </div>
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
