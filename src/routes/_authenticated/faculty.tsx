import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmAction, EmptyState, ErrorState, FilterSelect, LoadingState, PageHeader, RequireRole, SearchBox, TableWrap, Toolbar } from "@/components/app/kit";
import { CrudDialog, DetailGrid, toForm, type FieldDef } from "@/components/app/CrudDialog";
import { byId, useBookings, useFaculty, useLabs, useRefresh, type Faculty } from "@/lib/data";
import { DEPARTMENTS, includesQ } from "@/lib/constants";
import { deleteRow, nextCode, saveRow } from "@/lib/mutate";

export const Route = createFileRoute("/_authenticated/faculty")({
  head: () => ({ meta: [{ title: "Faculty — LabSphere" }, { name: "description", content: "Manage faculty members and lab assignments." }, { property: "og:title", content: "Faculty — LabSphere" }, { property: "og:description", content: "Manage faculty members." }] }),
  component: () => <RequireRole roles={["admin"]}><FacultyPage /></RequireRole>,
});

const KEYS = ["code", "name", "department", "email", "phone", "specialization", "assigned_lab_id"];

function FacultyPage() {
  const fac = useFaculty();
  const labs = useLabs();
  const bk = useBookings();
  const refresh = useRefresh();
  const labMap = byId(labs.data);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [lab, setLab] = useState("all");
  const [edit, setEdit] = useState<Faculty | null | undefined>();
  const [view, setView] = useState<Faculty | null>(null);
  const labOpts = (labs.data ?? []).map((l) => ({ value: l.id, label: l.name }));
  const rows = (fac.data ?? []).filter((f) => includesQ(q, f.code, f.name, f.email, f.specialization) && (dept === "all" || f.department === dept) && (lab === "all" || f.assigned_lab_id === lab));
  const fields: FieldDef[] = [
    { key: "code", label: "Faculty ID", required: true }, { key: "name", label: "Full name", required: true },
    { key: "department", label: "Department", type: "select", options: DEPARTMENTS, required: true },
    { key: "email", label: "Email", type: "email", required: true }, { key: "phone", label: "Phone" },
    { key: "specialization", label: "Specialization" },
    { key: "assigned_lab_id", label: "Assigned laboratory", type: "select", options: labOpts, full: true },
  ];
  return (
    <div>
      <PageHeader title="Faculty" description={`${fac.data?.length ?? 0} faculty members.`} actions={<Button onClick={() => setEdit(null)}><Plus className="h-4 w-4" /> Add faculty</Button>} />
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search name, email, specialization…" />
        <FilterSelect value={dept} onChange={setDept} options={DEPARTMENTS} placeholder="All departments" />
        <FilterSelect value={lab} onChange={setLab} options={labOpts} placeholder="All laboratories" />
      </Toolbar>
      <TableWrap>
        {fac.isLoading ? <LoadingState /> : fac.error ? <ErrorState error={fac.error} onRetry={() => fac.refetch()} /> : rows.length === 0 ? <EmptyState title="No faculty found" /> : (
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Specialization</TableHead><TableHead>Lab</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-mono text-xs">{f.code}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{f.name}</TableCell>
                <TableCell className="whitespace-nowrap">{f.department}</TableCell>
                <TableCell className="text-sm">{f.email}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{f.phone}</TableCell>
                <TableCell>{f.specialization}</TableCell>
                <TableCell className="whitespace-nowrap">{f.assigned_lab_id ? labMap.get(f.assigned_lab_id)?.name : "—"}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => setView(f)} aria-label="View"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setEdit(f)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <ConfirmAction title={`Delete ${f.name}?`} description="All bookings made by this faculty member will also be deleted."
                    onConfirm={async () => { try { await deleteRow("faculty", f.id); toast.success("Faculty deleted"); refresh(); } catch (e) { toast.error((e as Error).message); } }}
                    trigger={<Button variant="ghost" size="icon" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>} />
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </TableWrap>
      <CrudDialog open={edit !== undefined} onOpenChange={(o) => !o && setEdit(undefined)} title={edit ? "Edit faculty" : "Add faculty"} fields={fields}
        initial={edit ? toForm(edit, KEYS) : { ...toForm(null, KEYS), code: nextCode("FAC", fac.data ?? []) }}
        onSubmit={async (v) => { await saveRow("faculty", edit?.id ?? null, v); toast.success(edit ? "Faculty updated" : "Faculty added"); refresh(); }} />
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          {view && <>
            <DialogHeader><DialogTitle>{view.name}</DialogTitle></DialogHeader>
            <DetailGrid items={[["Faculty ID", view.code], ["Department", view.department], ["Email", view.email], ["Phone", view.phone], ["Specialization", view.specialization], ["Assigned lab", view.assigned_lab_id ? labMap.get(view.assigned_lab_id)?.name : "—"],
              ["Total bookings", (bk.data ?? []).filter((b) => b.faculty_id === view.id).length], ["Login account", view.user_id ? "Linked" : "Not linked"]]} />
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
