import { useGreeting } from "../../hooks/useGreeting";
import { RiSparklingLine } from "react-icons/ri";

export default function GreetingText() {
  const { full, isReturning } = useGreeting();

  return (
    <div
      className="text-center mb-3.5 py-1.5 px-3 rounded-xl inline-flex items-center justify-center mx-auto"
      style={{
        background: "rgba(105,71,255,0.08)",
        border: "1px solid rgba(105,71,255,0.2)",
      }}
    >
      <span
        className="inline-flex items-center gap-1.5 text-xs font-medium"
        style={{ color: "rgba(165,144,255,0.9)" }}
      >
        <RiSparklingLine size={13} className="text-purple-400 shrink-0" />
        {full}
      </span>
    </div>
  );
}
