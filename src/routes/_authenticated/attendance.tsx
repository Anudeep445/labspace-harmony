import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState, Field, LoadingState, PageHeader, Panel, SelectInput, StatCard, StatusBadge, TableWrap } from "@/components/app/kit";
import { byId, useAttendance, useBookings, useLabs, useRefresh, useStudents } from "@/lib/data";
import { useMe } from "@/lib/auth";
import { BATCHES, batchOf, fmtDate, todayISO } from "@/lib/constants";
import { CalendarCheck, CheckCircle2, Percent, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({ meta: [{ title: "Attendance — LabSphere" }, { name: "description", content: "Laboratory practical attendance." }, { property: "og:title", content: "Attendance — LabSphere" }, { property: "og:description", content: "Laboratory practical attendance." }] }),
  component: AttendancePage,
});

const pct = (p: number, t: number) => (t ? Math.round((p / t) * 100) : 0);

function AttendancePage() {
  const me = useMe();
  if (me.role === "student") return <MyAttendance />;
  return (
    <div>
      <PageHeader title="Laboratory Attendance" description="Mark practical attendance and review attendance statistics." />
      <Tabs defaultValue="mark">
        <TabsList><TabsTrigger value="mark">Mark attendance</TabsTrigger><TabsTrigger value="stats">Statistics</TabsTrigger></TabsList>
        <TabsContent value="mark"><MarkAttendance /></TabsContent>
        <TabsContent value="stats"><AttendanceStats /></TabsContent>
      </Tabs>
    </div>
  );
}

