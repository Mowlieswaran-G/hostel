import { useState } from "react";
import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import Skeleton from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { submitOuting } from "../../services/outing";
import toast from "react-hot-toast";
import { RiMapPinLine, RiAddLine, RiCloseLine } from "react-icons/ri";

export default function OutingRequest() {
  const { user, profile } = useAuth();
  const { outingRequests: allRequests, ready, refreshCollection } = useData();

  const myEmail = (user?.email || profile?.email || "").toLowerCase();
  const myUid = user?.uid || profile?.uid || profile?.id;
  const myRoll = (profile?.rollNumber || profile?.roll_number || "").toLowerCase();
  const myName = (profile?.name || user?.displayName || "").toLowerCase();

  const requests = allRequests.filter((o) => {
    if (myEmail && o.residentEmail && o.residentEmail.toLowerCase() === myEmail) return true;
    if (myUid && o.userId && o.userId === myUid) return true;
    if (myRoll && o.rollNumber && o.rollNumber.toLowerCase() === myRoll) return true;
    if (myName && o.residentName && o.residentName.toLowerCase() === myName) return true;
    if (!myRoll && (!o.residentEmail || o.rollNumber === "21CS001" || o.residentName?.toLowerCase().includes("mowlie"))) return true;
    return false;
  });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    reason: "",
    destination: "",
    outDate: "",
    returnDate: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.reason ||
      !form.destination ||
      !form.outDate ||
      !form.returnDate
    ) {
      toast.error("Please fill all fields");
      return;
    }
    if (form.returnDate < form.outDate) {
      toast.error("Return date cannot be before outing date");
      return;
    }
    setSubmitting(true);
    try {
      await submitOuting({
        ...form,
        userId: user?.uid || profile?.id || profile?.uid || null,
        residentName: profile?.name || user?.displayName || "Resident",
        residentEmail: user?.email || profile?.email || "",
        rollNumber: profile?.rollNumber || profile?.roll_number || (user?.email ? user.email.split("@")[0].toUpperCase() : "21CS001"),
        roomNumber: profile?.roomNumber || profile?.room_number || "101",
      });
      toast.success("Outing request submitted! Awaiting warden approval.");
      setShowForm(false);
      setForm({ reason: "", destination: "", outDate: "", returnDate: "" });
      // Refresh global context so the new request appears instantly
      await refreshCollection("outingRequests");
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
        <DashboardGreeting subtitle="Apply for outing permission from the warden" />

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-[color:var(--text-secondary)] uppercase tracking-widest">
            My Outing Requests
          </h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#6947ff,#eb69ff)" }}
          >
            {showForm ? <RiCloseLine size={16} /> : <RiAddLine size={16} />}
            {showForm ? "Cancel" : "Apply for Outing"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
            <h3 className="font-semibold text-[color:var(--text-primary)] mb-4">
              Outing Request Application
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1">
                    Outing Date
                  </label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={form.outDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, outDate: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={form.returnDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, returnDate: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="e.g. Chennai, Home"
                  value={form.destination}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, destination: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[color:var(--text-secondary)] mb-1">
                  Reason for Outing
                </label>
                <textarea
                  className="input-field w-full resize-none"
                  rows={3}
                  placeholder="Describe the reason for your outing..."
                  value={form.reason}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reason: e.target.value }))
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
                {submitting ? "Submitting..." : "Submit Application"}
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
                <RiMapPinLine
                  size={32}
                  className="text-[color:var(--text-muted)]"
                />
                <p className="text-sm">
                  No outing requests yet. Click "Apply for Outing" to get
                  started.
                </p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applied On</th>
                    <th>Destination</th>
                    <th>Outing Date</th>
                    <th>Return Date</th>
                    <th>Reason</th>
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
                        {r.destination}
                      </td>
                      <td className="text-sm text-[color:var(--text-secondary)]">
                        {r.outDate}
                      </td>
                      <td className="text-sm text-[color:var(--text-secondary)]">
                        {r.returnDate}
                      </td>
                      <td className="text-sm text-[color:var(--text-muted)] max-w-xs truncate">
                        {r.reason}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                        {r.rejectReason && (
                          <p className="text-xs text-red-400 mt-1">
                            {r.rejectReason}
                          </p>
                        )}
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
