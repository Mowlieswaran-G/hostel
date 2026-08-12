import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./config";

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Dummy account whitelist for Warden and Technician roles
export const DUMMY_ACCOUNTS = {
  warden: {
    email: "warden@smarthostel.com",
    name: "Warden Demo",
    role: "warden",
  },
  technician: {
    email: "technician@smarthostel.com",
    name: "Technician Demo",
    role: "technician",
  },
};

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithEmailPassword = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);
export const createDemoAccount = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);
export const signOutUser = () => signOut(auth);

/**
 * Validate that the user's Google email matches the expected role.
 * Residents: any email accepted.
 * Warden / Technician via Google: must match DUMMY_ACCOUNTS whitelist.
 * Warden / Technician via email+password: accepted (Firebase enforces the account).
 */
export const validateRoleEmail = (
  email,
  selectedRole,
  isEmailPasswordLogin = false,
) => {
  if (selectedRole === "resident") return { valid: true };

  // For email+password logins, the Firebase account itself is the gatekeeper
  if (isEmailPasswordLogin) return { valid: true };

  const expected = DUMMY_ACCOUNTS[selectedRole];
  if (!expected) return { valid: false, message: "Unknown role." };

  if (email.toLowerCase() !== expected.email.toLowerCase()) {
    return {
      valid: false,
      message: `This Google account is not registered as a ${selectedRole}. Please use ${expected.email}.`,
    };
  }
  return { valid: true };
};

/**
 * Derive a display name from an email address.
 * e.g. mouli.k@college.edu → "Mouli K"
 */
export const nameFromEmail = (email) => {
  const username = email.split("@")[0];
  return username
    .replace(/[._]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

/** Time-of-day greeting string */
export const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};
