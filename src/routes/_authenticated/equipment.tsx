import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmAction, EmptyState, ErrorState, FilterSelect, LoadingState, PageHeader, Pager, SearchBox, StatusBadge, TableWrap, Toolbar, usePaged } from "@/components/app/kit";
import { CrudDialog, DetailGrid, toForm, type FieldDef } from "@/components/app/CrudDialog";
import { byId, useEquipment, useLabs, useMaintenance, useRefresh, type Equipment } from "@/lib/data";
import { useMe } from "@/lib/auth";
import { EQUIPMENT_CONDITIONS, EQUIPMENT_STATUSES, fmtDate, includesQ } from "@/lib/constants";
import { deleteRow, nextCode, saveRow } from "@/lib/mutate";

export const Route = createFileRoute("/_authenticated/equipment")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } => (s["new"] ? { new: true } : {}),
  head: () => ({ meta: [{ title: "Equipment — LabSphere" }, { name: "description", content: "Laboratory equipment register with condition and availability." }, { property: "og:title", content: "Equipment — LabSphere" }, { property: "og:description", content: "Laboratory equipment register." }] }),
  component: EquipmentPage,
});

const KEYS = ["code", "name", "category", "lab_id", "brand", "model", "serial_no", "purchase_date", "warranty_expiry", "quantity", "condition", "status"];
const SORTS = [{ value: "code", label: "Sort: ID" }, { value: "name", label: "Sort: Name" }, { value: "purchase_date", label: "Sort: Purchase date" }, { value: "warranty_expiry", label: "Sort: Warranty expiry" }, { value: "status", label: "Sort: Status" }];

