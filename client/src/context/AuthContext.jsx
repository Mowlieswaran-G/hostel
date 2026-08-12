import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { nameFromEmail } from "../firebase/auth";

const AuthContext = createContext(null);

// ── Local mock session helpers ────────────────────────────────────────────────
const MOCK_KEY = "sh_mock_session";

export const getMockSession = () => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_KEY));
  } catch {
    return null;
  }
};
export const setMockSession = (data) =>
  localStorage.setItem(MOCK_KEY, JSON.stringify(data));
export const clearMockSession = () => localStorage.removeItem(MOCK_KEY);

// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for a local mock session (warden / technician dummy login)
    const mock = getMockSession();
    if (mock) {
      setUser({
        uid: mock.uid,
        email: mock.email,
        displayName: mock.name,
        isMock: true,
      });
      setProfile(mock);
      setRole(mock.role);
      setLoading(false);
      // Still subscribe to Firebase so real sign-out clears mock
    }

    // 2. Listen to Firebase auth state (for resident Google sign-in)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // Don't clear mock session here — only clear if explicitly signed out
        if (!getMockSession()) {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
        return;
      }

      // Firebase user is present — real Google sign-in (resident)
      setUser(firebaseUser);

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const normalizedName = data.name
            ? data.name.includes("@")
              ? nameFromEmail(data.name)
              : data.name
            : nameFromEmail(data.email);
          setProfile({ ...data, name: normalizedName });
          setRole(data.role);
        } else {
          const newProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || nameFromEmail(firebaseUser.email),
            role: "resident",
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
          setRole("resident");
        }
      } catch (err) {
        console.error("AuthContext error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logoutContext = () => {
    clearMockSession();
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const value = { user, profile, role, loading, setProfile, logoutContext };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
