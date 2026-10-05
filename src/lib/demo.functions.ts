import { createServerFn } from "@tanstack/react-start";

export const DEMO_PASSWORD = "Demo@123";

const ACCOUNTS = [
  { email: "admin@college.edu", name: "Dr. S. Venkatesh", role: "admin" as const },
  { email: "faculty@college.edu", name: "Dr. Priya Raman", role: "faculty" as const },
  { email: "student@college.edu", name: "Rohan Kapoor", role: "student" as const },
];

/** Idempotently provisions the three fixed demo accounts and links them to their records. */
export const ensureDemoUsers = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw new Error(listErr.message);

  for (const acc of ACCOUNTS) {
    let user = list.users.find((u) => u.email?.toLowerCase() === acc.email);
    let created = false;
    if (!user) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { name: acc.name },
      });
      if (error || !data.user) throw new Error(error?.message ?? "Could not create demo user");
      user = data.user;
      created = true;
    }
    const uid = user.id;
    await supabaseAdmin.from("profiles").upsert({ id: uid, name: acc.name, email: acc.email });
    await supabaseAdmin.from("user_roles").upsert({ user_id: uid, role: acc.role }, { onConflict: "user_id,role" });
    if (acc.role === "faculty") {
      await supabaseAdmin.from("faculty").update({ user_id: uid }).eq("email", acc.email);
    }
    if (acc.role === "student") {
      await supabaseAdmin.from("students").update({ user_id: uid }).eq("email", acc.email);
    }
    if (created) {
      const seed: Record<string, { title: string; message: string; type: string; is_read?: boolean }[]> = {
        admin: [
          { title: "Low inventory", message: "Ethernet Cables Cat6 — 12 left (min 20)", type: "inventory" },
          { title: "Out of stock", message: "IC 555 Timer and Ultrasonic Sensors HC-SR04 are out of stock", type: "inventory" },
          { title: "New booking request", message: "4 booking requests are awaiting your approval", type: "booking" },
          { title: "Equipment unavailable", message: "Database Server (EQ-0034) is under maintenance", type: "equipment", is_read: true },
        ],
        faculty: [
          { title: "Booking approved", message: "Computer Networks Lab today 10:00-12:00 was approved", type: "success" },
          { title: "Upcoming laboratory session", message: "CSE-3A Computer Networks practical starts at 10:00 in A-204", type: "session" },
          { title: "Maintenance request updated", message: "Cisco Router (EQ-0017) is now In Progress", type: "maintenance", is_read: true },
        ],
        student: [
          { title: "Upcoming laboratory session", message: "Computer Networks practical today 10:00-12:00 in Computer Networks Lab (A-204)", type: "session" },
          { title: "Equipment unavailable", message: "Cisco Router #2 in Computer Networks Lab is under maintenance", type: "equipment" },
          { title: "Attendance updated", message: "Your attendance for Computer Networks has been recorded", type: "info", is_read: true },
        ],
      };
      await supabaseAdmin.from("notifications").insert((seed[acc.role] ?? []).map((n) => ({ ...n, user_id: uid })));
    }
  }
  return { ok: true };
});
