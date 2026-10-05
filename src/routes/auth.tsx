import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { BookOpenCheck, CalendarClock, GraduationCap, Loader2, ShieldCheck, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/app/Logo";
import { Field } from "@/components/app/kit";
import { DEMO_PASSWORD, ensureDemoUsers } from "@/lib/demo.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LabSphere" },
      { name: "description", content: "Sign in to LabSphere, the college laboratory management system." },
      { property: "og:title", content: "Sign in — LabSphere" },
      { property: "og:description", content: "Access your LabSphere admin, faculty or student dashboard." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const DEMOS = [
  { role: "Admin", email: "admin@college.edu", icon: ShieldCheck },
  { role: "Faculty", email: "faculty@college.edu", icon: BookOpenCheck },
  { role: "Student", email: "student@college.edu", icon: GraduationCap },
];

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string | undefined; password?: string | undefined }>({});
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    ensureDemoUsers().then(() => setReady(true)).catch(() => setReady(true));
  }, [navigate]);

  async function signIn(e?: React.FormEvent, override?: { email: string; password: string }) {
    e?.preventDefault();
    const parsed = schema.safeParse(override ?? { email, password });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors({ email: fe.email?.[0], password: fe.password?.[0] });
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password" : error.message);
      return;
    }
    if (remember) localStorage.removeItem("clms-session-only");
    else localStorage.setItem("clms-session-only", "1");
    toast.success("Welcome to LabSphere");
    navigate({ to: "/dashboard", replace: true });
  }

  async function sendReset() {
    const r = z.string().trim().email().safeParse(forgotEmail);
    if (!r.success) { toast.error("Enter a valid email address"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(r.data, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) { toast.error(error.message); return; }
    toast.success("If that account exists, a reset link has been sent.");
    setForgotOpen(false);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Logo light />
        <div>
          <h2 className="max-w-md text-3xl font-bold text-sidebar-accent-foreground">
            One place for every laboratory on campus.
          </h2>
          <p className="mt-3 max-w-md text-sidebar-foreground/80">
            Book lab sessions, track equipment, record practical attendance and resolve maintenance issues — for admins, faculty and students.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-2 gap-3 text-sm">
            {[[CalendarClock, "Conflict-free bookings"], [Wrench, "Maintenance workflow"], [BookOpenCheck, "Lab attendance"], [ShieldCheck, "Role-based access"]].map(([I, t]) => {
              const Icon = I as typeof Wrench;
              return (
                <div key={t as string} className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2.5">
                  <Icon className="h-4 w-4 text-sidebar-primary" /> {t as string}
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/60">© {new Date().getFullYear()} LabSphere · College case-study project</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Logo className="mb-8 lg:hidden" />
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your college email to access your dashboard.</p>

          <form onSubmit={signIn} className="mt-6 space-y-4" noValidate>
            <Field label="Email" error={errors.email}>
              <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@college.edu" />
            </Field>
            <Field label="Password" error={errors.password}>
              <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} /> Remember me
              </label>
              <button type="button" className="text-sm font-medium text-primary hover:underline" onClick={() => { setForgotEmail(email); setForgotOpen(true); }}>
                Forgot password?
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Login
            </Button>
          </form>

          <div className="mt-8 rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold">Demo accounts</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Password for all: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">{DEMO_PASSWORD}</code>
              {!ready && " · preparing…"}
            </p>
            <div className="space-y-2">
              {DEMOS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  disabled={!ready || busy}
                  onClick={() => { setEmail(d.email); setPassword(DEMO_PASSWORD); signIn(undefined, { email: d.email, password: DEMO_PASSWORD }); }}
                  className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-50"
                >
                  <d.icon className="h-4 w-4 text-primary" />
                  <span className="w-16 font-medium">{d.role}</span>
                  <span className="truncate text-muted-foreground">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>We'll email you a link to set a new password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="name@college.edu" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>Cancel</Button>
            <Button onClick={sendReset}>Send reset link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
