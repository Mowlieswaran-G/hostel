import { RiHomeLine, RiShieldLine, RiWrenchLine } from "react-icons/ri";

const ROLES = [
  { id: "resident", label: "Resident", icon: RiHomeLine },
  { id: "warden", label: "Warden", icon: RiShieldLine },
  { id: "technician", label: "Technician", icon: RiWrenchLine },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <div className="segment-control" role="group" aria-label="Select role">
      {ROLES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          id={`role-btn-${id}`}
          type="button"
          onClick={() => onChange(id)}
          className={`segment-btn ${value === id ? "active" : ""}`}
          aria-pressed={value === id}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Icon size={14} />
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
