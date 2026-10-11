import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, FilterSelect, LoadingState, PageHeader, Toolbar } from "@/components/app/kit";
import { byId, useBookings, useFaculty, useLabs } from "@/lib/data";
import { useMe } from "@/lib/auth";
import { BATCHES, DEPARTMENTS, SLOTS, batchOf, slotLabel, t5, toISO, todayISO } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/timetable")({
  head: () => ({ meta: [{ title: "Timetable — LabSphere" }, { name: "description", content: "Weekly laboratory timetable of approved sessions." }, { property: "og:title", content: "Timetable — LabSphere" }, { property: "og:description", content: "Weekly laboratory timetable." }] }),
  component: TimetablePage,
});

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function mondayOf(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function TimetablePage() {
  const me = useMe();
  const bk = useBookings();
  const labs = useLabs();
  const fac = useFaculty();
  const labMap = byId(labs.data);
  const facMap = byId(fac.data);
  const [date, setDate] = useState(todayISO());
  const [lab, setLab] = useState("all");
  const [faculty, setFaculty] = useState(me.role === "faculty" && me.faculty ? me.faculty.id : "all");
  const [dept, setDept] = useState("all");
  const [cls, setCls] = useState(me.student ? batchOf(me.student) : "all");

  const mon = mondayOf(date);
  const days = DAYS.map((_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return toISO(d); });
  const shift = (n: number) => { const d = new Date(mon); d.setDate(d.getDate() + n); setDate(toISO(d)); };

  const rows = (bk.data ?? []).filter((b) => ["Approved", "Completed"].includes(b.status) && days.includes(b.booking_date) &&
    (lab === "all" || b.lab_id === lab) && (faculty === "all" || b.faculty_id === faculty) && (cls === "all" || b.class_batch === cls) &&
    (dept === "all" || labMap.get(b.lab_id)?.department === dept));

  return (
    <div>
      <PageHeader title="Laboratory Timetable" description="Approved laboratory sessions for the selected week (Monday–Saturday)." />
      <Toolbar>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => shift(-7)} aria-label="Previous week"><ChevronLeft className="h-4 w-4" /></Button>
          <Input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="w-40 bg-card" />
          <Button variant="outline" size="icon" onClick={() => shift(7)} aria-label="Next week"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => setDate(todayISO())}>This week</Button>
        </div>
        <FilterSelect value={lab} onChange={setLab} options={(labs.data ?? []).map((l) => ({ value: l.id, label: l.name }))} placeholder="All laboratories" />
        <FilterSelect value={faculty} onChange={setFaculty} options={(fac.data ?? []).map((f) => ({ value: f.id, label: f.name }))} placeholder="All faculty" />
        <FilterSelect value={dept} onChange={setDept} options={DEPARTMENTS} placeholder="All departments" />
        <FilterSelect value={cls} onChange={setCls} options={BATCHES} placeholder="All classes" />
      </Toolbar>
      {bk.isLoading ? <LoadingState /> : bk.error ? <ErrorState error={bk.error} onRetry={() => bk.refetch()} /> : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th className="w-28 border-b px-3 py-2 text-left font-medium text-muted-foreground">Time</th>
                {DAYS.map((d, i) => (
                  <th key={d} className={`border-b border-l px-3 py-2 text-left font-medium ${days[i] === todayISO() ? "bg-primary/10 text-primary" : ""}`}>
                    {d}<div className="text-xs font-normal text-muted-foreground">{new Date(days[i] + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((s) => (
                <tr key={s[0]}>
                  <td className="border-b px-3 py-2 align-top text-xs font-medium text-muted-foreground whitespace-nowrap">{slotLabel(s)}</td>
                  {days.map((day) => {
                    const cell = rows.filter((b) => b.booking_date === day && t5(b.start_time) < s[1] && s[0] < t5(b.end_time));
                    return (
                      <td key={day} className="h-16 border-b border-l p-1 align-top">
                        {cell.map((b) => (
                          <div key={b.id} className="mb-1 rounded-md border-l-2 border-primary bg-primary/8 px-2 py-1 text-xs">
                            <p className="font-semibold text-foreground">{b.subject}</p>
                            <p className="text-muted-foreground">{labMap.get(b.lab_id)?.name}</p>
                            <p className="text-muted-foreground">{facMap.get(b.faculty_id)?.name} · {b.class_batch}</p>
                            <p className="text-muted-foreground">{t5(b.start_time)}–{t5(b.end_time)}</p>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No approved sessions this week for the selected filters.</p>}
        </div>
      )}
    </div>
  );
}
