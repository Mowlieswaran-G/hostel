const fs = require('fs');

// ─── Warden: MaintenanceMgmt ─────────────────────────────────────────────────
const maintenanceMgmt = `import { useState } from 'react';
import Navbar from '../../components/Navbar';
import DashboardGreeting from '../../components/DashboardGreeting';
import StatusBadge from '../../components/StatusBadge';
import Skeleton from '../../components/Skeleton';
import { useData } from '../../context/DataContext';
import { db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { RiToolsLine } from 'react-icons/ri';

const TECHNICIANS = ['Rajan (Technician)', 'Murugan (Technician)', 'Selvan (Technician)', 'Cleaning Staff'];
const priorityColor = { low: '#4ade80', medium: '#fbbf24', high: '#ef4444' };

export default function MaintenanceMgmt() {
  const { maintenanceRequests: requests, ready, refreshCollection } = useData();
  const [assigningId, setAssigningId] = useState(null);

  const handleAssign = async (id, techName) => {
    setAssigningId(id);
    try {
      await updateDoc(doc(db, 'maintenanceRequests', id), {
        assignedTo: techName, status: 'inProgress', updatedAt: serverTimestamp(),
      });
      toast.success('Assigned to ' + techName);
      await refreshCollection('maintenanceRequests');
    } catch { toast.error('Failed to assign'); }
    finally { setAssigningId(null); }
  };

  const handleResolve = async (id) => {
    try {
      await updateDoc(doc(db, 'maintenanceRequests', id), {
        status: 'resolved', resolvedAt: serverTimestamp(),
      });
      toast.success('Marked as resolved!');
      await refreshCollection('maintenanceRequests');
    } catch { toast.error('Failed to update status'); }
  };

  const stats = {
    pending:    requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'inProgress').length,
    resolved:   requests.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Assign technicians and manage maintenance requests" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[['Pending', stats.pending, '#ef4444'], ['In Progress', stats.inProgress, '#fbbf24'], ['Resolved', stats.resolved, '#4ade80']].map(([l, v, c]) => (
            <div key={l} className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-black" style={{ color: c }}>{v}</p>
              <p className="text-xs text-[color:var(--text-secondary)] mt-1 font-medium">{l}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[color:var(--text-secondary)] uppercase tracking-widest">All Requests</h2>
        </div>
        {!ready ? <Skeleton rows={6} /> : (
          <div className="glass rounded-2xl overflow-hidden">
            {requests.length === 0 ? (
              <div className="empty-state"><RiToolsLine size={32} className="text-[color:var(--text-muted)]" /><p className="text-sm">No maintenance requests.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Resident</th><th>Room</th><th>Category</th><th>Issue</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Actions</th></tr></thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id}>
                        <td className="text-xs text-[color:var(--text-muted)]">{r.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                        <td className="font-medium text-[color:var(--text-primary)]">{r.residentName}</td>
                        <td className="font-bold">{r.roomNumber}</td>
                        <td className="text-[color:var(--text-secondary)]">{r.category}</td>
                        <td className="text-sm text-[color:var(--text-secondary)] max-w-xs truncate">{r.issue}</td>
                        <td><span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: (priorityColor[r.priority]||'#888')+'20', color: priorityColor[r.priority]||'#888' }}>{r.priority}</span></td>
                        <td><StatusBadge status={r.status} /></td>
                        <td className="text-xs text-[color:var(--text-muted)]">{r.assignedTo || '—'}</td>
                        <td>
                          {r.status !== 'resolved' && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <select className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} defaultValue="" onChange={e => { if (e.target.value) handleAssign(r.id, e.target.value); }} disabled={assigningId === r.id}>
                                <option value="" disabled>Assign...</option>
                                {TECHNICIANS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              {r.status === 'inProgress' && <button onClick={() => handleResolve(r.id)} className="px-2 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors">Resolve</button>}
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
}`;

