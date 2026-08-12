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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

const ROLE_META = {
  resident: {
    align: "center",
    icon: RiHomeLine,
    help: "Use your college Google account",
    color: "#6947ff",
  },
  warden: {
    align: "center",
    icon: RiShieldLine,
    help: "Use the demo account or your warden Google account",
    color: "#22c55e",
  },
  technician: {
    align: "center",
    icon: RiWrenchLine,
    help: "Use the demo account or your technician Google account",
    color: "#f59e0b",
  },
};

// Demo credentials for warden and technician
const DEMO_CREDS = {
  warden: { email: "warden@smarthostel.com", password: "warden@123" },
  technician: { email: "technician@smarthostel.com", password: "tech@123" },
};

// Star field component
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: (Math.random() * 3 + 2).toFixed(1),
    delay: (Math.random() * 4).toFixed(1),
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationName: "twinkle",
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationTimingFunction: "ease-in-out",
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
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const { user, role: authRole, loading: authLoading } = useAuth();

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
      const { email, displayName, uid } = result.user;

      // Validate email against selected role
      const validation = validateRoleEmail(email, selectedRole);
      if (!validation.valid) {
        await result.user.delete().catch(() => {}); // revoke if mismatched
        toast.error(validation.message);
        setLoading(false);
        return;
      }

      // Ensure Firestore profile exists with correct role
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid,
          email,
          name: displayName || nameFromEmail(email),
          role: selectedRole,
          createdAt: serverTimestamp(),
        });
      }

      // Persist login info for greeting
      persistLoginInfo(email);
      toast.success(`Welcome, ${displayName || nameFromEmail(email)}!`);
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

  const handleEmailSignIn = () => {
    setAuthError("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const demoCreds = DEMO_CREDS[selectedRole];
    const isDemoRole =
      selectedRole === "warden" || selectedRole === "technician";

    // ── Local (no Firebase) auth for warden / technician ──
    if (isDemoRole) {
      if (!demoCreds) {
        setAuthError("No demo account configured for this role.");
        setLoading(false);
        return;
      }
      if (trimmedEmail !== demoCreds.email.toLowerCase()) {
        setAuthError(`Incorrect email. Expected: ${demoCreds.email}`);
        setLoading(false);
        return;
      }
      if (password !== demoCreds.password) {
        setAuthError("Incorrect password. Please try again.");
        setLoading(false);
        return;
      }

      // ✅ Credentials match — create a local mock session
      const mockProfile = {
        uid: `mock-${selectedRole}`,
        email: demoCreds.email,
        name: selectedRole === "warden" ? "Warden Demo" : "Technician Demo",
        role: selectedRole,
      };
      setMockSession(mockProfile);
      persistLoginInfo(demoCreds.email);
      toast.success(`Welcome, ${mockProfile.name}!`);
      // Force a page reload so AuthContext re-reads localStorage
      window.location.href = `/${selectedRole}`;
      return;
    }

    // ── Resident: shouldn't reach here (uses Google sign-in) ──
    setAuthError("Please use Google sign-in for resident accounts.");
    setLoading(false);
  };

  const meta = ROLE_META[selectedRole];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
        className="tilt-card relative z-10 w-full mx-4 animate-slide-up"
        style={{ maxWidth: "440px" }}
      >
        <div
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(24px) saturate(1.3)",
            WebkitBackdropFilter: "blur(24px) saturate(1.3)",
            border: "1px solid var(--glass-border-lg)",
            borderRadius: "26px",
            padding: "2.5rem 2rem",
            boxShadow: `0 0 60px rgba(105,71,255,0.15), 0 20px 60px rgba(0,0,0,0.2), 0 1px 0 var(--glass-border) inset`,
          }}
        >
          {/* Brand */}
          <div className="text-center mb-7">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-glow-pulse"
              style={{
                background: `linear-gradient(135deg, ${meta.color}, ${meta.color}88)`,
              }}
            >
              <meta.icon size={28} color="white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[color:var(--text-primary)] mb-1">
              SmartHostel
            </h1>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Hostel Management Platform
            </p>
          </div>

          {/* First-visit / welcome-back greeting */}
          <GreetingText />
          <div className="h-6"></div>
          {/* Role Selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-[color:var(--text-muted)] uppercase tracking-widest mb-2">
              Sign in as
            </p>
            <RoleSelector value={selectedRole} onChange={setSelectedRole} />
          </div>

          {/* Demo credentials hint for warden / technician */}
          {(selectedRole === "warden" || selectedRole === "technician") &&
            DEMO_CREDS[selectedRole] && (
              <div
                className="mb-5 rounded-2xl p-4 border"
                style={{
                  background: `${meta.color}12`,
                  borderColor: `${meta.color}35`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: meta.color }}
                    >
                      Demo Account
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase text-[color:var(--text-muted)] w-16 shrink-0">
                          Email
                        </span>
                        <span className="text-xs font-mono text-[color:var(--text-primary)] truncate">
                          {DEMO_CREDS[selectedRole].email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase text-[color:var(--text-muted)] w-16 shrink-0">
                          Password
                        </span>
                        <span className="text-xs font-mono text-[color:var(--text-primary)]">
                          {DEMO_CREDS[selectedRole].password}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(DEMO_CREDS[selectedRole].email);
                      setPassword(DEMO_CREDS[selectedRole].password);
                    }}
                    className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer"
                    style={{
                      color: meta.color,
                      borderColor: `${meta.color}50`,
                      background: `${meta.color}15`,
                    }}
                  >
                    Auto-fill
                  </button>
                </div>
              </div>
            )}

          {/* Email / Password */}
          <div className="space-y-5 mb-6">
            <div>
              <label htmlFor="email" className="input-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="name@example.com"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            <div className="h-4"></div>
            <div className="space-y-4">
              <button
                type="button"
                className="btn-primary w-full"
                onClick={handleEmailSignIn}
                disabled={loading || !email || !password}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Or
              </p>
              <button
                id="btn-google-signin"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-google w-full"
              >
                {loading ? (
                  <div
                    className="w-5 h-3 rounded-full border-2 border-gray-300 border-t-gray-600"
                    style={{ animation: "spin 0.7s linear infinite" }}
                  />
                ) : (
                  <img
                    src={googleLogo}
                    alt="Google logo"
                    className="w-7 h-5 object-contain"
                  />
                )}
                <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
              </button>
            </div>
          </div>

          {authError ? (
            <p className="text-center text-sm text-red-300 mb-4">{authError}</p>
          ) : null}

          {/* Helper text */}
          <p className="text-center text-xs text-[color:var(--text-muted)]">
            {meta.help}
          </p>

          {/* Security note */}
          <div className="mt-6 pt-5 border-t border-white/5"></div>
        </div>
      </div>
    </div>
  );
}
