import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <FlaskConical className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <p className={cn("font-display text-base font-bold", light ? "text-sidebar-accent-foreground" : "text-foreground")}>LabSphere</p>
        <p className={cn("text-[11px]", light ? "text-sidebar-foreground/70" : "text-muted-foreground")}>Laboratory Management</p>
      </div>
    </div>
  );
}