// ─── Warden: OutingApproval ──────────────────────────────────────────────────
const outingApproval = `import { useState } from 'react';
import Navbar from '../../components/Navbar';
import DashboardGreeting from '../../components/DashboardGreeting';
import StatusBadge from '../../components/StatusBadge';
import Skeleton from '../../components/Skeleton';
import { useData } from '../../context/DataContext';
import { db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { RiMapPinLine } from 'react-icons/ri';

export default function OutingApproval() {
  const { outingRequests: requests, ready, refreshCollection } = useData();

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, 'outingRequests', id), { status: 'approved', updatedAt: serverTimestamp() });
      toast.success('Outing approved!');
      await refreshCollection('outingRequests');
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(db, 'outingRequests', id), { status: 'rejected', rejectReason: 'Request not approved', updatedAt: serverTimestamp() });
      toast.success('Outing rejected');
      await refreshCollection('outingRequests');
    } catch { toast.error('Failed to reject'); }
  };

  const stats = {
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Review and approve resident outing requests" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[['Pending', stats.pending, '#fbbf24'], ['Approved', stats.approved, '#4ade80'], ['Rejected', stats.rejected, '#ef4444']].map(([l, v, c]) => (
            <div key={l} className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-black" style={{ color: c }}>{v}</p>
              <p className="text-xs text-[color:var(--text-secondary)] mt-1 font-medium">{l}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[color:var(--text-secondary)] uppercase tracking-widest">All Outing Requests</h2>
        </div>
        {!ready ? <Skeleton rows={6} /> : (
          <div className="glass rounded-2xl overflow-hidden">
            {requests.length === 0 ? (
              <div className="empty-state"><RiMapPinLine size={32} className="text-[color:var(--text-muted)]" /><p className="text-sm">No outing requests yet.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Resident</th><th>Roll No.</th><th>Room</th><th>Destination</th><th>Out</th><th>Return</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id}>
                        <td className="text-xs text-[color:var(--text-muted)]">{r.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                        <td className="font-medium text-[color:var(--text-primary)]">{r.residentName}</td>
                        <td className="text-[color:var(--text-secondary)]">{r.rollNumber}</td>
                        <td className="font-bold">{r.roomNumber}</td>
                        <td className="text-[color:var(--text-secondary)]">{r.destination}</td>
                        <td className="text-xs text-[color:var(--text-muted)]">{r.outDate}</td>
                        <td className="text-xs text-[color:var(--text-muted)]">{r.returnDate}</td>
                        <td className="text-xs text-[color:var(--text-muted)] max-w-xs truncate">{r.reason}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>
                          {r.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleApprove(r.id)} className="px-3 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors">Approve</button>
                              <button onClick={() => handleReject(r.id)} className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors">Reject</button>
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
}`;

// ─── Warden: BookingApproval ─────────────────────────────────────────────────
const bookingApproval = `import Navbar from '../../components/Navbar';
import DashboardGreeting from '../../components/DashboardGreeting';
import StatusBadge from '../../components/StatusBadge';
import Skeleton from '../../components/Skeleton';
import { useData } from '../../context/DataContext';
import { approveBooking, rejectBooking } from '../../services/booking';
import toast from 'react-hot-toast';

export default function BookingApproval() {
  const { bookingGroups: bookings, ready, refreshCollection } = useData();

  const handleApprove = async (booking) => {
    try {
      const memberCount = (booking.memberRollNumbers?.length || 0) + 1;
      await approveBooking({ id: booking.id, roomId: booking.roomId, memberCount });
      toast.success('Booking approved successfully');
      await Promise.all([refreshCollection('bookingGroups'), refreshCollection('rooms')]);
    } catch { toast.error('Failed to approve booking'); }
  };

  const handleReject = async (id) => {
    try {
      await rejectBooking(id);
      toast.success('Booking rejected');
      await refreshCollection('bookingGroups');
    } catch { toast.error('Failed to reject booking'); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Approve or reject resident room bookings" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">Booking Requests</h2>
        </div>
        {!ready ? <Skeleton rows={5} /> : (
          <div className="glass rounded-2xl p-6 text-[color:var(--text-primary)]">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-[color:var(--text-muted)]">No booking requests found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Room</th><th>Leader Roll No.</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td className="text-xs text-[color:var(--text-muted)]">{booking.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                        <td className="font-bold">{booking.roomNumber}</td>
                        <td>{booking.leaderRoll || 'N/A'}</td>
                        <td className="text-xs text-[color:var(--text-secondary)]">{booking.memberRollNumbers?.length > 0 ? booking.memberRollNumbers.join(', ') : 'None'}</td>
                        <td><StatusBadge status={booking.status} /></td>
                        <td>
                          {booking.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleApprove(booking)} className="px-3 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors">Approve</button>
                              <button onClick={() => handleReject(booking.id)} className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors">Reject</button>
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
}`;

