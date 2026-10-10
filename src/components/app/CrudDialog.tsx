import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SelectInput } from "./kit";
import { errMsg } from "@/lib/constants";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "email" | "select" | "textarea" | "time";
  options?: (string | { value: string; label: string })[];
  required?: boolean;
  full?: boolean;
};

export type FormValues = Record<string, string>;

/** Generic validated create/edit dialog used by every management page. */
export function CrudDialog({ open, onOpenChange, title, description, fields, initial, onSubmit, submitLabel = "Save" }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  initial: FormValues;
  onSubmit: (v: Record<string, string | number | null>) => Promise<void>;
  submitLabel?: string;
}) {
  const [vals, setVals] = useState<FormValues>(initial);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setVals(initial); setErrs({}); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    const out: Record<string, string | number | null> = {};
    for (const f of fields) {
      const v = (vals[f.key] ?? "").trim();
      if (f.required && !v) { er[f.key] = `${f.label} is required`; continue; }
      if (v.length > 500) er[f.key] = "Too long";
      if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) er[f.key] = "Enter a valid email";
      if (f.type === "number" && v) {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) er[f.key] = "Enter a whole number ≥ 0";
        out[f.key] = n;
      } else out[f.key] = v || null;
    }
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await onSubmit(out);
      onOpenChange(false);
    } catch (e2) {
      toast.error(errMsg(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <Field key={f.key} label={f.label + (f.required ? " *" : "")} error={errs[f.key]} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
              {f.type === "select" ? (
                <SelectInput value={vals[f.key] ?? ""} onChange={(v) => setVals({ ...vals, [f.key]: v })} options={f.options ?? []} />
              ) : f.type === "textarea" ? (
                <Textarea value={vals[f.key] ?? ""} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} rows={3} />
              ) : (
                <Input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "time" ? "time" : f.type === "email" ? "email" : "text"}
                  value={vals[f.key] ?? ""}
                  onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
                />
              )}
            </Field>
          ))}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function toForm(row: object | null | undefined, keys: string[]): FormValues {
  const r = (row ?? {}) as Record<string, unknown>;
  const o: FormValues = {};
  keys.forEach((k) => { o[k] = r[k] == null ? "" : String(r[k]); });
  return o;
}

export function DetailGrid({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs text-muted-foreground">{k}</dt>
          <dd className="text-sm font-medium text-foreground">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
