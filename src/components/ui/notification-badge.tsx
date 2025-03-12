import { cn } from "~/lib/utils";

interface NotificationBadgeProps {
  count?: number;
  className?: string;
}

export function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  if (!count || count <= 0) return null;

  return (
    <div
      className={cn(
        "-right- absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-medium text-white ring-2 ring-zinc-900",
        className,
      )}
      style={{ backgroundColor: "rgb(249, 115, 22)" }}
    >
      {count > 9 ? "9+" : count}
    </div>
  );
}
