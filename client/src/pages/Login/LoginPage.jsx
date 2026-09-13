import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithGoogle,
  validateRoleEmail,
  nameFromEmail,
} from "../../firebase/auth";
import { setMockSession } from "../../context/AuthContext";
import { persistLoginInfo } from "../../hooks/useGreeting";
import { useAuth } from "../../context/AuthContext";
import RoleSelector from "./RoleSelector";
import GreetingText from "./GreetingText";
import toast from "react-hot-toast";
import { RiShieldLine, RiHomeLine, RiWrenchLine } from "react-icons/ri";
import googleLogo from "../../assets/google-logo.webp";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import api from "../../services/api";
import ThemeToggle from "../../components/ThemeToggle";

const ROLE_META = {
  resident: {
    align: "center",
    icon: RiHomeLine,
    help: "Sign in with credentials or college Google account",
    color: "#6947ff",
  },
  warden: {
    align: "center",
    icon: RiShieldLine,
    help: "Sign in with warden credentials or Google account",
    color: "#22c55e",
  },
  technician: {
    align: "center",
    icon: RiWrenchLine,
    help: "Sign in with technician credentials or Google account",
    color: "#f59e0b",
  },
};

// Demo credentials for quick testing
const DEMO_CREDS = {
  warden: {
    username: "warden",
    email: "warden@smarthostel.com",
    password: "warden@123",
    name: "Warden Demo",
  },
  technician: {
    username: "technician",
    email: "technician@smarthostel.com",
    password: "tech@123",
    name: "Technician Demo",
  },
};