// ─── Technician: TechnicianDashboard ─────────────────────────────────────────
const technicianDashboard = `import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import DashboardGreeting from '../../components/DashboardGreeting';
import StatusBadge from '../../components/StatusBadge';
import Skeleton from '../../components/Skeleton';
import { useData } from '../../context/DataContext';
import { db } from '../../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { RiToolsLine, RiCheckboxCircleLine, RiTimeLine, RiMapPinLine, RiArrowRightLine } from 'react-icons/ri';

const TECH_NAME = 'Rajan (Technician)';
const priorityColor = { low: '#4ade80', medium: '#fbbf24', high: '#ef4444' };

export default function TechnicianDashboard() {
  const { maintenanceRequests: tasks, ready, refreshCollection } = useData();
  const [filter, setFilter] = useState('all');

  const handleMarkInProgress = async (id) => {
    try {
      await updateDoc(doc(db, 'maintenanceRequests', id), { assignedTo: TECH_NAME, status: 'inProgress', updatedAt: serverTimestamp() });
      toast.success('Marked as in progress');
      await refreshCollection('maintenanceRequests');
    } catch { toast.error('Update failed'); }
  };

  const handleResolve = async (id) => {
    try {
      await updateDoc(doc(db, 'maintenanceRequests', id), { status: 'resolved', resolvedAt: serverTimestamp() });
      toast.success('Task resolved!');
      await refreshCollection('maintenanceRequests');
    } catch { toast.error('Update failed'); }
  };

  const myTasks = tasks.filter(t => t.assignedTo === TECH_NAME || t.status === 'pending');
  const displayed = filter === 'all' ? myTasks : myTasks.filter(t => t.status === filter);

  const stats = [
    { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#ef4444', icon: RiTimeLine },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'inProgress').length, color: '#fbbf24', icon: RiToolsLine },
    { label: 'Resolved', value: tasks.filter(t => t.status === 'resolved').length, color: '#4ade80', icon: RiCheckboxCircleLine },
    { label: 'Total', value: tasks.length, color: '#a590ff', icon: RiToolsLine },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Manage your assigned maintenance tasks" />
        {!ready ? <Skeleton type="stat" count={4} /> : (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <div key={s.label} className="glass rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + '20' }}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-black text-[color:var(--text-primary)]">{s.value}</p>
                  <p className="text-xs text-[color:var(--text-muted)] font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to="/technician/heatmap" className="glass rounded-2xl p-5 mb-8 group hover:border-purple-500/30 transition-all" style={{ border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(105,71,255,0.15)' }}>
            <RiMapPinLine size={22} style={{ color: '#a590ff' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[color:var(--text-primary)]">Room Complaint Heatmap</p>
            <p className="text-xs text-[color:var(--text-secondary)]">View which rooms have the most issues by floor</p>
          </div>
          <RiArrowRightLine size={18} className="text-[color:var(--text-muted)] group-hover:translate-x-1 transition-transform" />
        </Link>
        <div className="flex items-center gap-2 mb-5">
          {['all', 'pending', 'inProgress', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: filter === f ? 'rgba(105,71,255,0.25)' : 'var(--glass-bg)', color: filter === f ? '#a590ff' : 'var(--text-muted)', border: \`1px solid \${filter === f ? 'rgba(105,71,255,0.4)' : 'var(--border-subtle)'}\` }}>
              {f === 'all' ? 'All Tasks' : f === 'inProgress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {!ready ? <Skeleton rows={6} /> : (
          <div className="glass rounded-2xl overflow-hidden">
            {displayed.length === 0 ? (
              <div className="empty-state"><RiCheckboxCircleLine size={32} className="text-[color:var(--text-muted)]" /><p className="text-sm">No tasks in this category.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Room</th><th>Floor</th><th>Category</th><th>Issue</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {displayed.map(task => (
                      <tr key={task.id}>
                        <td className="text-xs text-[color:var(--text-muted)]">{task.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                        <td className="font-bold text-[color:var(--text-primary)]">{task.roomNumber}</td>
                        <td className="text-[color:var(--text-secondary)]">Floor {task.floor}</td>
                        <td className="text-[color:var(--text-secondary)]">{task.category}</td>
                        <td className="text-sm text-[color:var(--text-muted)] max-w-xs truncate">{task.issue}</td>
                        <td><span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: (priorityColor[task.priority]||'#888')+'20', color: priorityColor[task.priority]||'#888' }}>{task.priority}</span></td>
                        <td><StatusBadge status={task.status} /></td>
                        <td>
                          {task.status === 'pending' && <button onClick={() => handleMarkInProgress(task.id)} className="px-3 py-1 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-lg text-xs font-semibold transition-colors">Accept</button>}
                          {task.status === 'inProgress' && <button onClick={() => handleResolve(task.id)} className="px-3 py-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-semibold transition-colors">Complete</button>}
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
}`;

