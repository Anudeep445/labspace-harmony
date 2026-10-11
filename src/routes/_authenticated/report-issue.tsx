import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, Field, LoadingState, PageHeader, Panel, SelectInput, StatusBadge } from "@/components/app/kit";
import { Workflow } from "./maintenance";
import { byId, useEquipment, useLabs, useMaintenance, useRefresh } from "@/lib/data";
import { useMe } from "@/lib/auth";
import { ISSUE_TYPES, PRIORITIES, fmtDate } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/report-issue")({
  head: () => ({ meta: [{ title: "Report Issue — LabSphere" }, { name: "description", content: "Report damaged or faulty laboratory equipment." }, { property: "og:title", content: "Report Issue — LabSphere" }, { property: "og:description", content: "Report faulty lab equipment." }] }),
  component: ReportIssuePage,
});

const EMPTY = { lab_id: "", equipment_id: "", issue_type: "", priority: "", description: "" };

function ReportIssuePage() {
  const me = useMe();
  const labs = useLabs();
  const eq = useEquipment();
  const mr = useMaintenance();
  const refresh = useRefresh();
  const eqMap = byId(eq.data);
  const [f, setF] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const labEq = (eq.data ?? []).filter((e) => e.lab_id === f.lab_id);
  const mine = (mr.data ?? []).filter((m) => m.reported_by === me.id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.lab_id) er["lab_id"] = "Select a laboratory";
    if (!f.equipment_id) er["equipment_id"] = "Select the equipment";
    if (!f.issue_type) er["issue_type"] = "Select an issue type";
    if (!f.priority) er["priority"] = "Select severity";
    if (f.description.trim().length < 10) er["description"] = "Describe the problem (at least 10 characters)";
    if (f.description.length > 1000) er["description"] = "Keep it under 1000 characters";
    if (file && (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) er["file"] = "Upload an image under 5 MB";
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    let image_url: string | null = null;
    if (file) {
      const path = `${me.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const up = await supabase.storage.from("issue-images").upload(path, file, { contentType: file.type });
      if (up.error) { setBusy(false); toast.error(`Photo upload failed: ${up.error.message}`); return; }
      image_url = path;
    }
    const { error } = await supabase.from("maintenance_requests").insert({
      lab_id: f.lab_id, equipment_id: f.equipment_id, issue_type: f.issue_type, priority: f.priority,
      description: f.description.trim(), reported_by: me.id, reporter_name: me.name, image_url,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(["High", "Critical"].includes(f.priority) ? "Issue reported — equipment marked Under Maintenance" : "Issue reported to the lab administrator");
    setF(EMPTY); setFile(null);
    refresh();
  }

  return (
    <div>
      <PageHeader title="Report Equipment Issue" description="Report damaged or faulty equipment. High and Critical issues take the equipment out of service immediately." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Issue details" className="lg:col-span-3">
          <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field label="Laboratory *" error={errs["lab_id"]}><SelectInput value={f.lab_id} onChange={(v) => setF({ ...f, lab_id: v, equipment_id: "" })} options={(labs.data ?? []).map((l) => ({ value: l.id, label: l.name }))} /></Field>
            <Field label="Equipment *" error={errs["equipment_id"]}>
              <SelectInput key={f.lab_id} value={f.equipment_id} onChange={(v) => setF({ ...f, equipment_id: v })} placeholder={f.lab_id ? "Select equipment" : "Choose a lab first"}
                options={labEq.map((e) => ({ value: e.id, label: `${e.code} — ${e.name} (${e.status})` }))} />
            </Field>
            <Field label="Issue type *" error={errs["issue_type"]}><SelectInput value={f.issue_type} onChange={(v) => setF({ ...f, issue_type: v })} options={ISSUE_TYPES} /></Field>
            <Field label="Severity *" error={errs["priority"]}><SelectInput value={f.priority} onChange={(v) => setF({ ...f, priority: v })} options={PRIORITIES} /></Field>
            <Field label="Description *" error={errs["description"]} className="sm:col-span-2"><Textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What is wrong? When did it start?" /></Field>
            <Field label="Photo (optional)" error={errs["file"]} className="sm:col-span-2"><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
            <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Submit report</Button></div>
          </form>
        </Panel>
        <Panel title="My reported issues" className="lg:col-span-2">
          {mr.isLoading ? <LoadingState /> : mine.length === 0 ? <EmptyState title="No reports yet" /> : (
            <div className="space-y-3">{mine.map((m) => (
              <div key={m.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{m.code} · {m.equipment_id ? eqMap.get(m.equipment_id)?.name : "—"}</p>
                  <StatusBadge status={m.priority} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.description}</p>
                <div className="mt-2"><Workflow status={m.status} /></div>
                <p className="mt-1 text-[11px] text-muted-foreground">{fmtDate(m.created_at)}{m.resolution ? ` · ${m.resolution}` : ""}</p>
              </div>
            ))}</div>
          )}
        </Panel>
      </div>
    </div>
  );
}
