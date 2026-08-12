import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Skeleton from "../../components/Skeleton";
import DashboardGreeting from "../../components/DashboardGreeting";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase/config";
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
    className="stat-card flex items-center gap-4 group cursor-pointer"
    style={{ textDecoration: "none" }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${color}22` }}
    >
      <Icon size={22} style={{ color }} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-[color:var(--text-primary)]">
        {label}
      </p>
    </div>
    <RiArrowRightLine
      size={16}
      className="text-[color:var(--text-muted)] group-hover:text-[color:var(--text-primary)] group-hover:translate-x-1 transition-all"
    />
  </Link>
);

export default function ResidentDashboard() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const mSnap = await getDocs(
          query(
            collection(db, "maintenanceRequests"),
            where("studentId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(5),
          ),
        );
        const oSnap = await getDocs(
          query(
            collection(db, "outingRequests"),
            where("studentId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(3),
          ),
        );
        const bSnap = await getDocs(
          query(
            collection(db, "bookingGroups"),
            where("members", "array-contains", user.uid),
            limit(3),
          ),
        );
        const all = [
          ...mSnap.docs.map((d) => ({
            id: d.id,
            type: "Maintenance",
            ...d.data(),
          })),
          ...oSnap.docs.map((d) => ({ id: d.id, type: "Outing", ...d.data() })),
          ...bSnap.docs.map((d) => ({
            id: d.id,
            type: "Booking",
            ...d.data(),
          })),
        ].slice(0, 6);
        setRequests(all);
        setStats({
          pending: all.filter((r) => r.status === "pending").length,
          approved: all.filter((r) => r.status === "approved").length,
          total: all.length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting
          subtitle={`Welcome back to SmartHostel${profile?.hostel ? ` · ${profile.hostel}` : ""}`}
        />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Requests", value: stats.total, color: "#6947ff" },
            { label: "Pending", value: stats.pending, color: "#fbbf24" },
            { label: "Approved", value: stats.approved, color: "#4ade80" },
          ].map((s) => (
            <div key={s.label} className="stat-card text-center">
              <p
                className="text-3xl font-display font-bold mb-1"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <p className="text-xs text-[color:var(--text-secondary)] font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-semibold text-[color:var(--text-secondary)] uppercase tracking-widest mb-3">
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
            <h2 className="text-sm font-semibold text-[color:var(--text-secondary)] uppercase tracking-widest mb-3">
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
