import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/app/kit";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — LabSphere" }, { name: "description", content: "LabSphere profile" }, { property: "og:title", content: "Profile — LabSphere" }, { property: "og:description", content: "LabSphere profile" }] }),
  component: Page,
});

function Page() {
  const me = useMe();
  return (
    <div>
      <PageHeader title="Profile" description={`Signed in as ${me.name} (${me.role})`} />
      <Panel title="Coming next"><p className="text-sm text-muted-foreground">This section is not built yet.</p></Panel>
    </div>
  );
}
