export default function LoadingSpinner({ fullScreen = true }) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500"
          style={{ animation: "spin 0.8s linear infinite" }}
        />
      </div>
      <p className="text-sm text-[color:var(--text-muted)] font-medium">
        Loading SmartHostel...
      </p>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface-900 z-50">
      {content}
    </div>
  );
}
