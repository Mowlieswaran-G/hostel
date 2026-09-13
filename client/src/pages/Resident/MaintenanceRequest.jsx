import { useState } from "react";
import Navbar from "../../components/Navbar";
import Skeleton from "../../components/Skeleton";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { submitMaintenance } from "../../services/maintenance";
import toast from "react-hot-toast";
import { RiToolsLine, RiAddLine, RiCloseLine } from "react-icons/ri";

const CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Furniture",
  "Cleaning",
  "Network",
  "AC/Heating",
  "Other",
];
const PRIORITIES = ["low", "medium", "high"];
const priorityColor = { low: "#4ade80", medium: "#fbbf24", high: "#ef4444" };

export default function MaintenanceRequest() {
  const { user, profile } = useAuth();
  const {
    maintenanceRequests: allRequests,
    ready,
    refreshCollection,
  } = useData();

  const myEmail = (user?.email || profile?.email || "").toLowerCase();
  const myUid = user?.uid || profile?.uid || profile?.id;
  const myRoll = (profile?.rollNumber || profile?.roll_number || "").toLowerCase();
  const myName = (profile?.name || user?.displayName || "").toLowerCase();

  const requests = allRequests.filter((r) => {
    if (myEmail && r.residentEmail && r.residentEmail.toLowerCase() === myEmail) return true;
    if (myUid && r.userId && r.userId === myUid) return true;
    if (myRoll && r.rollNumber && r.rollNumber.toLowerCase() === myRoll) return true;
    if (myName && r.residentName && r.residentName.toLowerCase() === myName) return true;
    if (!myRoll && (!r.residentEmail || r.rollNumber === "21CS001" || r.residentName?.toLowerCase().includes("mowlie"))) return true;
    return false;
  });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "Electrical",
    issue: "",
    priority: "medium",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.issue.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    setSubmitting(true);
    try {
      await submitMaintenance({
        ...form,
        userId: user?.uid || profile?.id || profile?.uid || null,
        residentName: profile?.name || user?.displayName || "Resident",
        residentEmail: user?.email || profile?.email || "",
        rollNumber: profile?.rollNumber || profile?.roll_number || (user?.email ? user.email.split("@")[0].toUpperCase() : "21CS001"),
        roomNumber: profile?.roomNumber || profile?.room_number || "101",
        floor: profile?.floor || 1,
      });
      toast.success("Maintenance request submitted!");
      setShowForm(false);
      setForm({ category: "Electrical", issue: "", priority: "medium" });
      // Refresh the global context so the new item appears instantly
      await refreshCollection("maintenanceRequests");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Raise a maintenance request for your room" />

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-[color:var(--text-secondary)] uppercase tracking-widest">
            My Requests
          </h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#6947ff,#eb69ff)" }}
          >
            {showForm ? <RiCloseLine size={16} /> : <RiAddLine size={16} />}
            {showForm ? "Cancel" : "New Request"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
            <h3 className="font-semibold text-[color:var(--text-primary)] mb-4">
              New Maintenance Request
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1">
                    Category
                  </label>
                  <select
                    className="input-field w-full"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1">
                    Priority
                  </label>
                  <select
                    className="input-field w-full"
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priority: e.target.value }))
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1">
                  Describe the Issue
                </label>
                <textarea
                  className="input-field w-full resize-none"
                  rows={3}
                  placeholder="Describe your maintenance issue in detail..."
                  value={form.issue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, issue: e.target.value }))
                  }
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all cursor-pointer hover:opacity-90 active:scale-95 shadow-sm border border-purple-400/35 hover:border-purple-300/60"
                style={{
                  background: "linear-gradient(135deg,#6947ff,#eb69ff)",
                }}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {/* Requests List */}
        {!ready ? (
          <Skeleton rows={5} />
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            {requests.length === 0 ? (
              <div className="empty-state">
                <RiToolsLine
                  size={32}
                  className="text-[color:var(--text-muted)]"
                />
                <p className="text-sm">
                  No requests yet. Click "New Request" to get started.
                </p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="text-xs text-[color:var(--text-muted)]">
                        {r.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </td>
                      <td className="font-medium text-[color:var(--text-primary)]">
                        {r.category}
                      </td>
                      <td className="text-sm text-[color:var(--text-secondary)] max-w-xs truncate">
                        {r.issue}
                      </td>
                      <td>
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-semibold"
                          style={{
                            background: `${priorityColor[r.priority] || "#888"}20`,
                            color: priorityColor[r.priority] || "#888",
                          }}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
