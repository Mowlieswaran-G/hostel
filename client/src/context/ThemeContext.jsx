import { createContext, useContext, useEffect, useState } from "react";

// ─── Theme Options ──────────────────────────────────────────────────────────
// 'system' | 'light' | 'dark'
const ThemeContext = createContext(null);

/**
 * Resolves the effective theme ('light' | 'dark') from the user preference.
 * When preference is 'system', it reads the OS media query.
 */
function resolveTheme(preference) {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(
    () => localStorage.getItem("theme-preference") || "system",
  );
  const [resolved, setResolved] = useState(() =>
    resolveTheme(localStorage.getItem("theme-preference") || "system"),
  );

  // Apply the resolved theme as a data-attribute on <html>
  useEffect(() => {
    const effective = resolveTheme(preference);
    setResolved(effective);
    document.documentElement.setAttribute("data-theme", effective);
    localStorage.setItem("theme-preference", preference);
  }, [preference]);

  // Listen for OS-level theme changes when preference is 'system'
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const effective = e.matches ? "dark" : "light";
      setResolved(effective);
      document.documentElement.setAttribute("data-theme", effective);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  return (
    <ThemeContext.Provider value={{ preference, setPreference, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
