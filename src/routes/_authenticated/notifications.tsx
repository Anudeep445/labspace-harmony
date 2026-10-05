import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/kit";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — LabSphere" }, { name: "description", content: "LabSphere notifications" }, { property: "og:title", content: "Notifications — LabSphere" }, { property: "og:description", content: "LabSphere notifications" }] }),
  component: Page,
});

function Page() {
  const me = useMe();
  return (
    <div>
      <PageHeader title="Notifications" description={`Signed in as ${me.name} (${me.role})`} />
      <Panel title="Coming next"><p className="text-sm text-muted-foreground">This section is not built yet.</p></Panel>
    </div>
  );
}
