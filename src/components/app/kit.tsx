import { useState, type ReactNode } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, Loader2, Search, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Role } from "@/lib/constants";
import { useMe } from "@/lib/auth";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const TONE: Record<string, string> = {
  success: "bg-success/12 text-success ring-success/25",
  warning: "bg-warning/15 text-warning ring-warning/30",
  danger: "bg-destructive/10 text-destructive ring-destructive/25",
  info: "bg-info/12 text-info ring-info/25",
  primary: "bg-primary/10 text-primary ring-primary/25",
  neutral: "bg-muted text-muted-foreground ring-border",
};
const STATUS_TONE: Record<string, keyof typeof TONE> = {
  Available: "success", Approved: "success", Present: "success", Resolved: "success", "In Stock": "success", Excellent: "success", Good: "success",
  Occupied: "info", "In Use": "info", Assigned: "info", Completed: "primary", Low: "neutral",
  Pending: "warning", Maintenance: "warning", "Under Maintenance": "warning", "In Progress": "warning", "Low Stock": "warning", Medium: "info", Fair: "warning",
  Rejected: "danger", Damaged: "danger", Lost: "danger", Absent: "danger", "Out of Stock": "danger", Critical: "danger", High: "danger", Open: "danger", Poor: "danger",
  Inactive: "neutral", Cancelled: "neutral", Closed: "neutral",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = TONE[STATUS_TONE[status] ?? "neutral"];
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", tone, className)}>
      {status}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, hint, tone = "primary" }: {
  label: string; value: ReactNode; icon: React.ComponentType<{ className?: string }>; hint?: string; tone?: keyof typeof TONE;
}) {
  return (
    <div className="card-surface flex items-start justify-between p-5">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className={cn("rounded-lg p-2.5 ring-1 ring-inset", TONE[tone])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export function Panel({ title, description, children, actions, className }: {
  title?: string; description?: string; children: ReactNode; actions?: ReactNode; className?: string;
}) {
  return (
    <section className={cn("card-surface", className)}>
      {title && (
        <div className="flex items-center justify-between gap-2 border-b px-5 py-3.5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}
export function EmptyState({ title = "Nothing here yet", description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="rounded-full bg-muted p-3"><Inbox className="h-6 w-6 text-muted-foreground" /></div>
      <p className="mt-3 font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="rounded-full bg-destructive/10 p-3"><AlertTriangle className="h-6 w-6 text-destructive" /></div>
      <p className="mt-3 font-medium text-foreground">Couldn't load data</p>
      <p className="mt-1 text-sm text-muted-foreground">{error instanceof Error ? error.message : "Unexpected error"}</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-card pl-9" />
    </div>
  );
}

export function FilterSelect({ value, onChange, options, placeholder, className }: {
  value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; placeholder: string; className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full bg-card sm:w-44", className)}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return <SelectItem key={v} value={v}>{l}</SelectItem>;
        })}
      </SelectContent>
    </Select>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="no-print mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>;
}

export function Field({ label, error, children, className }: { label: string; error?: string | undefined; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function SelectInput({ value, onChange, options, placeholder = "Select…" }: {
  value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; placeholder?: string;
}) {
  return (
    <Select {...(value ? { value } : {})} onValueChange={onChange}>
      <SelectTrigger className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return <SelectItem key={v} value={v}>{l}</SelectItem>;
        })}
      </SelectContent>
    </Select>
  );
}

export function ConfirmAction({ trigger, title, description, confirmLabel = "Delete", onConfirm }: {
  trigger: ReactNode; title: string; description: string; confirmLabel?: string; onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function usePaged<T>(rows: T[], size = 15) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(page, pages);
  return { page: p, pages, setPage, slice: rows.slice((p - 1) * size, p * size), total: rows.length, size };
}
export function Pager({ page, pages, setPage, total, size }: { page: number; pages: number; setPage: (n: number) => void; total: number; size: number }) {
  if (total <= size) return null;
  return (
    <div className="no-print flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
      <span>Showing {(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="px-2">{page} / {pages}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const me = useMe();
  if (!roles.includes(me.role)) {
    return (
      <div className="card-surface mx-auto mt-10 max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-3 text-lg font-semibold">Access restricted</h2>
        <p className="mt-1 text-sm text-muted-foreground">This page is not available for the {me.role} role.</p>
      </div>
    );
  }
  return <>{children}</>;
}

/** Wraps a table so it scrolls horizontally on small screens. */
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="card-surface overflow-hidden"><div className="overflow-x-auto">{children}</div></div>;
}
