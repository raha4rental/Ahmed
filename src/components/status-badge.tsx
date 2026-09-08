import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ApartmentStatus, MaintenancePriority, MaintenanceStatus, TaskStatus, UtilityStatus } from "@/lib/types";

const aptTone: Record<ApartmentStatus, string> = {
  ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  booked: "bg-sky-100 text-sky-800 border-sky-200",
  occupied: "bg-blue-100 text-blue-800 border-blue-200",
  cleaning: "bg-amber-100 text-amber-900 border-amber-200",
  inspection: "bg-orange-100 text-orange-900 border-orange-200",
  maintenance: "bg-rose-100 text-rose-800 border-rose-200",
  not_ready: "bg-stone-100 text-stone-700 border-stone-200",
};

const aptDot: Record<ApartmentStatus, string> = {
  ready: "🟢",
  booked: "🔵",
  occupied: "🔵",
  cleaning: "🟡",
  inspection: "🟠",
  maintenance: "🔴",
  not_ready: "⚪",
};

export function AptStatus({
  status,
  label,
  className,
}: {
  status: ApartmentStatus;
  label: string;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", aptTone[status], className)}>
      <span aria-hidden>{aptDot[status]}</span>
      {label}
    </Badge>
  );
}

export function PriorityBadge({
  priority,
  labels,
}: {
  priority: MaintenancePriority;
  labels: { urgent: string; normal: string; low: string };
}) {
  const tone =
    priority === "urgent"
      ? "bg-rose-100 text-rose-800 border-rose-200"
      : priority === "normal"
        ? "bg-amber-100 text-amber-900 border-amber-200"
        : "bg-stone-100 text-stone-700 border-stone-200";
  const dot = priority === "urgent" ? "🔴" : priority === "normal" ? "🟡" : "⚪";
  return (
    <Badge variant="outline" className={cn("gap-1", tone)}>
      <span>{dot}</span>
      {labels[priority]}
    </Badge>
  );
}

export function MaintStatusBadge({
  status,
  labels,
}: {
  status: MaintenanceStatus;
  labels: Record<MaintenanceStatus, string>;
}) {
  const tone: Record<MaintenanceStatus, string> = {
    new: "bg-rose-100 text-rose-800 border-rose-200",
    assigned: "bg-amber-100 text-amber-900 border-amber-200",
    in_progress: "bg-sky-100 text-sky-800 border-sky-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  const dot: Record<MaintenanceStatus, string> = {
    new: "🔴",
    assigned: "🟡",
    in_progress: "🔵",
    completed: "🟢",
  };
  return (
    <Badge variant="outline" className={cn("gap-1", tone[status])}>
      <span>{dot[status]}</span>
      {labels[status]}
    </Badge>
  );
}

export function UtilBadge({ status, labels }: { status: UtilityStatus; labels: Record<UtilityStatus, string> }) {
  const tone: Record<UtilityStatus, string> = {
    unpaid: "bg-rose-100 text-rose-800 border-rose-200",
    due_soon: "bg-amber-100 text-amber-900 border-amber-200",
    paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  const dot: Record<UtilityStatus, string> = { unpaid: "🔴", due_soon: "🟡", paid: "🟢" };
  return (
    <Badge variant="outline" className={cn("gap-1", tone[status])}>
      <span>{dot[status]}</span>
      {labels[status]}
    </Badge>
  );
}

export function TaskDot({ status }: { status: TaskStatus | ApartmentStatus }) {
  if (status === "completed" || status === "ready") return <span>🟢</span>;
  if (status === "failed" || status === "maintenance") return <span>🔴</span>;
  if (status === "in_progress" || status === "inspection") return <span>🟠</span>;
  return <span>🟡</span>;
}