// ─── Resident: RoomBooking ────────────────────────────────────────────────────
const roomBooking = `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import DashboardGreeting from '../../components/DashboardGreeting';
import Modal from '../../components/Modal';
import Skeleton from '../../components/Skeleton';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { createBooking, getBookingStatus } from '../../services/booking';
import toast from 'react-hot-toast';
import { RiBuilding2Line, RiGroupLine, RiSearchLine } from 'react-icons/ri';

export default function RoomBooking() {
  const { rooms, ready, refreshCollection } = useData();
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers]   = useState(['']);
  const [submitting, setSubmitting] = useState(false);
  const { user, profile }       = useAuth();
  const navigate                = useNavigate();

  const filtered = rooms.filter(r =>
    r.roomNumber?.toString().includes(search) ||
    r.floor?.toString().includes(search)
  );

  const getOccupancyColor = (room) => {
    const pct = room.occupiedBeds / room.capacity;
    if (pct >= 1) return '#ef4444';
    if (pct >= 0.5) return '#fbbf24';
    return '#4ade80';
  };

  const handleCreateGroup = async () => {
    const validMembers = members.filter(Boolean);
    if (!selected) { toast.error('Select a room first'); return; }
    setSubmitting(true);
    try {
      await createBooking({
        roomId: selected.id, roomNumber: selected.roomNumber,
        memberRollNumbers: validMembers,
        leaderId: user.uid, leaderRoll: profile?.rollNumber,
      });
      toast.success('Booking request submitted! Awaiting warden approval.');
      await refreshCollection('bookingGroups');
      navigate('/resident/my-bookings');
    } catch { toast.error('Failed to create booking'); }
    finally { setSubmitting(false); setShowModal(false); }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-content">
        <DashboardGreeting subtitle="Browse available rooms and create a booking group" />
        <div className="relative mb-6 max-w-sm">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" size={18} />
          <input className="input-field pl-10" placeholder="Search by room or floor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-4 mb-4 text-xs text-[color:var(--text-secondary)]">
          {[['#4ade80','Available'],['#fbbf24','Half Full'],['#ef4444','Full']].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}</span>
          ))}
        </div>
        {!ready ? <Skeleton rows={8} /> : (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Room</th><th>Floor</th><th>Block</th><th>Type</th><th>Capacity</th><th>Occupied</th><th>Vacant</th><th>Rent/Month</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(room => {
                  const vacant = room.capacity - room.occupiedBeds;
                  const isFull = vacant <= 0;
                  return (
                    <tr key={room.id}>
                      <td className="font-bold text-[color:var(--text-primary)]">{room.roomNumber}</td>
                      <td className="text-[color:var(--text-secondary)]">Floor {room.floor}</td>
                      <td className="text-[color:var(--text-secondary)]">Block {room.block}</td>
                      <td className="text-[color:var(--text-secondary)]">{room.type}</td>
                      <td className="text-[color:var(--text-secondary)]">{room.capacity}</td>
                      <td className="text-[color:var(--text-secondary)]">{room.occupiedBeds}</td>
                      <td><span className="font-bold" style={{ color: getOccupancyColor(room) }}>{vacant}</span></td>
                      <td className="text-[color:var(--text-secondary)]">₹{room.monthlyRent?.toLocaleString()}</td>
                      <td><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: getOccupancyColor(room)+'20', color: getOccupancyColor(room) }}>{isFull ? 'Full' : vacant === room.capacity ? 'Available' : 'Partial'}</span></td>
                      <td>
                        {!isFull && (
                          <button onClick={() => { setSelected(room); setShowModal(true); }} className="px-3 py-1 rounded-lg text-xs font-semibold text-white transition-all" style={{ background: 'linear-gradient(135deg,#6947ff,#eb69ff)' }}>
                            Book
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={\`Book Room \${selected?.roomNumber}\`}>
          <p className="text-sm text-[color:var(--text-secondary)] mb-4">Add your group members' roll numbers (optional).</p>
          <div className="space-y-2 mb-4">
            {members.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input className="input-field flex-1" placeholder={\`Member \${i + 1} Roll No.\`} value={m} onChange={e => { const arr = [...members]; arr[i] = e.target.value; setMembers(arr); }} />
                {members.length > 1 && <button onClick={() => setMembers(members.filter((_, j) => j !== i))} className="px-2 text-red-400 hover:text-red-300">✕</button>}
              </div>
            ))}
          </div>
          {members.length < (selected?.capacity - 1) && (
            <button onClick={() => setMembers([...members, ''])} className="text-xs text-purple-400 hover:text-purple-300 mb-4 block">+ Add Member</button>
          )}
          <button onClick={handleCreateGroup} disabled={submitting} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#6947ff,#eb69ff)' }}>
            {submitting ? 'Submitting...' : 'Submit Booking Request'}
          </button>
        </Modal>
      </main>
    </div>
  );
}`;

// Write files
const writes = [
  ['src/pages/Warden/MaintenanceMgmt.jsx',     maintenanceMgmt],
  ['src/pages/Warden/OutingApproval.jsx',       outingApproval],
  ['src/pages/Warden/BookingApproval.jsx',      bookingApproval],
  ['src/pages/Technician/TechnicianDashboard.jsx', technicianDashboard],
  ['src/pages/Resident/RoomBooking.jsx',        roomBooking],
];

writes.forEach(([file, content]) => {
  fs.writeFileSync(file, content);
  console.log('Written: ' + file);
});
console.log('Done!');
