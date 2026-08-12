import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  RiComputerLine,
  RiSunLine,
  RiMoonLine,
  RiCheckLine,
} from "react-icons/ri";

const options = [
  { value: "system", label: "System", Icon: RiComputerLine },
  { value: "light", label: "Light", Icon: RiSunLine },
  { value: "dark", label: "Dark", Icon: RiMoonLine },
];

export default function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const currentOption =
    options.find((o) => o.value === preference) || options[0];
  const CurrentIcon = currentOption.Icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Button sized identically to topbar-signout */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center p-[0.45rem] rounded-[10px] border text-[0.8rem] font-semibold transition-all cursor-pointer shadow-sm hover:-translate-y-[1px] active:translate-y-0"
        style={{
          color: "var(--theme-active-clr)",
          background: "var(--theme-toggle-bg)",
          borderColor: "var(--theme-toggle-br)",
          minHeight: "32.8px",
          minWidth: "32.8px",
        }}
        title={`Appearance (${currentOption.label})`}
        aria-label={`Appearance: ${currentOption.label}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <CurrentIcon size={16} />
      </button>

      {/* Dropdown Menu with distinct spacing between options */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-xl border shadow-xl p-1.5 z-50 animate-fade-in flex flex-col gap-1"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--theme-toggle-br)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
          }}
          role="menu"
        >
          <div
            className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Appearance
          </div>
          {options.map(({ value, label, Icon }) => {
            const isSelected = preference === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPreference(value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-left transition-all cursor-pointer"
                style={{
                  color: isSelected
                    ? "var(--theme-active-clr)"
                    : "var(--text-secondary)",
                  background: isSelected
                    ? "var(--theme-active-bg)"
                    : "transparent",
                  fontWeight: isSelected ? "600" : "500",
                }}
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                </div>
                {isSelected && (
                  <RiCheckLine
                    size={16}
                    className="shrink-0"
                    style={{ color: "var(--theme-active-clr)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
