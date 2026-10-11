import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Eye, Loader2, X, CheckCheck, Ban } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmAction, EmptyState, ErrorState, Field, FilterSelect, LoadingState, PageHeader, Pager, Panel, RequireRole, SearchBox, SelectInput, StatusBadge, TableWrap, Toolbar, usePaged } from "@/components/app/kit";
import { DetailGrid } from "@/components/app/CrudDialog";
import { byId, useBookings, useFaculty, useLabs, useRefresh, type Booking } from "@/lib/data";
import { useMe } from "@/lib/auth";
import { BATCHES, BOOKING_STATUSES, HOURS, errMsg, fmtDate, includesQ, t5, todayISO } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({ meta: [{ title: "Bookings — LabSphere" }, { name: "description", content: "Request, approve and track laboratory bookings." }, { property: "og:title", content: "Bookings — LabSphere" }, { property: "og:description", content: "Laboratory booking requests and approvals." }] }),
  component: () => <RequireRole roles={["admin", "faculty"]}><BookingsPage /></RequireRole>,
});

async function setStatus(b: Booking, status: string, admin_note?: string) {
  const { error } = await supabase.from("bookings").update({ status, ...(admin_note !== undefined ? { admin_note: admin_note || null } : {}) }).eq("id", b.id);
  if (error) throw new Error(error.message);
}

