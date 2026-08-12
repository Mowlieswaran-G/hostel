import { useGreeting } from "../../hooks/useGreeting";
import { RiSparklingLine } from "react-icons/ri";

export default function GreetingText() {
  const { full, isReturning } = useGreeting();

  return (
    <div
      className="text-center mb-6 py-3 px-4 rounded-2xl"
      style={{
        background: "rgba(105,71,255,0.08)",
        border: "1px solid rgba(105,71,255,0.15)",
      }}
    >
      <span
        className="inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: "rgba(165,144,255,0.9)" }}
      >
        <RiSparklingLine size={15} className="text-purple-400" />
        {full}
      </span>
    </div>
  );
}
