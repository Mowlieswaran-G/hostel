import { useState } from "react";
import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import { useData } from "../../context/DataContext";
import { approveOuting } from "../../services/outing";
import toast from "react-hot-toast";
import { RiMapPinLine } from "react-icons/ri";

export default function OutingApproval() {
  const { outingRequests: requests, ready, refreshCollection } = useData();

  const handleApprove = async (id) => {
    try {
      await approveOuting({ id, status: "approved" });
      toast.success("Outing approved!");
      await refreshCollection("outingRequests");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await approveOuting({ id, status: "rejected" });
      toast.success("Outing rejected");
      await refreshCollection("outingRequests");
    } catch {
      toast.error("Failed to reject");
    }
  };

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Review and approve resident outing requests" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            ["Pending", stats.pending, "#fbbf24"],
            ["Approved", stats.approved, "#4ade80"],
            ["Rejected", stats.rejected, "#ef4444"],
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
            All Outing Requests
          </h2>
        </div>
        {!ready ? (
          <Skeleton rows={6} />
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            {requests.length === 0 ? (
              <div className="empty-state">
                <RiMapPinLine
                  size={32}
                  className="text-[color:var(--text-muted)]"
                />
                <p className="text-sm">No outing requests yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Resident</th>
                      <th>Roll No.</th>
                      <th>Room</th>
                      <th>Destination</th>
                      <th>Out</th>
                      <th>Return</th>
                      <th>Reason</th>
                      <th>Status</th>
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
                        <td className="text-[color:var(--text-secondary)]">
                          {r.rollNumber}
                        </td>
                        <td className="font-bold">{r.roomNumber}</td>
                        <td className="text-[color:var(--text-secondary)]">
                          {r.destination}
                        </td>
                        <td className="text-xs text-[color:var(--text-muted)]">
                          {r.outDate}
                        </td>
                        <td className="text-xs text-[color:var(--text-muted)]">
                          {r.returnDate}
                        </td>
                        <td className="text-xs text-[color:var(--text-muted)] max-w-xs truncate">
                          {r.reason}
                        </td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td>
                          {r.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(r.id)}
                                className="px-3 py-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-500/70 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(r.id)}
                                className="px-3 py-1 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/40 hover:border-rose-500/70 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                Reject
                              </button>
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
