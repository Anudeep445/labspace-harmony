import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/kit";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LabSphere" }, { name: "description", content: "LabSphere dashboard" }, { property: "og:title", content: "Dashboard — LabSphere" }, { property: "og:description", content: "LabSphere dashboard" }] }),
  component: Page,
});

function Page() {
  const me = useMe();
  return (
    <div>
      <PageHeader title="Dashboard" description={`Signed in as ${me.name} (${me.role})`} />
      <Panel title="Coming next"><p className="text-sm text-muted-foreground">This section is not built yet.</p></Panel>
    </div>
  );
}
