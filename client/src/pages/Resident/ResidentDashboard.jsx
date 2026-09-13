import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Skeleton from "../../components/Skeleton";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import {
  RiBuilding2Line,
  RiToolsLine,
  RiMapPinLine,
  RiNotificationLine,
  RiArrowRightLine,
  RiBellLine,
} from "react-icons/ri";

const QuickAction = ({ to, icon: Icon, label, color }) => (
  <Link
    to={to}
    className="stat-card flex items-center gap-3.5 group cursor-pointer p-4"
    style={{ textDecoration: "none" }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
      style={{ background: `${color}22` }}
    >
      <Icon size={19} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-[color:var(--text-primary)] leading-normal">
        {label}
      </p>
    </div>
    <RiArrowRightLine
      size={16}
      className="text-[color:var(--text-muted)] group-hover:text-[color:var(--text-primary)] group-hover:translate-x-1 transition-all shrink-0 ml-2"
    />
  </Link>
);

export default function ResidentDashboard() {
  const { user, profile } = useAuth();
  const { maintenanceRequests = [], outingRequests = [], bookingGroups = [], ready } = useData();

  const isMyRequest = (r) => {
    const myEmail = (user?.email || profile?.email || "").toLowerCase();
    const myUid = user?.uid || profile?.uid || profile?.id;
    const myRoll = (profile?.rollNumber || profile?.roll_number || "").toLowerCase();
    const myName = (profile?.name || user?.displayName || "").toLowerCase();

    if (myEmail && r.residentEmail && r.residentEmail.toLowerCase() === myEmail) return true;
    if (myUid && r.userId && r.userId === myUid) return true;
    if (myRoll && r.rollNumber && r.rollNumber.toLowerCase() === myRoll) return true;
    if (myName && r.residentName && r.residentName.toLowerCase() === myName) return true;
    // Show sample/demo requests if resident has no specific requests yet
    if (!myRoll && (!r.residentEmail || r.rollNumber === "21CS001" || r.residentName?.toLowerCase().includes("mowlie"))) return true;
    return false;
  };

  const myMaint = maintenanceRequests.filter(isMyRequest);
  const myOuting = outingRequests.filter(isMyRequest);
  const myBooking = bookingGroups.filter(
    (b) =>
      (user?.uid && b.leaderId === user.uid) ||
      (profile?.id && b.leaderId === profile.id) ||
      (profile?.rollNumber && b.memberRollNumbers && b.memberRollNumbers.includes(profile.rollNumber)) ||
      (user?.email && b.leaderEmail === user.email) ||
      (!profile?.rollNumber && b.roomNumber === "101")
  );

  const requests = [
    ...myMaint.map((m) => ({ ...m, type: "Maintenance" })),
    ...myOuting.map((o) => ({ ...o, type: "Outing" })),
    ...myBooking.map((b) => ({ ...b, type: "Booking" })),
  ].slice(0, 6);

  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved" || r.status === "resolved").length,
    total: requests.length,
  };
  const loading = !ready;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting
          subtitle={`Welcome back to SmartHostel${profile?.hostel ? ` · ${profile.hostel}` : ""}`}
        />

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Requests", value: stats.total, color: "#6947ff" },
            { label: "Pending", value: stats.pending, color: "#fbbf24" },
            { label: "Approved", value: stats.approved, color: "#4ade80" },
          ].map((s) => (
            <div key={s.label} className="stat-card text-center py-6 px-4">
              <p
                className="text-3xl font-display font-black mb-2"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p className="text-xs text-[color:var(--text-secondary)] font-semibold uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider mb-4 px-1">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <QuickAction
                to="/resident/room-booking"
                icon={RiBuilding2Line}
                label="Book a Room"
                color="#6947ff"
              />
              <QuickAction
                to="/resident/maintenance"
                icon={RiToolsLine}
                label="Raise Maintenance Request"
                color="#f59e0b"
              />
              <QuickAction
                to="/resident/outing"
                icon={RiMapPinLine}
                label="Apply for Outing"
                color="#22c55e"
              />
              <QuickAction
                to="/resident/my-bookings"
                icon={RiNotificationLine}
                label="View My Bookings"
                color="#eb69ff"
              />
            </div>
          </div>

          {/* Recent Requests */}
          <div>
            <h2 className="text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider mb-4 px-1">
              Recent Requests
            </h2>
            <div className="glass rounded-2xl overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-[color:var(--text-muted)] text-sm">
                  Loading...
                </div>
              ) : requests.length === 0 ? (
                <div className="empty-state">
                  <RiBellLine
                    size={32}
                    className="text-[color:var(--text-muted)]"
                  />
                  <p className="text-sm">No requests yet. Get started!</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className="font-medium text-[color:var(--text-primary)]">
                          {r.type}
                        </td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="text-[color:var(--text-muted)] text-xs">
                          {r.createdAt?.toDate?.()?.toLocaleDateString() || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
