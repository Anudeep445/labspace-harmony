export type Role = "admin" | "faculty" | "student";

export const DEPARTMENTS = ["Computer Science", "Information Technology", "Data Science", "Electronics"];
export const DEPT_CODE: Record<string, string> = {
  "Computer Science": "CSE",
  "Information Technology": "IT",
  "Data Science": "DS",
  Electronics: "ECE",
};
export const BATCHES = ["CSE", "IT", "DS", "ECE"].flatMap((d) =>
  [2, 3].flatMap((y) => ["A", "B"].map((s) => `${d}-${y}${s}`)),
);
export const batchOf = (s: { department: string; year: number; section: string }) =>
  `${DEPT_CODE[s.department] ?? s.department}-${s.year}${s.section}`;

export const LAB_STATUSES = ["Available", "Occupied", "Maintenance", "Inactive"];
export const LAB_TYPES = ["Computing", "Research", "Hardware", "Networking"];
export const EQUIPMENT_STATUSES = ["Available", "In Use", "Under Maintenance", "Damaged", "Lost"];
export const EQUIPMENT_CONDITIONS = ["Excellent", "Good", "Fair", "Poor", "Damaged"];
export const BOOKING_STATUSES = ["Pending", "Approved", "Rejected", "Completed", "Cancelled"];
export const PRIORITIES = ["Low", "Medium", "High", "Critical"];
export const MAINT_STATUSES = ["Open", "Assigned", "In Progress", "Resolved", "Closed"];
export const ISSUE_TYPES = ["Hardware Fault", "Software Issue", "Physical Damage", "Power Issue", "Calibration", "Missing Part"];

export const HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
export const SLOTS = [
  ["09:00", "10:00"], ["10:00", "11:00"], ["11:00", "12:00"], ["12:00", "13:00"],
  ["14:00", "15:00"], ["15:00", "16:00"], ["16:00", "17:00"],
] as const;
export const slotLabel = (s: readonly [string, string]) => `${fmt12(s[0])}–${fmt12(s[1])}`;
export function fmt12(t: string) {
  const [h = 0, m = 0] = t.slice(0, 5).split(":").map(Number);
  const hh = h > 12 ? h - 12 : h;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export const t5 = (t: string) => t.slice(0, 5);

export function stockStatus(qty: number, min: number) {
  if (qty === 0) return "Out of Stock";
  if (qty <= min) return "Low Stock";
  return "In Stock";
}

export function hoursBetween(a: string, b: string) {
  const [ah = 0, am = 0] = a.split(":").map(Number);
  const [bh = 0, bm = 0] = b.split(":").map(Number);
  return (bh * 60 + bm - (ah * 60 + am)) / 60;
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function errMsg(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong";
}

export function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  const x = new Date(d.length === 10 ? d + "T00:00:00" : d);
  return x.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
export function includesQ(q: string, ...vals: (string | number | null | undefined)[]) {
  if (!q) return true;
  const s = q.toLowerCase();
  return vals.some((v) => v != null && String(v).toLowerCase().includes(s));
}