function MarkAttendance() {
  const me = useMe();
  const labs = useLabs();
  const st = useStudents();
  const bk = useBookings();
  const refresh = useRefresh();
  const [lab, setLab] = useState(me.faculty?.assigned_lab_id ?? "");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(todayISO());
  const [cls, setCls] = useState("");
  const [marks, setMarks] = useState<Record<string, "Present" | "Absent">>({});
  const [busy, setBusy] = useState(false);
  const students = useMemo(() => (st.data ?? []).filter((s) => cls && batchOf(s) === cls), [st.data, cls]);
  const ready = lab && subject.trim() && date && cls;

  // Sessions for quick-fill: this faculty's approved/completed bookings
  const sessions = (bk.data ?? []).filter((b) => ["Approved", "Completed"].includes(b.status) && (me.role === "admin" || b.faculty_id === me.faculty?.id) && b.booking_date <= todayISO()).slice(0, 15);

  useEffect(() => {
    if (!ready) return;
    supabase.from("attendance").select("student_id,status").eq("lab_id", lab).eq("subject", subject.trim()).eq("att_date", date).eq("class_batch", cls)
      .then(({ data }) => {
        const m: Record<string, "Present" | "Absent"> = {};
        students.forEach((s) => { m[s.id] = "Present"; });
        data?.forEach((r) => { m[r.student_id] = r.status as "Present" | "Absent"; });
        setMarks(m);
      });
  }, [lab, subject, date, cls, students.length]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    if (!ready) { toast.error("Select laboratory, subject, date and class"); return; }
    if (date > todayISO()) { toast.error("Attendance cannot be recorded for a future date"); return; }
    setBusy(true);
    const rows = students.map((s) => ({ student_id: s.id, lab_id: lab, subject: subject.trim(), att_date: date, class_batch: cls, status: marks[s.id] ?? "Present", faculty_id: me.faculty?.id ?? null }));
    const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,lab_id,subject,att_date" });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Attendance saved for ${rows.length} students`);
    refresh();
  }
  const present = students.filter((s) => (marks[s.id] ?? "Present") === "Present").length;

  return (
    <div className="space-y-4">
      <Panel title="Session">
        {sessions.length > 0 && (
          <div className="mb-4">
            <p className="mb-1.5 text-xs text-muted-foreground">Fill from a session</p>
            <div className="flex flex-wrap gap-2">{sessions.map((b) => (
              <button key={b.id} type="button" onClick={() => { setLab(b.lab_id); setSubject(b.subject); setDate(b.booking_date); setCls(b.class_batch); }}
                className="rounded-md border px-2.5 py-1 text-xs hover:border-primary/40 hover:bg-accent">{fmtDate(b.booking_date)} · {b.subject} · {b.class_batch}</button>
            ))}</div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Laboratory"><SelectInput value={lab} onChange={setLab} options={(labs.data ?? []).map((l) => ({ value: l.id, label: l.name }))} /></Field>
          <Field label="Subject"><Input value={subject} maxLength={100} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Computer Networks" /></Field>
          <Field label="Date"><Input type="date" max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Class / batch"><SelectInput value={cls} onChange={setCls} options={BATCHES} /></Field>
        </div>
      </Panel>
      {!ready ? <EmptyState title="Select a session" description="Choose laboratory, subject, date and class to load the student list." /> : st.isLoading ? <LoadingState /> : students.length === 0 ? <EmptyState title="No students in this class" /> : (
        <TableWrap>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <p className="text-sm"><span className="font-semibold">{present}</span> present · <span className="font-semibold">{students.length - present}</span> absent</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setMarks(Object.fromEntries(students.map((s) => [s.id, "Present"])))}>All present</Button>
              <Button size="sm" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save attendance</Button>
            </div>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Roll no</TableHead><TableHead>Name</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
            <TableBody>{students.map((s) => {
              const v = marks[s.id] ?? "Present";
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.roll_no}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex rounded-md border p-0.5">
                      {(["Present", "Absent"] as const).map((o) => (
                        <button key={o} type="button" onClick={() => setMarks({ ...marks, [s.id]: o })}
                          className={`rounded px-3 py-1 text-xs font-medium ${v === o ? (o === "Present" ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground") : "text-muted-foreground"}`}>{o}</button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}

function AttendanceStats() {
  const att = useAttendance();
  const st = useStudents();
  const [cls, setCls] = useState("CSE-3A");
  const stuMap = byId(st.data);
  const rows = useMemo(() => {
    const m = new Map<string, { p: number; t: number }>();
    (att.data ?? []).filter((a) => a.class_batch === cls).forEach((a) => {
      const r = m.get(a.student_id) ?? { p: 0, t: 0 };
      r.t++; if (a.status === "Present") r.p++;
      m.set(a.student_id, r);
    });
    return [...m.entries()].map(([id, r]) => ({ s: stuMap.get(id), ...r })).filter((r) => r.s).sort((a, b) => a.s!.roll_no.localeCompare(b.s!.roll_no));
  }, [att.data, cls, stuMap]);
  const sessions = new Set((att.data ?? []).filter((a) => a.class_batch === cls).map((a) => a.att_date + a.subject)).size;
  const tp = rows.reduce((s, r) => s + r.p, 0), tt = rows.reduce((s, r) => s + r.t, 0);
  return (
    <div className="space-y-4">
      <div className="w-56"><Field label="Class / batch"><SelectInput value={cls} onChange={setCls} options={BATCHES} /></Field></div>
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total sessions" value={sessions} icon={CalendarCheck} />
        <StatCard label="Present marks" value={tp} icon={CheckCircle2} tone="success" />
        <StatCard label="Absent marks" value={tt - tp} icon={XCircle} tone="danger" />
        <StatCard label="Average attendance" value={`${pct(tp, tt)}%`} icon={Percent} tone="info" />
      </div>
      {att.isLoading ? <LoadingState /> : att.error ? <ErrorState error={att.error} /> : rows.length === 0 ? <EmptyState title="No attendance recorded for this class" /> : (
        <TableWrap>
          <Table>
            <TableHeader><TableRow><TableHead>Roll no</TableHead><TableHead>Name</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead className="w-64">Attendance</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((r) => (
              <TableRow key={r.s!.id}>
                <TableCell className="font-mono text-xs">{r.s!.roll_no}</TableCell><TableCell>{r.s!.name}</TableCell><TableCell>{r.p}</TableCell><TableCell>{r.t - r.p}</TableCell>
                <TableCell><div className="flex items-center gap-2"><Progress value={pct(r.p, r.t)} className="h-2" /><span className="w-10 text-right text-xs font-medium">{pct(r.p, r.t)}%</span></div></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}

function MyAttendance() {
  const me = useMe();
  const att = useAttendance(); // RLS returns only this student's rows
  const labs = useLabs();
  const labMap = byId(labs.data);
  const mine = (att.data ?? []).filter((a) => a.student_id === me.student?.id);
  const p = mine.filter((a) => a.status === "Present").length;
  const bySubject = new Map<string, { p: number; t: number }>();
  mine.forEach((a) => { const r = bySubject.get(a.subject) ?? { p: 0, t: 0 }; r.t++; if (a.status === "Present") r.p++; bySubject.set(a.subject, r); });
  if (!me.student) return <div><PageHeader title="My Attendance" /><EmptyState title="No student record linked to your account" /></div>;
  return (
    <div>
      <PageHeader title="My Attendance" description={`${me.student.name} · ${me.student.roll_no} · ${batchOf(me.student)}`} />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total sessions" value={mine.length} icon={CalendarCheck} />
        <StatCard label="Present" value={p} icon={CheckCircle2} tone="success" />
        <StatCard label="Absent" value={mine.length - p} icon={XCircle} tone="danger" />
        <StatCard label="Attendance" value={`${pct(p, mine.length)}%`} icon={Percent} tone={pct(p, mine.length) < 75 ? "warning" : "info"} hint={pct(p, mine.length) < 75 ? "Below the 75% requirement" : "Meets the 75% requirement"} />
      </div>
      {att.isLoading ? <LoadingState /> : att.error ? <ErrorState error={att.error} /> : mine.length === 0 ? <EmptyState title="No attendance recorded yet" /> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="By subject">
            <div className="space-y-4">{[...bySubject.entries()].map(([s, r]) => (
              <div key={s}><div className="mb-1 flex justify-between text-sm"><span className="font-medium">{s}</span><span className="text-muted-foreground">{r.p}/{r.t} · {pct(r.p, r.t)}%</span></div><Progress value={pct(r.p, r.t)} /></div>
            ))}</div>
          </Panel>
          <Panel title="Session history">
            <div className="space-y-2">{mine.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{fmtDate(a.att_date)} · {a.subject} <span className="text-muted-foreground">({labMap.get(a.lab_id)?.name})</span></span><StatusBadge status={a.status} />
              </div>
            ))}</div>
          </Panel>
        </div>
      )}
    </div>
  );
}
