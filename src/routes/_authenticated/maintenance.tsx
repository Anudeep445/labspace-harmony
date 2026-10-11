import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, Loader2, Pencil, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Field, FilterSelect, LoadingState, PageHeader, Pager, RequireRole, SearchBox, SelectInput, StatusBadge, TableWrap, Toolbar, usePaged } from "@/components/app/kit";
import { DetailGrid } from "@/components/app/CrudDialog";
import { IssueImage } from "@/components/app/IssueImage";
import { byId, useEquipment, useLabs, useMaintenance, useRefresh, type Maintenance } from "@/lib/data";
import { useMe } from "@/lib/auth";
import { MAINT_STATUSES, PRIORITIES, fmtDate, includesQ } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — LabSphere" }, { name: "description", content: "Equipment maintenance requests and repair workflow." }, { property: "og:title", content: "Maintenance — LabSphere" }, { property: "og:description", content: "Equipment maintenance requests." }] }),
  component: () => <RequireRole roles={["admin", "faculty"]}><MaintenancePage /></RequireRole>,
});

const STEPS = ["Reported", "Inspected", "Under Maintenance", "Resolved"];
const stepOf = (s: string) => (s === "Open" ? 0 : s === "Assigned" ? 1 : s === "In Progress" ? 2 : 3);

export function Workflow({ status }: { status: string }) {
  const cur = stepOf(status);
  return (
    <div className="flex items-center gap-1 text-[11px]">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <span className={cn("rounded-full px-2 py-0.5", i <= cur ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{s}</span>
          {i < STEPS.length - 1 && <span className="text-muted-foreground">→</span>}
        </div>
      ))}
    </div>
  );
}

