import { useAuth } from "../context/AuthContext";
import { getTimeGreeting, nameFromEmail } from "../firebase/auth";
import { RiSunLine, RiMoonLine, RiSunFoggyLine } from "react-icons/ri";

const GreetingIcon = () => {
  const h = new Date().getHours();
  if (h < 12) return <RiSunFoggyLine className="text-yellow-400" size={28} />;
  if (h < 17) return <RiSunLine className="text-orange-400" size={28} />;
  return <RiMoonLine className="text-indigo-400" size={28} />;
};

export default function DashboardGreeting({ subtitle }) {
  const { profile } = useAuth();
  const greeting = getTimeGreeting();
  const rawName = profile?.name || profile?.email || "there";
  const name = nameFromEmail(rawName);

  return (
    <div className="flex items-center gap-4 mb-8 animate-slide-up">
      <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center shrink-0">
        <GreetingIcon />
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold text-[color:var(--text-primary)]">
          {greeting}, <span className="gradient-text">{name}</span>
        </h1>
        {subtitle && (
          <p className="text-sm text-[color:var(--text-secondary)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
