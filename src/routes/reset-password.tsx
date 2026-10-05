import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/app/Logo";
import { Field } from "@/components/app/kit";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — LabSphere" },
      { name: "description", content: "Choose a new password for your LabSphere account." },
      { property: "og:title", content: "Reset password — LabSphere" },
      { property: "og:description", content: "Choose a new password for your LabSphere account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setErr("Use at least 8 characters");
    if (pw !== pw2) return setErr("Passwords do not match");
    setErr(undefined);
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="card-surface w-full max-w-sm space-y-4 p-6">
        <Logo />
        <h1 className="text-xl font-bold">Set a new password</h1>
        <Field label="New password"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
        <Field label="Confirm password" error={err}><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
        <Button type="submit" className="w-full" disabled={busy}>Update password</Button>
      </form>
    </div>
  );
}
