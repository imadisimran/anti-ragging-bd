import { Clock, Hourglass, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { icon: Clock, textColor: "text-amber-600", bgColor: "bg-amber-600", animate: true, modalLabel: "PENDING" },
  SUBMITTED: { icon: Clock, textColor: "text-amber-600", bgColor: "bg-amber-600", animate: true, modalLabel: "PENDING" },
  NEW: { icon: Clock, textColor: "text-amber-600", bgColor: "bg-amber-600", animate: true, modalLabel: "PENDING" },
  INVESTIGATING: { icon: Hourglass, textColor: "text-amber-600", bgColor: "bg-amber-600", animate: false, modalLabel: "INVESTIGATING" },
  RESOLVED: { icon: CheckCircle, textColor: "text-green-700", bgColor: "bg-green-700", animate: false, modalLabel: "RESOLVED" },
  REJECTED: { icon: AlertCircle, textColor: "text-error", bgColor: "bg-error", animate: false, modalLabel: "REJECTED" },
} as const;
export default function StatusBadge({ status, variant = "text" }: { status: string; variant?: "text" | "filled" }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!config) return null;
  const Icon = config.icon;
  if (variant === "filled") {
    const isPendingLike = status === "PENDING" || status === "NEW" || status === "SUBMITTED";
    return (
      <span className={`${config.bgColor} text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center ${isPendingLike ? "gap-1.5" : "gap-1"}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.modalLabel}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${config.textColor} ${config.animate ? "animate-pulse" : ""}`} />
      <span className={`text-label-sm ${config.textColor} font-bold uppercase tracking-wider`}>
        {status}
      </span>
    </div>
  );
}