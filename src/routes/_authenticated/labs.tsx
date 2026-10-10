import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmAction, EmptyState, ErrorState, FilterSelect, LoadingState, PageHeader, SearchBox, StatusBadge, TableWrap, Toolbar } from "@/components/app/kit";
import { CrudDialog, DetailGrid, toForm, type FieldDef } from "@/components/app/CrudDialog";
import { byId, useBookings, useEquipment, useFaculty, useLabs, useRefresh, type Lab } from "@/lib/data";
import { useMe } from "@/lib/auth";
import { DEPARTMENTS, LAB_STATUSES, LAB_TYPES, fmtDate, includesQ, t5, todayISO } from "@/lib/constants";
import { deleteRow, nextCode, saveRow } from "@/lib/mutate";

export const Route = createFileRoute("/_authenticated/labs")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } => (s["new"] ? { new: true } : {}),
  head: () => ({ meta: [{ title: "Laboratories — LabSphere" }, { name: "description", content: "College laboratories, capacity and status." }, { property: "og:title", content: "Laboratories — LabSphere" }, { property: "og:description", content: "College laboratories, capacity and status." }] }),
  component: LabsPage,
});

const KEYS = ["code", "name", "department", "building", "floor", "room", "capacity", "lab_type", "status", "faculty_id"];

function LabsPage() {
  const me = useMe();
  const isAdmin = me.role === "admin";
  const search = Route.useSearch();
  const labs = useLabs();
  const fac = useFaculty();
  const eq = useEquipment();
  const bk = useBookings();
  const refresh = useRefresh();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [edit, setEdit] = useState<Lab | null | undefined>(search.new && isAdmin ? null : undefined);
  const [view, setView] = useState<Lab | null>(null);
  const facMap = byId(fac.data);

  const eqCount = useMemo(() => {
    const m = new Map<string, number>();
    eq.data?.forEach((e) => e.lab_id && m.set(e.lab_id, (m.get(e.lab_id) ?? 0) + 1));
    return m;
  }, [eq.data]);

  const rows = (labs.data ?? []).filter((l) =>
    includesQ(q, l.code, l.name, l.room, l.building) && (dept === "all" || l.department === dept) && (status === "all" || l.status === status) && (type === "all" || l.lab_type === type));

  const fields: FieldDef[] = [
    { key: "code", label: "Lab ID", required: true },
    { key: "name", label: "Lab name", required: true },
    { key: "department", label: "Department", type: "select", options: DEPARTMENTS, required: true },
    { key: "lab_type", label: "Lab type", type: "select", options: LAB_TYPES, required: true },
    { key: "building", label: "Building", required: true },
    { key: "floor", label: "Floor", required: true },
    { key: "room", label: "Room number", required: true },
    { key: "capacity", label: "Capacity", type: "number", required: true },
    { key: "status", label: "Status", type: "select", options: LAB_STATUSES, required: true },
    { key: "faculty_id", label: "Responsible faculty", type: "select", options: (fac.data ?? []).map((f) => ({ value: f.id, label: f.name })) },
  ];

  const today = todayISO();
  const viewEq = view ? (eq.data ?? []).filter((e) => e.lab_id === view.id) : [];
  const viewBk = view ? (bk.data ?? []).filter((b) => b.lab_id === view.id && b.booking_date >= today && ["Approved", "Pending"].includes(b.status)).sort((a, b) => (a.booking_date + a.start_time).localeCompare(b.booking_date + b.start_time)) : [];

  return (
    <div>
      <PageHeader title="Laboratories" description="All college laboratories with location, capacity and current status."
        actions={isAdmin && <Button onClick={() => setEdit(null)}><Plus className="h-4 w-4" /> Add laboratory</Button>} />
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search by name, ID, room…" />
        <FilterSelect value={dept} onChange={setDept} options={DEPARTMENTS} placeholder="All departments" />
        <FilterSelect value={type} onChange={setType} options={LAB_TYPES} placeholder="All types" />
        <FilterSelect value={status} onChange={setStatus} options={LAB_STATUSES} placeholder="All statuses" />
      </Toolbar>
      <TableWrap>
        {labs.isLoading ? <LoadingState /> : labs.error ? <ErrorState error={labs.error} onRetry={() => labs.refetch()} /> : rows.length === 0 ? <EmptyState title="No laboratories found" description="Try changing the search or filters." /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Lab ID</TableHead><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Location</TableHead>
              <TableHead>Capacity</TableHead><TableHead>Type</TableHead><TableHead>Faculty</TableHead><TableHead>Equipment</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.code}</TableCell>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{l.department}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{l.building}, {l.floor}, {l.room}</TableCell>
                  <TableCell>{l.capacity}</TableCell>
                  <TableCell>{l.lab_type}</TableCell>
                  <TableCell className="whitespace-nowrap">{l.faculty_id ? facMap.get(l.faculty_id)?.name : "—"}</TableCell>
                  <TableCell>{eqCount.get(l.id) ?? 0}</TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => setView(l)} aria-label="View"><Eye className="h-4 w-4" /></Button>
                    {isAdmin && <>
                      <Button variant="ghost" size="icon" onClick={() => setEdit(l)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                      <ConfirmAction title={`Delete ${l.name}?`} description="Its bookings and attendance records will be removed and equipment will be unassigned. This cannot be undone."
                        onConfirm={async () => { try { await deleteRow("labs", l.id); toast.success("Laboratory deleted"); refresh(); } catch (e) { toast.error((e as Error).message); } }}
                        trigger={<Button variant="ghost" size="icon" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>} />
                    </>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableWrap>

      <CrudDialog open={edit !== undefined} onOpenChange={(o) => !o && setEdit(undefined)} title={edit ? "Edit laboratory" : "Add laboratory"} fields={fields}
        initial={edit ? toForm(edit, KEYS) : { ...toForm(null, KEYS), code: nextCode("LAB-", labs.data ?? [], 2), status: "Available", capacity: "30" }}
        onSubmit={async (v) => { await saveRow("labs", edit?.id ?? null, v); toast.success(edit ? "Laboratory updated" : "Laboratory added"); refresh(); }} />

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          {view && <>
            <DialogHeader><DialogTitle>{view.name} <span className="ml-2 align-middle"><StatusBadge status={view.status} /></span></DialogTitle></DialogHeader>
            <DetailGrid items={[["Lab ID", view.code], ["Department", view.department], ["Location", `${view.building}, ${view.floor}, Room ${view.room}`], ["Capacity", view.capacity], ["Type", view.lab_type], ["Responsible faculty", view.faculty_id ? facMap.get(view.faculty_id)?.name : "—"]]} />
            <h4 className="mt-4 text-sm font-semibold">Upcoming schedule ({viewBk.length})</h4>
            {viewBk.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming bookings — lab is free.</p> : (
              <div className="space-y-1.5">{viewBk.slice(0, 8).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>{fmtDate(b.booking_date)} · {t5(b.start_time)}–{t5(b.end_time)} · {b.subject} ({b.class_batch})</span><StatusBadge status={b.status} />
                </div>))}</div>
            )}
            <h4 className="mt-4 text-sm font-semibold">Equipment ({viewEq.length})</h4>
            <div className="max-h-60 overflow-y-auto rounded-md border">
              <Table><TableBody>{viewEq.map((e) => (
                <TableRow key={e.id}><TableCell className="font-mono text-xs">{e.code}</TableCell><TableCell>{e.name}</TableCell><TableCell>{e.category}</TableCell><TableCell><StatusBadge status={e.status} /></TableCell></TableRow>
              ))}</TableBody></Table>
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
