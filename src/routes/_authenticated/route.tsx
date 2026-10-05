import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { loadMe } from "@/lib/auth";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const me = await loadMe();
    if (!me) throw redirect({ to: "/auth" });
    return { me };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
