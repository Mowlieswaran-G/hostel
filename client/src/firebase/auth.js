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
 * Clean and format a display name, removing email artifacts, batch/department codes (e.g. ad24, cs21, etc.).
 */
export const cleanDisplayName = (name) => {
  if (!name) return "";

  // If match for user's email prefix (e.g. mowlieswarang or mowlieswarang ad24)
  if (/^mowlieswaran\s*g?(\s*ad\d+)?$/i.test(name.trim())) {
    return "Mowlieswaran G";
  }

  // Remove department+batch codes like ad24, aids24, cs21, it22, 21cs, etc.
  let cleaned = name
    .replace(/\b[a-zA-Z]{1,5}\d{1,4}\b/gi, "")
    .replace(/\b\d{1,4}[a-zA-Z]{1,5}\b/gi, "")
    .replace(/\b\d+\b/g, "")
    .trim();

  // If it was mowlieswarang, format cleanly as Mowlieswaran G
  if (/^mowlieswarang$/i.test(cleaned)) {
    return "Mowlieswaran G";
  }

  // Clean multiple spaces and title case
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return name;

  return words
    .map((w) => {
      if (w.length === 1) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
};

/**
 * Derive a clean display name from an email address or username.
 * Strips email domains, department/batch tags (e.g. .ad24, .cs21), and cleans up formatting.
 */
export const nameFromEmail = (email) => {
  if (!email) return "";
  const raw = email.includes("@") ? email.split("@")[0] : email;

  // Check specific known username pattern
  if (/^mowlieswaran/i.test(raw)) {
    return "Mowlieswaran G";
  }

  // Split by dot, underscore, hyphen, or plus
  const parts = raw.split(/[._\-+]/);

  // Filter out parts that are department+year codes (e.g. ad24, cs21, it23, 21cs001) or pure numbers
  const filtered = parts.filter((part) => {
    if (/^\d+$/.test(part)) return false;
    if (/^[a-zA-Z]{1,5}\d{1,4}$/i.test(part)) return false;
    if (/^\d{1,4}[a-zA-Z]{1,5}$/i.test(part)) return false;
    return true;
  });

  const nameParts = filtered.length > 0 ? filtered : parts;
  const rawJoined = nameParts.join(" ");

  return cleanDisplayName(rawJoined);
};

/** Time-of-day greeting string */
export const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};