function EquipmentPage() {
  const me = useMe();
  const isAdmin = me.role === "admin";
  const search = Route.useSearch();
  const eq = useEquipment();
  const labs = useLabs();
  const mr = useMaintenance();
  const refresh = useRefresh();
  const labMap = byId(labs.data);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [lab, setLab] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("code");
  const [edit, setEdit] = useState<Equipment | null | undefined>(search.new && isAdmin ? null : undefined);
  const [view, setView] = useState<Equipment | null>(null);

  const cats = [...new Set((eq.data ?? []).map((e) => e.category))].sort();
  const rows = (eq.data ?? [])
    .filter((e) => includesQ(q, e.code, e.name, e.brand, e.model, e.serial_no) && (cat === "all" || e.category === cat) && (lab === "all" || e.lab_id === lab) && (status === "all" || e.status === status))
    .sort((a, b) => String(a[sort as keyof Equipment] ?? "").localeCompare(String(b[sort as keyof Equipment] ?? ""), undefined, { numeric: true }));
  const pg = usePaged(rows, 15);
  const labOpts = (labs.data ?? []).map((l) => ({ value: l.id, label: l.name }));

  const fields: FieldDef[] = [
    { key: "code", label: "Equipment ID", required: true }, { key: "name", label: "Name", required: true },
    { key: "category", label: "Category", required: true }, { key: "lab_id", label: "Laboratory", type: "select", options: labOpts, required: true },
    { key: "brand", label: "Brand" }, { key: "model", label: "Model" }, { key: "serial_no", label: "Serial number" },
    { key: "quantity", label: "Quantity", type: "number", required: true },
    { key: "purchase_date", label: "Purchase date", type: "date" }, { key: "warranty_expiry", label: "Warranty expiry", type: "date" },
    { key: "condition", label: "Condition", type: "select", options: EQUIPMENT_CONDITIONS, required: true },
    { key: "status", label: "Status", type: "select", options: EQUIPMENT_STATUSES, required: true },
  ];

  return (
    <div>
      <PageHeader title="Equipment" description={`${eq.data?.length ?? 0} items across all laboratories.`}
        actions={isAdmin && <Button onClick={() => setEdit(null)}><Plus className="h-4 w-4" /> Add equipment</Button>} />
      <Toolbar>
        <SearchBox value={q} onChange={(v) => { setQ(v); pg.setPage(1); }} placeholder="Search ID, name, brand, serial…" />
        <FilterSelect value={cat} onChange={(v) => { setCat(v); pg.setPage(1); }} options={cats} placeholder="All categories" />
        <FilterSelect value={lab} onChange={(v) => { setLab(v); pg.setPage(1); }} options={labOpts} placeholder="All laboratories" />
        <FilterSelect value={status} onChange={(v) => { setStatus(v); pg.setPage(1); }} options={EQUIPMENT_STATUSES} placeholder="All statuses" />
        <FilterSelect value={sort} onChange={(v) => setSort(v === "all" ? "code" : v)} options={SORTS} placeholder="Default sort" />
      </Toolbar>
      <TableWrap>
        {eq.isLoading ? <LoadingState /> : eq.error ? <ErrorState error={eq.error} onRetry={() => eq.refetch()} /> : rows.length === 0 ? <EmptyState title="No equipment found" /> : (<>
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Laboratory</TableHead><TableHead>Brand / Model</TableHead>
              <TableHead>Qty</TableHead><TableHead>Warranty</TableHead><TableHead>Condition</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>{pg.slice.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs">{e.code}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{e.name}</TableCell>
                <TableCell>{e.category}</TableCell>
                <TableCell className="whitespace-nowrap">{e.lab_id ? labMap.get(e.lab_id)?.name : "—"}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{e.brand} {e.model}</TableCell>
                <TableCell>{e.quantity}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{fmtDate(e.warranty_expiry)}</TableCell>
                <TableCell><StatusBadge status={e.condition} /></TableCell>
                <TableCell><StatusBadge status={e.status} /></TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => setView(e)} aria-label="View"><Eye className="h-4 w-4" /></Button>
                  {isAdmin && <>
                    <Button variant="ghost" size="icon" onClick={() => setEdit(e)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                    <ConfirmAction title={`Delete ${e.name}?`} description="Its maintenance history will also be removed. This cannot be undone."
                      onConfirm={async () => { try { await deleteRow("equipment", e.id); toast.success("Equipment deleted"); refresh(); } catch (er) { toast.error((er as Error).message); } }}
                      trigger={<Button variant="ghost" size="icon" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>} />
                  </>}
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
          <Pager {...pg} />
        </>)}
      </TableWrap>

      <CrudDialog open={edit !== undefined} onOpenChange={(o) => !o && setEdit(undefined)} title={edit ? "Edit equipment" : "Add equipment"} fields={fields}
        initial={edit ? toForm(edit, KEYS) : { ...toForm(null, KEYS), code: nextCode("EQ-", eq.data ?? [], 4), quantity: "1", condition: "Good", status: "Available" }}
        onSubmit={async (v) => { await saveRow("equipment", edit?.id ?? null, v); toast.success(edit ? "Equipment updated" : "Equipment added"); refresh(); }} />

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="sm:max-w-2xl">
          {view && <>
            <DialogHeader><DialogTitle>{view.name}</DialogTitle></DialogHeader>
            <DetailGrid items={[["Equipment ID", view.code], ["Category", view.category], ["Laboratory", view.lab_id ? labMap.get(view.lab_id)?.name : "—"], ["Brand", view.brand], ["Model", view.model], ["Serial number", view.serial_no], ["Purchase date", fmtDate(view.purchase_date)], ["Warranty expiry", fmtDate(view.warranty_expiry)], ["Quantity", view.quantity], ["Condition", <StatusBadge key="c" status={view.condition} />], ["Status", <StatusBadge key="s" status={view.status} />]]} />
            <h4 className="mt-2 text-sm font-semibold">Maintenance history</h4>
            {(mr.data ?? []).filter((m) => m.equipment_id === view.id).map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"><span>{m.code} · {m.description}</span><StatusBadge status={m.status} /></div>
            ))}
            {!(mr.data ?? []).some((m) => m.equipment_id === view.id) && <p className="text-sm text-muted-foreground">No maintenance records.</p>}
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
