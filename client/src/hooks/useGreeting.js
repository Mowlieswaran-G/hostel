import { getTimeGreeting, nameFromEmail, cleanDisplayName } from "../firebase/auth";

/**
 * Get a greeting string for the current user.
 * Used on Login (pre-login) and all dashboards (post-login).
 */
export const useGreeting = (email = null) => {
  const greeting = getTimeGreeting();

  // Post-login: use the provided email or username
  if (email) {
    const name = nameFromEmail(email);
    return { greeting, name, full: `${greeting}, ${name}` };
  }

  // Pre-login: check localStorage for returning visitor
  const hasVisited = localStorage.getItem("sh_has_visited");
  const storedName = localStorage.getItem("sh_last_name");
  const lastEmail = localStorage.getItem("sh_last_email");

  if (hasVisited && (storedName || lastEmail)) {
    // Clean whatever was stored so even if an old session had "Mowlieswarang Ad24", it displays cleanly
    const rawName = storedName || (lastEmail ? nameFromEmail(lastEmail) : "");
    const name = cleanDisplayName(rawName);

    return {
      greeting: "Welcome back",
      name,
      full: `Welcome back, ${name}`,
      isReturning: true,
    };
  }

  // First visit: time-based generic greeting
  return {
    greeting,
    name: "",
    full: `${greeting}! Welcome to SmartHostel`,
    isReturning: false,
  };
};

export const persistLoginInfo = (email, displayName = "") => {
  if (email) localStorage.setItem("sh_last_email", email);
  if (displayName) {
    localStorage.setItem("sh_last_name", cleanDisplayName(displayName));
  } else if (email) {
    localStorage.setItem("sh_last_name", nameFromEmail(email));
  }
  localStorage.setItem("sh_has_visited", "true");
};
