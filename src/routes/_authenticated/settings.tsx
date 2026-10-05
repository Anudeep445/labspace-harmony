import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/kit";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — LabSphere" }, { name: "description", content: "LabSphere settings" }, { property: "og:title", content: "Settings — LabSphere" }, { property: "og:description", content: "LabSphere settings" }] }),
  component: Page,
});

function Page() {
  const me = useMe();
  return (
    <div>
      <PageHeader title="Settings" description={`Signed in as ${me.name} (${me.role})`} />
      <Panel title="Coming next"><p className="text-sm text-muted-foreground">This section is not built yet.</p></Panel>
    </div>
  );
}
