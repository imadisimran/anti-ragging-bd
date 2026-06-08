const PRIORITY_CONFIG = {
  High: {
    classes: "bg-error-container/50 text-error border border-error/20",
  },
  Medium: {
    classes: "bg-amber-100 text-amber-800 border border-amber-200/50",
  },
  Low: {
    classes: "bg-slate-100 text-on-surface-variant border border-slate-200",
  },
} as const;

export default function PriorityBadge({
  priority,
}: {
  priority: "High" | "Medium" | "Low";
}) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Low;

  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider inline-block ${config.classes}`}
    >
      {priority}
    </span>
  );
}
