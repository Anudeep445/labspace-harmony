import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmAction, EmptyState, ErrorState, FilterSelect, LoadingState, PageHeader, RequireRole, SearchBox, StatusBadge, TableWrap, Toolbar } from "@/components/app/kit";
import { CrudDialog, toForm, type FieldDef } from "@/components/app/CrudDialog";
import { byId, useInventory, useLabs, useRefresh, type Inventory } from "@/lib/data";
import { fmtDate, includesQ, stockStatus } from "@/lib/constants";
import { deleteRow, nextCode, saveRow } from "@/lib/mutate";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({ meta: [{ title: "Inventory — LabSphere" }, { name: "description", content: "Consumable laboratory stock and low-stock alerts." }, { property: "og:title", content: "Inventory — LabSphere" }, { property: "og:description", content: "Consumable laboratory stock." }] }),
  component: () => <RequireRole roles={["admin"]}><InventoryPage /></RequireRole>,
});

const KEYS = ["code", "name", "category", "lab_id", "quantity", "min_stock", "supplier"];

function InventoryPage() {
  const inv = useInventory();
  const labs = useLabs();
  const refresh = useRefresh();
  const labMap = byId(labs.data);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [lab, setLab] = useState("all");
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState("code");
  const [edit, setEdit] = useState<Inventory | null | undefined>();
  const all = inv.data ?? [];
  const low = all.filter((i) => i.quantity <= i.min_stock);
  const cats = [...new Set(all.map((i) => i.category))].sort();
  const labOpts = (labs.data ?? []).map((l) => ({ value: l.id, label: l.name }));
  const rows = all
    .filter((i) => includesQ(q, i.code, i.name, i.supplier) && (cat === "all" || i.category === cat) && (lab === "all" || i.lab_id === lab) && (stock === "all" || stockStatus(i.quantity, i.min_stock) === stock))
    .sort((a, b) => (sort === "quantity" ? a.quantity - b.quantity : String(a[sort as keyof Inventory]).localeCompare(String(b[sort as keyof Inventory]))));

  async function adjust(i: Inventory, d: number) {
    const quantity = Math.max(0, i.quantity + d);
    try { await saveRow("inventory", i.id, { quantity }); refresh(); } catch (e) { toast.error((e as Error).message); }
  }

  const fields: FieldDef[] = [
    { key: "code", label: "Item ID", required: true }, { key: "name", label: "Item name", required: true },
    { key: "category", label: "Category", required: true }, { key: "lab_id", label: "Laboratory", type: "select", options: labOpts, required: true },
    { key: "quantity", label: "Quantity", type: "number", required: true }, { key: "min_stock", label: "Minimum stock", type: "number", required: true },
    { key: "supplier", label: "Supplier", full: true },
  ];

  return (
    <div>
      <PageHeader title="Inventory" description="Consumable resources. Status is calculated automatically from quantity and minimum stock."
        actions={<Button onClick={() => setEdit(null)}><Plus className="h-4 w-4" /> Add item</Button>} />
      {low.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">{low.length} item{low.length > 1 ? "s" : ""} need restocking</p>
            <p className="text-muted-foreground">{low.map((i) => `${i.name} (${i.quantity}${i.quantity === 0 ? " — out of stock" : ""})`).join(", ")}</p>
          </div>
        </div>
      )}
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search items or suppliers…" />
        <FilterSelect value={cat} onChange={setCat} options={cats} placeholder="All categories" />
        <FilterSelect value={lab} onChange={setLab} options={labOpts} placeholder="All laboratories" />
        <FilterSelect value={stock} onChange={setStock} options={["In Stock", "Low Stock", "Out of Stock"]} placeholder="All stock levels" />
        <FilterSelect value={sort} onChange={(v) => setSort(v === "all" ? "code" : v)} options={[{ value: "name", label: "Sort: Name" }, { value: "quantity", label: "Sort: Quantity" }, { value: "updated_at", label: "Sort: Last updated" }]} placeholder="Sort: ID" />
      </Toolbar>
      <TableWrap>
        {inv.isLoading ? <LoadingState /> : inv.error ? <ErrorState error={inv.error} onRetry={() => inv.refetch()} /> : rows.length === 0 ? <EmptyState title="No inventory items" /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Laboratory</TableHead><TableHead>Quantity</TableHead>
              <TableHead>Min</TableHead><TableHead>Supplier</TableHead><TableHead>Updated</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>{rows.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-mono text-xs">{i.code}</TableCell>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell>{i.category}</TableCell>
                <TableCell className="whitespace-nowrap">{i.lab_id ? labMap.get(i.lab_id)?.name : "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjust(i, -1)} disabled={i.quantity === 0} aria-label="Decrease"><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center font-medium">{i.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjust(i, 1)} aria-label="Increase"><Plus className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
                <TableCell>{i.min_stock}</TableCell>
                <TableCell className="whitespace-nowrap">{i.supplier}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{fmtDate(i.updated_at)}</TableCell>
                <TableCell><StatusBadge status={stockStatus(i.quantity, i.min_stock)} /></TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" onClick={() => setEdit(i)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                  <ConfirmAction title={`Delete ${i.name}?`} description="This inventory item will be removed permanently."
                    onConfirm={async () => { try { await deleteRow("inventory", i.id); toast.success("Item deleted"); refresh(); } catch (e) { toast.error((e as Error).message); } }}
                    trigger={<Button variant="ghost" size="icon" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>} />
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </TableWrap>
      <CrudDialog open={edit !== undefined} onOpenChange={(o) => !o && setEdit(undefined)} title={edit ? "Edit item" : "Add inventory item"} fields={fields}
        initial={edit ? toForm(edit, KEYS) : { ...toForm(null, KEYS), code: nextCode("INV-", all), min_stock: "5" }}
        onSubmit={async (v) => { await saveRow("inventory", edit?.id ?? null, v); toast.success(edit ? "Item updated" : "Item added"); refresh(); }} />
    </div>
  );
}