// Sparkles & Star field component (Visible in both dark & light/white theme)
function Stars() {
  const sparkles = Array.from({ length: 85 }, (_, i) => {
    const isDiamond = i % 5 === 0;
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: isDiamond ? Math.random() * 4 + 4 : Math.random() * 2.5 + 1.2,
      duration: (Math.random() * 3 + 2).toFixed(1),
      delay: (Math.random() * 4).toFixed(1),
      isDiamond,
      type: i % 3,
    };
  });

  return (
    <div className="login-sparkles fixed inset-0 overflow-hidden pointer-events-none z-0">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className={`login-sparkle ${s.isDiamond ? "sparkle-diamond" : "sparkle-dot"} sparkle-type-${s.type}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("resident");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAutofill, setShowAutofill] = useState(false);
  const cardRef = useRef(null);
  const emailWrapperRef = useRef(null);
  const navigate = useNavigate();
  const { user, role: authRole, loading: authLoading } = useAuth();

  // Close floating autofill when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emailWrapperRef.current &&
        !emailWrapperRef.current.contains(e.target)
      ) {
        setShowAutofill(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && authRole) {
      navigate(`/${authRole}`, { replace: true });
    }
  }, [user, authRole, authLoading, navigate]);

  // Cursor tilt effect
  const handlePointerMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 6;
    const tiltY = (x / (rect.width / 2)) * 6;
    card.style.setProperty("--tilt-x", `${tiltX}deg`);
    card.style.setProperty("--tilt-y", `${tiltY}deg`);
  }, []);

  const handlePointerLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const { email: userEmail, displayName, uid } = result.user;

      // Validate email against selected role
      const validation = validateRoleEmail(userEmail, selectedRole);
      if (!validation.valid) {
        await result.user.delete().catch(() => { }); // revoke if mismatched
        toast.error(validation.message);
        setLoading(false);
        return;
      }

      // Non-blocking background sync to Firestore (does not delay sign-in)
      setDoc(
        doc(db, "users", uid),
        {
          uid,
          email: userEmail,
          name: displayName || nameFromEmail(userEmail),
          role: selectedRole,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => { });

      // Persist login info for greeting with clean name
      persistLoginInfo(userEmail, displayName || nameFromEmail(userEmail));
      toast.success(`Welcome, ${displayName || nameFromEmail(userEmail)}!`);
      navigate(`/${selectedRole}`, { replace: true });
    } catch (err) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error("Sign-in failed. Please try again.");
        setAuthError("Unable to sign in with Google right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const demoCreds = DEMO_CREDS[selectedRole];

    // 1. Instant match with demo credentials (by email or username)
    const isDemoMatch =
      demoCreds &&
      (trimmedEmail === demoCreds.email.toLowerCase() ||
        trimmedEmail === (demoCreds.username || "").toLowerCase()) &&
      password === demoCreds.password;

    if (isDemoMatch) {
      const mockProfile = {
        uid:
          selectedRole === "resident"
            ? "demo-student-1"
            : `mock-${selectedRole}`,
        id:
          selectedRole === "resident"
            ? "demo-student-1"
            : `mock-${selectedRole}`,
        email: demoCreds.email,
        name:
          demoCreds.name ||
          `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Demo`,
        role: selectedRole,
        rollNumber: selectedRole === "resident" ? "21CS001" : undefined,
        roomNumber: selectedRole === "resident" ? "101" : undefined,
        floor: selectedRole === "resident" ? 1 : undefined,
      };
      setMockSession(mockProfile);
      persistLoginInfo(demoCreds.email, mockProfile.name);
      toast.success(`Welcome, ${mockProfile.name}!`);
      window.location.href = `/${selectedRole}`;
      return;
    }

    // 2. Authenticate via backend API (MySQL)
    try {
      const res = await api.post("/auth/login", {
        email: trimmedEmail,
        password,
        role: selectedRole,
      });

      if (res.data?.user) {
        const userObj = res.data.user;
        setMockSession(userObj);
        persistLoginInfo(trimmedEmail, userObj.name);
        toast.success(`Welcome, ${userObj.name || "User"}!`);
        window.location.href = `/${selectedRole}`;
        return;
      }
    } catch (err) {
      console.warn("API login failed:", err);
      const msg =
        err.response?.data?.error ||
        "Invalid user name or password. Please check your credentials.";
      setAuthError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    setAuthError("Invalid credentials. Please try again.");
    setLoading(false);
  };

  const meta = ROLE_META[selectedRole];
  const demoCreds = DEMO_CREDS[selectedRole];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Moonlit background */}
      <div className="moonlit-bg" />
      <Stars />

      {/* Glowing orbs */}
      <div
        className="moonlit-orb w-[600px] h-[600px] rounded-full"
        style={{
          top: "-200px",
          left: "-100px",
          background:
            "radial-gradient(circle, rgba(105,71,255,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="moonlit-orb w-[400px] h-[400px] rounded-full"
        style={{
          bottom: "-100px",
          right: "-50px",
          background:
            "radial-gradient(circle, rgba(235,105,255,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Login Card */}
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="tilt-card relative z-10 w-full mx-3 animate-slide-up"
        style={{ maxWidth: "370px" }}
      >
        <div
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(24px) saturate(1.3)",
            WebkitBackdropFilter: "blur(24px) saturate(1.3)",
            border: "1px solid var(--glass-border-lg)",
            borderRadius: "18px",
            padding: "1.6rem 1.35rem",
            boxShadow: `0 0 45px rgba(105,71,255,0.12), 0 16px 36px rgba(0,0,0,0.25), 0 1px 0 var(--glass-border) inset`,
          }}
        >
          {/* Brand */}
          <div className="flex flex-col items-center justify-center text-center mb-3.5 w-full">
            <div
              className="w-10 h-10 rounded-xl mb-2 flex items-center justify-center p-2 animate-glow-pulse shadow-md shrink-0 border border-white/10"
              style={{
                background: `linear-gradient(135deg, ${meta.color}, ${meta.color}88)`,
                margin: "0 auto",
              }}
            >
              <img
                src="/hostel-logo.png"
                alt="SmartHostel"
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <h1 className="font-display text-xl font-bold text-[color:var(--text-primary)] leading-tight">
              SmartHostel
            </h1>
            <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">
              Hostel Management Platform
            </p>
          </div>

          {/* First-visit / welcome-back greeting */}
          <div className="flex justify-center mb-3">
            <GreetingText />
          </div>

          {/* Role Selector */}
          <div className="mb-3.5">
            <p className="text-[10px] font-semibold text-[color:var(--text-muted)] uppercase tracking-widest mb-1.5">
              Sign in as
            </p>
            <RoleSelector
              value={selectedRole}
              onChange={(newRole) => {
                setSelectedRole(newRole);
                setShowAutofill(false);
                setAuthError("");
                setEmail("");
                setPassword("");
              }}
            />
          </div>

          {/* Unified Credentials Form (Resident, Warden & Technician) */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div className="space-y-2">
              {/* Username / Email field with on-focus floating autofill */}
              <div ref={emailWrapperRef} className="relative">
                <label
                  htmlFor="email"
                  className="input-label"
                  style={{ fontSize: "0.75rem", marginBottom: "0.2rem" }}
                >
                  User Name
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setShowAutofill(true)}
                  onClick={() => setShowAutofill(true)}
                  className="input-field"
                  style={{
                    padding: "0.55rem 0.8rem",
                    fontSize: "0.82rem",
                    borderRadius: "10px",
                  }}
                  placeholder="Enter User Name"
                  disabled={loading}
                  autoComplete="off"
                />

                {/* Floating Auto-fill Dropdown: Appears ONLY when clicking/focusing username, ZERO layout disturbance */}
                {showAutofill && demoCreds && (
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-xl p-2.5 shadow-2xl animate-scale-in"
                    style={{
                      background: "rgba(20, 22, 34, 0.97)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: `1px solid ${meta.color}60`,
                      boxShadow: `0 14px 30px rgba(0,0,0,0.6), 0 0 18px ${meta.color}25`,
                    }}
                  >
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full animate-pulse shrink-0"
                          style={{ background: meta.color }}
                        />
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: meta.color }}
                        >
                          Auto-fill demo {selectedRole}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAutofill(false)}
                        className="text-white/40 hover:text-white/90 text-xs px-1 leading-none cursor-pointer"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEmail(demoCreds.email);
                        setPassword(demoCreds.password);
                        setShowAutofill(false);
                        toast.success("Credentials autofilled!");
                      }}
                      className="w-full flex items-center justify-between gap-2 p-2 rounded-lg transition-all text-left cursor-pointer hover:brightness-110 active:scale-[0.98]"
                      style={{
                        background: `${meta.color}15`,
                        border: `1px solid ${meta.color}35`,
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-mono text-white/95 truncate font-semibold">
                          {demoCreds.email}
                        </p>
                        <p className="text-[10px] text-white/50 font-mono mt-0.5">
                          Password: {demoCreds.password}
                        </p>
                      </div>
                      <span
                        className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-md border text-white shadow-sm"
                        style={{
                          background: meta.color,
                          borderColor: meta.color,
                        }}
                      >
                        Auto-fill
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="input-label"
                  style={{ fontSize: "0.75rem", marginBottom: "0.2rem" }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{
                    padding: "0.55rem 0.8rem",
                    fontSize: "0.82rem",
                    borderRadius: "10px",
                  }}
                  placeholder="Enter Your Password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="btn-primary w-full"
                style={{
                  padding: "0.58rem 1rem",
                  fontSize: "0.84rem",
                  borderRadius: "10px",
                }}
                disabled={loading || !email || !password}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
              <div className="flex items-center gap-2 my-1.5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-[color:var(--text-muted)] uppercase tracking-wider">
                  or
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <button
                id="btn-google-signin"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-google w-full"
                style={{
                  padding: "0.55rem 1rem",
                  fontSize: "0.82rem",
                  borderRadius: "10px",
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                ) : (
                  <img
                    src={googleLogo}
                    alt="Google logo"
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
              </button>
            </div>
          </form>

          {authError ? (
            <p className="text-center text-xs text-red-300 mt-2 mb-1">{authError}</p>
          ) : null}

          {/* Helper text */}
          <p className="text-center text-[11px] text-[color:var(--text-muted)] mt-3">
            {meta.help}
          </p>
        </div>
      </div>
    </div>
  );
}
