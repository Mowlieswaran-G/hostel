import { getTimeGreeting, nameFromEmail } from "../firebase/auth";

/**
 * Get a greeting string for the current user.
 * Used on Login (pre-login) and all dashboards (post-login).
 */
export const useGreeting = (email = null) => {
  const greeting = getTimeGreeting();

  // Post-login: use the provided email
  if (email) {
    const name = nameFromEmail(email);
    return { greeting, name, full: `${greeting}, ${name}` };
  }

  // Pre-login: check localStorage for returning visitor
  const hasVisited = localStorage.getItem("sh_has_visited");
  const lastEmail = localStorage.getItem("sh_last_email");

  if (hasVisited && lastEmail) {
    const name = nameFromEmail(lastEmail);
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

export const persistLoginInfo = (email) => {
  localStorage.setItem("sh_last_email", email);
  localStorage.setItem("sh_has_visited", "true");
};