function MaintenancePage() {
  const me = useMe();
  const isAdmin = me.role === "admin";
  const mr = useMaintenance();
  const eq = useEquipment();
  const labs = useLabs();
  const refresh = useRefresh();
  const eqMap = byId(eq.data);
  const labMap = byId(labs.data);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("all");
  const [pr, setPr] = useState("all");
  const [lab, setLab] = useState("all");
  const [view, setView] = useState<Maintenance | null>(null);
  const [edit, setEdit] = useState<Maintenance | null>(null);

  const rows = (mr.data ?? []).filter((m) => (st === "all" || m.status === st) && (pr === "all" || m.priority === pr) && (lab === "all" || m.lab_id === lab) &&
    includesQ(q, m.code, m.description, m.reporter_name, m.technician, m.equipment_id ? eqMap.get(m.equipment_id)?.name : ""));
  const pg = usePaged(rows, 12);
  const open = (mr.data ?? []).filter((m) => !["Resolved", "Closed"].includes(m.status)).length;

  return (
    <div>
      <PageHeader title="Maintenance" description={`${open} open request${open === 1 ? "" : "s"}. High/critical issues place equipment under maintenance automatically.`}
        actions={<Button asChild><Link to="/report-issue"><TriangleAlert className="h-4 w-4" /> Report issue</Link></Button>} />
      <Toolbar>
        <SearchBox value={q} onChange={(v) => { setQ(v); pg.setPage(1); }} placeholder="Search ID, equipment, reporter…" />
        <FilterSelect value={st} onChange={(v) => { setSt(v); pg.setPage(1); }} options={MAINT_STATUSES} placeholder="All statuses" />
        <FilterSelect value={pr} onChange={(v) => { setPr(v); pg.setPage(1); }} options={PRIORITIES} placeholder="All priorities" />
        <FilterSelect value={lab} onChange={(v) => { setLab(v); pg.setPage(1); }} options={(labs.data ?? []).map((l) => ({ value: l.id, label: l.name }))} placeholder="All laboratories" />
      </Toolbar>
      <TableWrap>
        {mr.isLoading ? <LoadingState /> : mr.error ? <ErrorState error={mr.error} onRetry={() => mr.refetch()} /> : rows.length === 0 ? <EmptyState title="No maintenance requests" /> : (<>
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Equipment</TableHead><TableHead>Laboratory</TableHead><TableHead>Problem</TableHead><TableHead>Reported by</TableHead><TableHead>Date</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Technician</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{pg.slice.map((m) => {
              const e = m.equipment_id ? eqMap.get(m.equipment_id) : undefined;
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.code}</TableCell>
                  <TableCell className="whitespace-nowrap"><p className="font-medium">{e?.name ?? "—"}</p>{e && <p className="text-xs text-muted-foreground">{e.code} · <span>{e.status}</span></p>}</TableCell>
                  <TableCell className="whitespace-nowrap">{m.lab_id ? labMap.get(m.lab_id)?.name : "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">{m.description}</TableCell>
                  <TableCell className="whitespace-nowrap">{m.reporter_name}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{fmtDate(m.created_at)}</TableCell>
                  <TableCell><StatusBadge status={m.priority} /></TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{m.technician ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <Button variant="ghost" size="icon" onClick={() => setView(m)} aria-label="View"><Eye className="h-4 w-4" /></Button>
                    {isAdmin && <Button variant="ghost" size="icon" onClick={() => setEdit(m)} aria-label="Update"><Pencil className="h-4 w-4" /></Button>}
                  </TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table>
          <Pager {...pg} />
        </>)}
      </TableWrap>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {view && <>
            <DialogHeader><DialogTitle>{view.code}</DialogTitle></DialogHeader>
            <Workflow status={view.status} />
            <DetailGrid items={[["Equipment", view.equipment_id ? `${eqMap.get(view.equipment_id)?.name} (${eqMap.get(view.equipment_id)?.status})` : "—"], ["Laboratory", view.lab_id ? labMap.get(view.lab_id)?.name : "—"], ["Issue type", view.issue_type], ["Priority", view.priority], ["Reported by", view.reporter_name], ["Date", fmtDate(view.created_at)], ["Status", view.status], ["Technician", view.technician], ["Resolution", view.resolution]]} />
            <p className="text-sm"><span className="text-xs text-muted-foreground">Problem description</span><br />{view.description}</p>
            {view.image_url && <IssueImage path={view.image_url} />}
          </>}
        </DialogContent>
      </Dialog>
      <UpdateDialog m={edit} onClose={() => setEdit(null)} onDone={refresh} />
    </div>
  );
}

function UpdateDialog({ m, onClose, onDone }: { m: Maintenance | null; onClose: () => void; onDone: () => void }) {
  const [status, setStatus] = useState("");
  const [tech, setTech] = useState("");
  const [res, setRes] = useState("");
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (m) { setStatus(m.status); setTech(m.technician ?? ""); setRes(m.resolution ?? ""); setErr(undefined); } }, [m]);
  async function save() {
    if (["Assigned", "In Progress"].includes(status) && !tech.trim()) return setErr("Assign a technician first");
    if (["Resolved", "Closed"].includes(status) && !res.trim()) return setErr("Describe the resolution");
    if (!m) return;
    setBusy(true);
    const { error } = await supabase.from("maintenance_requests").update({ status, technician: tech.trim() || null, resolution: res.trim() || null }).eq("id", m.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(["Resolved", "Closed"].includes(status) ? "Resolved — equipment marked Available" : "Request updated");
    onDone(); onClose();
  }
  return (
    <Dialog open={!!m} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Update {m?.code}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Field label="Status"><SelectInput value={status} onChange={setStatus} options={MAINT_STATUSES} /></Field>
          <Field label="Assigned technician"><Input value={tech} maxLength={100} onChange={(e) => setTech(e.target.value)} placeholder="e.g. Ramesh (IT Support)" /></Field>
          <Field label="Resolution" error={err}><Textarea value={res} maxLength={500} onChange={(e) => setRes(e.target.value)} placeholder="What was done to fix it" /></Field>
          <p className="text-xs text-muted-foreground">Assigned / In Progress → equipment Under Maintenance. Resolved / Closed → equipment Available.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
