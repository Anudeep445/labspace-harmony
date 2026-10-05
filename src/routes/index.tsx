import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/app/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LabSphere — College Laboratory Management System" },
      { name: "description", content: "LabSphere digitally manages college labs, equipment, bookings, practical sessions, attendance and maintenance." },
      { property: "og:title", content: "LabSphere — College Laboratory Management System" },
      { property: "og:description", content: "Digital management of college laboratories, equipment, bookings and attendance." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      navigate({ to: data.session ? "/dashboard" : "/auth", replace: true });
    });
  }, [navigate]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Logo />
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}
