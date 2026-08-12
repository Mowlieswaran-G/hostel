import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";
import {
  RiUserLine,
  RiBookLine,
  RiBuildingLine,
  RiGraduationCapLine,
} from "react-icons/ri";

const DEPARTMENTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Others",
];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const HOSTELS = ["Block A", "Block B", "Block C", "Block D", "Block E"];

export default function RegisterPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    hostel: "",
    department: "",
    year: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.rollNumber) navigate("/resident", { replace: true });
    if (user) setForm((f) => ({ ...f, name: user.displayName || "" }));
  }, [profile, user, navigate]);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.rollNumber ||
      !form.hostel ||
      !form.department ||
      !form.year
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...form,
        profileComplete: true,
      });
      toast.success("Profile created!");
      navigate("/resident", { replace: true });
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 20% 10%, #1a0533 0%, #060411 40%, #0a0219 100%)",
      }}
    >
      <div className="glass-lg w-full max-w-md p-8 animate-slide-up">
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 mx-auto mb-4 flex items-center justify-center">
            <RiUserLine size={26} color="white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[color:var(--text-primary)]">
            Complete Your Profile
          </h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-1">
            One-time setup to access SmartHostel
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="input-label">
              <RiUserLine className="inline mr-1" size={12} />
              Full Name
            </label>
            <input
              id="reg-name"
              className="input-field"
              placeholder="Your full name"
              value={form.name}
              onChange={handle("name")}
            />
          </div>
          <div className="form-group">
            <label className="input-label">
              <RiBookLine className="inline mr-1" size={12} />
              Roll Number
            </label>
            <input
              id="reg-roll"
              className="input-field"
              placeholder="e.g. 21CS001"
              value={form.rollNumber}
              onChange={handle("rollNumber")}
            />
          </div>
          <div className="form-group">
            <label className="input-label">
              <RiBuildingLine className="inline mr-1" size={12} />
              Hostel Block
            </label>
            <select
              id="reg-hostel"
              className="select-field"
              value={form.hostel}
              onChange={handle("hostel")}
            >
              <option value="">Select block</option>
              {HOSTELS.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="input-label">
                <RiGraduationCapLine className="inline mr-1" size={12} />
                Department
              </label>
              <select
                id="reg-dept"
                className="select-field"
                value={form.department}
                onChange={handle("department")}
              >
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Year</label>
              <select
                id="reg-year"
                className="select-field"
                value={form.year}
                onChange={handle("year")}
              >
                <option value="">Select</option>
                {YEARS.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Email</label>
            <input
              className="input-field opacity-60"
              value={user?.email || ""}
              disabled
            />
          </div>
          <button
            id="reg-submit"
            type="submit"
            disabled={saving}
            className="btn-primary w-full mt-2"
          >
            {saving ? "Saving..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
