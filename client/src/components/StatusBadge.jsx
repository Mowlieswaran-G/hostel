import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiLoader4Line,
  RiCheckLine,
} from "react-icons/ri";

const STATUS_MAP = {
  pending: { label: "Pending", cls: "badge-pending", icon: RiTimeLine },
  approved: {
    label: "Approved",
    cls: "badge-approved",
    icon: RiCheckboxCircleLine,
  },
  rejected: {
    label: "Rejected",
    cls: "badge-rejected",
    icon: RiCloseCircleLine,
  },
  inprogress: {
    label: "In Progress",
    cls: "badge-inprogress",
    icon: RiLoader4Line,
  },
  completed: { label: "Completed", cls: "badge-completed", icon: RiCheckLine },
  assigned: { label: "Assigned", cls: "badge-inprogress", icon: RiLoader4Line },
  resolved: { label: "Resolved", cls: "badge-completed", icon: RiCheckLine },
  available: { label: "Available", cls: "badge-approved", icon: RiCheckboxCircleLine },
  partial: { label: "Partial", cls: "badge-partial", icon: RiTimeLine },
  full: { label: "Full", cls: "badge-rejected", icon: RiCloseCircleLine },
  occupied: { label: "Occupied", cls: "badge-rejected", icon: RiCloseCircleLine },
  maintenance: { label: "Maintenance", cls: "badge-inprogress", icon: RiLoader4Line },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status?.toLowerCase()] || STATUS_MAP.pending;
  const Icon = s.icon;
  return (
    <span className={`badge ${s.cls}`}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}
