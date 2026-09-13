import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import DashboardGreeting from "../../components/DashboardGreeting";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { useData } from "../../context/DataContext";
import {
  RiBuilding2Line,
  RiBuildingFill,
  RiTimeLine,
  RiToolsLine,
  RiMapPinLine,
  RiArrowRightLine,
} from "react-icons/ri";

const COLORS = ["#6947ff", "#22c55e", "#f59e0b", "#ef4444", "#eb69ff"];

const SAMPLE_TREND = [
  { month: "Mar", occupancy: 65 },
  { month: "Apr", occupancy: 72 },
  { month: "May", occupancy: 80 },
  { month: "Jun", occupancy: 78 },
  { month: "Jul", occupancy: 85 },
  { month: "Aug", occupancy: 88 },
];

const SAMPLE_COMPLAINTS = [
  { name: "Electrical", value: 12 },
  { name: "Plumbing", value: 8 },
  { name: "Furniture", value: 6 },
  { name: "Cleaning", value: 9 },
  { name: "Others", value: 4 },
];

export default function WardenDashboard() {
  const { rooms, bookingGroups, maintenanceRequests, outingRequests, ready } = useData();

  const stats = {
    rooms: rooms.length,
    occupied: rooms.filter((r) => (r.occupiedBeds || 0) > 0).length,
    pending: bookingGroups.filter((b) => b.status === "pending").length,
    maintenance: maintenanceRequests.filter((m) => m.status === "pending").length,
    outside: outingRequests.filter((o) => o.status === "approved").length,
  };
  const loading = !ready;

  const statCards = [
    {
      label: "Total Rooms",
      value: stats.rooms,
      color: "#6947ff",
      icon: RiBuilding2Line,
    },
    {
      label: "Occupied Rooms",
      value: stats.occupied,
      color: "#22c55e",
      icon: RiBuildingFill,
    },
    {
      label: "Pending Bookings",
      value: stats.pending,
      color: "#f59e0b",
      icon: RiTimeLine,
    },
    {
      label: "Open Complaints",
      value: stats.maintenance,
      color: "#ef4444",
      icon: RiToolsLine,
    },
    {
      label: "Students Outside",
      value: stats.outside,
      color: "#eb69ff",
      icon: RiMapPinLine,
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass p-3 text-sm">
        <p className="text-[color:var(--text-primary)] mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  // Heatmap data: 3 floors x 10 rooms
  const heatmapData = Array.from({ length: 3 }, (_, floor) =>
    Array.from({ length: 10 }, (_, i) => ({
      room: `${floor + 1}0${i + 1}`,
      complaints: Math.floor(Math.random() * 8),
    })),
  );

  const heatLevel = (n) =>
    n === 0 ? "none" : n < 3 ? "low" : n < 6 ? "medium" : "high";

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Hostel overview — manage rooms, maintenance, and student outings" />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {statCards.map((s) => (
            <div key={s.label} className="stat-card text-center py-6 px-3">
              <div
                className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-sm"
                style={{ background: `${s.color}22` }}
              >
                <s.icon size={22} style={{ color: s.color }} />
              </div>
              {loading ? (
                <div className="shimmer h-8 w-12 mx-auto rounded mb-1" />
              ) : (
                <p
                  className="text-3xl font-display font-black mb-1.5"
                  style={{ color: s.color }}
                >
                  {s.value}
                </p>
              )}
              <p className="text-xs text-[color:var(--text-muted)] font-semibold uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Occupancy Trend */}
          <div className="glass-lg p-6">
            <h3 className="font-bold text-[color:var(--text-primary)] mb-4">
              Occupancy Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={SAMPLE_TREND}>
                <defs>
                  <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6947ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6947ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-subtle)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#6947ff"
                  strokeWidth={2}
                  fill="url(#occGrad)"
                  name="Occupancy %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Complaints by Type */}
          <div className="glass-lg p-5">
            <h3 className="font-bold text-[color:var(--text-primary)] mb-4">
              Complaints by Type
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={SAMPLE_COMPLAINTS}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {SAMPLE_COMPLAINTS.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => (
                    <span
                      style={{ color: "var(--text-secondary)", fontSize: 11 }}
                    >
                      {v}
                    </span>
                  )}
                />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap */}
        <div className="glass-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base text-[color:var(--text-primary)]">
              Room Complaint Heatmap
            </h3>
            <div className="flex items-center gap-3.5 text-xs text-[color:var(--text-secondary)]">
              {[
                ["#4ade80", "Low"],
                ["#fbbf24", "Medium"],
                ["#ef4444", "High"],
                ["var(--border-subtle)", "None"],
              ].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded shadow-xs" style={{ background: c }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {heatmapData.map((floor, fi) => (
              <div key={fi}>
                <p className="text-xs font-bold text-[color:var(--text-secondary)] uppercase tracking-wider mb-2">
                  Floor {fi + 1}
                </p>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: "repeat(10,1fr)" }}
                >
                  {floor.map((cell) => (
                    <div
                      key={cell.room}
                      className={`heatmap-cell heatmap-${heatLevel(cell.complaints)} aspect-square flex items-center justify-center`}
                      title={`Room ${cell.room}: ${cell.complaints} complaints`}
                    >
                      <span className="text-xs font-bold text-[color:var(--text-primary)]">
                        {cell.room.slice(-2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              to: "/warden/bookings",
              label: "Review Bookings",
              icon: RiBuilding2Line,
              color: "#6947ff",
            },
            {
              to: "/warden/maintenance",
              label: "Manage Maintenance",
              icon: RiToolsLine,
              color: "#f59e0b",
            },
            {
              to: "/warden/outings",
              label: "Outing Approvals",
              icon: RiMapPinLine,
              color: "#22c55e",
            },
          ].map(({ to, label, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="stat-card flex items-center gap-3.5 group p-4 cursor-pointer"
              style={{ textDecoration: "none" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: `${color}22` }}
              >
                <Icon size={19} style={{ color }} />
              </div>
              <span className="text-sm font-semibold text-[color:var(--text-primary)]">
                {label}
              </span>
              <RiArrowRightLine
                size={16}
                className="ml-auto text-[color:var(--text-muted)] group-hover:text-[color:var(--text-primary)] group-hover:translate-x-1 transition-all shrink-0"
              />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