function BookingsPage() {
  const me = useMe();
  const isAdmin = me.role === "admin";
  const bk = useBookings();
  const labs = useLabs();
  const fac = useFaculty();
  const refresh = useRefresh();
  const labMap = byId(labs.data);
  const facMap = byId(fac.data);
  const [q, setQ] = useState("");
  const [st, setSt] = useState(isAdmin ? "Pending" : "all");
  const [lab, setLab] = useState("all");
  const [view, setView] = useState<Booking | null>(null);
  const [reject, setReject] = useState<Booking | null>(null);
  const [note, setNote] = useState("");

  const mine = isAdmin ? bk.data ?? [] : (bk.data ?? []).filter((b) => b.faculty_id === me.faculty?.id);
  const rows = mine.filter((b) => (st === "all" || b.status === st) && (lab === "all" || b.lab_id === lab) &&
    includesQ(q, b.subject, b.class_batch, b.purpose, facMap.get(b.faculty_id)?.name, labMap.get(b.lab_id)?.name));
  const pg = usePaged(rows, 12);
  const labOpts = (labs.data ?? []).map((l) => ({ value: l.id, label: l.name }));
  const pending = (bk.data ?? []).filter((b) => b.status === "Pending").length;

  async function act(fn: () => Promise<void>, msg: string) {
    try { await fn(); toast.success(msg); refresh(); } catch (e) { toast.error(errMsg(e)); }
  }

  return (
    <div>
      <PageHeader title={isAdmin ? "Bookings" : "Book Laboratory"}
        description={isAdmin ? `${pending} request${pending === 1 ? "" : "s"} awaiting approval. Approved bookings appear on the timetable.` : "Check availability, request a lab slot and track your requests."} />
      {!isAdmin && (me.faculty ? <BookingForm facultyId={me.faculty.id} onDone={refresh} /> :
        <Panel className="mb-6"><p className="text-sm text-muted-foreground">Your account is not linked to a faculty record, so you can't request bookings.</p></Panel>)}
      <h2 className="mb-3 mt-2 text-base font-semibold">{isAdmin ? "All booking requests" : "My booking history"}</h2>
      <Toolbar>
        <SearchBox value={q} onChange={(v) => { setQ(v); pg.setPage(1); }} placeholder="Search subject, class, faculty…" />
        <FilterSelect value={st} onChange={(v) => { setSt(v); pg.setPage(1); }} options={BOOKING_STATUSES} placeholder="All statuses" />
        <FilterSelect value={lab} onChange={(v) => { setLab(v); pg.setPage(1); }} options={labOpts} placeholder="All laboratories" />
      </Toolbar>
      <TableWrap>
        {bk.isLoading ? <LoadingState /> : bk.error ? <ErrorState error={bk.error} onRetry={() => bk.refetch()} /> : rows.length === 0 ? <EmptyState title="No bookings found" description="Try a different status filter." /> : (<>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Laboratory</TableHead><TableHead>Subject</TableHead><TableHead>Class</TableHead>{isAdmin && <TableHead>Faculty</TableHead>}<TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{pg.slice.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="whitespace-nowrap">{fmtDate(b.booking_date)}</TableCell>
                <TableCell className="whitespace-nowrap">{t5(b.start_time)}–{t5(b.end_time)}</TableCell>
                <TableCell className="whitespace-nowrap">{labMap.get(b.lab_id)?.name}</TableCell>
                <TableCell>{b.subject}</TableCell>
                <TableCell>{b.class_batch}</TableCell>
                {isAdmin && <TableCell className="whitespace-nowrap">{facMap.get(b.faculty_id)?.name}</TableCell>}
                <TableCell><StatusBadge status={b.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button variant="ghost" size="icon" onClick={() => setView(b)} aria-label="View"><Eye className="h-4 w-4" /></Button>
                  {isAdmin && b.status === "Pending" && <>
                    <Button variant="ghost" size="icon" aria-label="Approve" onClick={() => act(() => setStatus(b, "Approved"), "Booking approved")}><Check className="h-4 w-4 text-success" /></Button>
                    <Button variant="ghost" size="icon" aria-label="Reject" onClick={() => { setNote(""); setReject(b); }}><X className="h-4 w-4 text-destructive" /></Button>
                  </>}
                  {isAdmin && b.status === "Approved" && b.booking_date <= todayISO() &&
                    <Button variant="ghost" size="icon" aria-label="Mark completed" onClick={() => act(() => setStatus(b, "Completed"), "Marked completed")}><CheckCheck className="h-4 w-4" /></Button>}
                  {!isAdmin && b.status === "Pending" &&
                    <ConfirmAction title="Cancel this request?" description="The slot will be released for others." confirmLabel="Cancel request"
                      onConfirm={() => act(() => setStatus(b, "Cancelled"), "Request cancelled")}
                      trigger={<Button variant="ghost" size="icon" aria-label="Cancel"><Ban className="h-4 w-4 text-destructive" /></Button>} />}
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
          <Pager {...pg} />
        </>)}
      </TableWrap>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          {view && <>
            <DialogHeader><DialogTitle>Booking details</DialogTitle></DialogHeader>
            <DetailGrid items={[["Laboratory", labMap.get(view.lab_id)?.name], ["Faculty", facMap.get(view.faculty_id)?.name], ["Date", fmtDate(view.booking_date)], ["Time", `${t5(view.start_time)}–${t5(view.end_time)}`], ["Subject", view.subject], ["Class / batch", view.class_batch], ["Purpose", view.purpose], ["Status", <StatusBadge key="s" status={view.status} />], ["Admin note", view.admin_note], ["Requested", fmtDate(view.created_at)]]} />
          </>}
        </DialogContent>
      </Dialog>

      <Dialog open={!!reject} onOpenChange={(o) => !o && setReject(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject booking request</DialogTitle></DialogHeader>
          <Field label="Reason (sent to the faculty member)"><Textarea value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Lab reserved for exams" /></Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReject(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { if (reject) { await act(() => setStatus(reject, "Rejected", note.trim()), "Booking rejected"); setReject(null); } }}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingForm({ facultyId, onDone }: { facultyId: string; onDone: () => void }) {
  const labs = useLabs();
  const bk = useBookings();
  const [f, setF] = useState({ lab_id: "", booking_date: todayISO(), start_time: "", end_time: "", subject: "", class_batch: "", purpose: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const lab = labs.data?.find((l) => l.id === f.lab_id);
  const dayBookings = (bk.data ?? []).filter((b) => b.lab_id === f.lab_id && b.booking_date === f.booking_date && ["Approved", "Pending"].includes(b.status))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const clash = f.start_time && f.end_time ? dayBookings.find((b) => t5(b.start_time) < f.end_time && f.start_time < t5(b.end_time)) : undefined;
  const unavailable = lab && ["Maintenance", "Inactive"].includes(lab.status);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.lab_id) er["lab_id"] = "Select a laboratory";
    if (!f.booking_date) er["booking_date"] = "Select a date";
    else if (f.booking_date < todayISO()) er["booking_date"] = "Date cannot be in the past";
    if (!f.start_time) er["start_time"] = "Select a start time";
    if (!f.end_time) er["end_time"] = "Select an end time";
    else if (f.start_time && f.end_time <= f.start_time) er["end_time"] = "End time must be after start time";
    if (!f.subject.trim()) er["subject"] = "Subject is required";
    if (!f.class_batch) er["class_batch"] = "Select a class";
    if (f.purpose.length > 300) er["purpose"] = "Keep it under 300 characters";
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    const { error } = await supabase.from("bookings").insert({ ...f, subject: f.subject.trim(), purpose: f.purpose.trim() || null, faculty_id: facultyId, status: "Pending" });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking request submitted — status: Pending");
    setF({ ...f, start_time: "", end_time: "", subject: "", purpose: "" });
    onDone();
  }

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-3">
      <Panel title="New booking request" description="Requests are reviewed by the lab administrator." className="lg:col-span-2">
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Laboratory *" error={errs["lab_id"]}><SelectInput value={f.lab_id} onChange={set("lab_id")} options={(labs.data ?? []).map((l) => ({ value: l.id, label: `${l.name} (${l.status})` }))} /></Field>
          <Field label="Date *" error={errs["booking_date"]}><Input type="date" min={todayISO()} value={f.booking_date} onChange={(e) => set("booking_date")(e.target.value)} /></Field>
          <Field label="Start time *" error={errs["start_time"]}><SelectInput value={f.start_time} onChange={set("start_time")} options={HOURS.slice(0, -1)} /></Field>
          <Field label="End time *" error={errs["end_time"]}><SelectInput value={f.end_time} onChange={set("end_time")} options={HOURS.slice(1)} /></Field>
          <Field label="Subject *" error={errs["subject"]}><Input value={f.subject} maxLength={100} onChange={(e) => set("subject")(e.target.value)} placeholder="e.g. Computer Networks" /></Field>
          <Field label="Class / batch *" error={errs["class_batch"]}><SelectInput value={f.class_batch} onChange={set("class_batch")} options={BATCHES} /></Field>
          <Field label="Purpose" error={errs["purpose"]} className="sm:col-span-2"><Textarea rows={2} value={f.purpose} onChange={(e) => set("purpose")(e.target.value)} placeholder="Practical / experiment details" /></Field>
          {unavailable && <p className="text-sm text-destructive sm:col-span-2">This lab is currently {lab?.status.toLowerCase()} and cannot be booked.</p>}
          {clash && <p className="text-sm text-destructive sm:col-span-2">Conflict: already {clash.status.toLowerCase()} {t5(clash.start_time)}–{t5(clash.end_time)} ({clash.subject}).</p>}
          <div className="sm:col-span-2"><Button type="submit" disabled={busy || !!clash || !!unavailable}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Submit request</Button></div>
        </form>
      </Panel>
      <Panel title="Availability" description={lab ? `${lab.name} · ${fmtDate(f.booking_date)}` : "Select a lab and date"}>
        {!lab ? <p className="text-sm text-muted-foreground">Choose a laboratory to see booked slots.</p> : (
          <div className="space-y-1.5">
            {HOURS.slice(0, -1).filter((h) => h !== "13:00").map((h) => {
              const end = `${String(Number(h.slice(0, 2)) + 1).padStart(2, "0")}:00`;
              const b = dayBookings.find((x) => t5(x.start_time) < end && h < t5(x.end_time));
              return (
                <div key={h} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                  <span>{h}–{end}</span>
                  {b ? <span className="flex items-center gap-2 truncate"><span className="truncate text-xs text-muted-foreground">{b.subject}</span><StatusBadge status={b.status === "Approved" ? "Occupied" : "Pending"} /></span> : <StatusBadge status="Available" />}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
