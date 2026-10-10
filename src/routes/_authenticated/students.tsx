import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ConfirmAction, EmptyState, ErrorState, FilterSelect, LoadingState, PageHeader, Pager, RequireRole, SearchBox, TableWrap, Toolbar, usePaged } from "@/components/app/kit";
import { CrudDialog, DetailGrid, toForm, type FieldDef } from "@/components/app/CrudDialog";
import { byId, useAttendance, useLabs, useRefresh, useStudents, type Student } from "@/lib/data";
import { DEPARTMENTS, batchOf, includesQ } from "@/lib/constants";
import { deleteRow, nextCode, saveRow } from "@/lib/mutate";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({ meta: [{ title: "Students — LabSphere" }, { name: "description", content: "Manage student records and lab assignments." }, { property: "og:title", content: "Students — LabSphere" }, { property: "og:description", content: "Manage student records." }] }),
  component: () => <RequireRole roles={["admin"]}><StudentsPage /></RequireRole>,
});

const KEYS = ["code", "name", "roll_no", "email", "department", "year", "section", "lab_id"];

function StudentsPage() {
  const st = useStudents();
  const labs = useLabs();
  const att = useAttendance();
  const refresh = useRefresh();
  const labMap = byId(labs.data);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [year, setYear] = useState("all");
  const [sec, setSec] = useState("all");
  const [edit, setEdit] = useState<Student | null | undefined>();
  const [view, setView] = useState<Student | null>(null);
  const rows = (st.data ?? []).filter((s) => includesQ(q, s.code, s.name, s.roll_no, s.email) && (dept === "all" || s.department === dept) && (year === "all" || String(s.year) === year) && (sec === "all" || s.section === sec));
  const pg = usePaged(rows, 15);
  const labOpts = (labs.data ?? []).map((l) => ({ value: l.id, label: l.name }));
  const fields: FieldDef[] = [
    { key: "code", label: "Student ID", required: true }, { key: "name", label: "Full name", required: true },
    { key: "roll_no", label: "Roll number", required: true }, { key: "email", label: "Email", type: "email", required: true },
    { key: "department", label: "Department", type: "select", options: DEPARTMENTS, required: true },
    { key: "year", label: "Year", type: "select", options: ["1", "2", "3", "4"], required: true },
    { key: "section", label: "Section", type: "select", options: ["A", "B", "C"], required: true },
    { key: "lab_id", label: "Assigned laboratory", type: "select", options: labOpts },
  ];
  const va = view ? (att.data ?? []).filter((a) => a.student_id === view.id) : [];
  const vp = va.filter((a) => a.status === "Present").length;
  const reset = () => pg.setPage(1);

  return (
    <div>
      <PageHeader title="Students" description={`${st.data?.length ?? 0} registered students.`} actions={<Button onClick={() => setEdit(null)}><Plus className="h-4 w-4" /> Add student</Button>} />
      <Toolbar>
        <SearchBox value={q} onChange={(v) => { setQ(v); reset(); }} placeholder="Search name, roll no, email…" />
        <FilterSelect value={dept} onChange={(v) => { setDept(v); reset(); }} options={DEPARTMENTS} placeholder="All departments" />
        <FilterSelect value={year} onChange={(v) => { setYear(v); reset(); }} options={["1", "2", "3", "4"].map((y) => ({ value: y, label: `Year ${y}` }))} placeholder="All years" />
        <FilterSelect value={sec} onChange={(v) => { setSec(v); reset(); }} options={["A", "B", "C"].map((y) => ({ value: y, label: `Section ${y}` }))} placeholder="All sections" />
      </Toolbar>
      <TableWrap>
        {st.isLoading ? <LoadingState /> : st.error ? <ErrorState error={st.error} onRetry={() => st.refetch()} /> : rows.length === 0 ? <EmptyState title="No students found" /> : (<>
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Roll no</TableHead><TableHead>Department</TableHead><TableHead>Class</TableHead><TableHead>Email</TableHead><TableHead>Lab</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{pg.slice.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.code}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{s.name}</TableCell>
                <TableCell className="font-mono text-xs">{s.roll_no}</TableCell>
                <TableCell className="whitespace-nowrap">{s.department}</TableCell>
                <TableCell>{batchOf(s)}</TableCell>
                <TableCell className="text-sm">{s.email}</TableCell>
                <TableCell className="whitespace-nowrap">{s.lab_id ? labMap.get(s.lab_id)?.name : "—"}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => setView(s)} aria-label="View"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setEdit(s)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <ConfirmAction title={`Delete ${s.name}?`} description="The student's attendance records will also be deleted."
                    onConfirm={async () => { try { await deleteRow("students", s.id); toast.success("Student deleted"); refresh(); } catch (e) { toast.error((e as Error).message); } }}
                    trigger={<Button variant="ghost" size="icon" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>} />
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
          <Pager {...pg} />
        </>)}
      </TableWrap>
      <CrudDialog open={edit !== undefined} onOpenChange={(o) => !o && setEdit(undefined)} title={edit ? "Edit student" : "Add student"} fields={fields}
        initial={edit ? toForm(edit, KEYS) : { ...toForm(null, KEYS), code: nextCode("STU", st.data ?? [], 4), year: "2", section: "A" }}
        onSubmit={async (v) => { await saveRow("students", edit?.id ?? null, v); toast.success(edit ? "Student updated" : "Student added"); refresh(); }} />
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          {view && <>
            <DialogHeader><DialogTitle>{view.name}</DialogTitle></DialogHeader>
            <DetailGrid items={[["Student ID", view.code], ["Roll number", view.roll_no], ["Department", view.department], ["Class", batchOf(view)], ["Email", view.email], ["Assigned lab", view.lab_id ? labMap.get(view.lab_id)?.name : "—"], ["Login account", view.user_id ? "Linked" : "Not linked"]]} />
            <div className="mt-2">
              <p className="text-sm font-medium">Lab attendance: {vp}/{va.length} sessions ({va.length ? Math.round((vp / va.length) * 100) : 0}%)</p>
              <Progress value={va.length ? (vp / va.length) * 100 : 0} className="mt-2" />
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
