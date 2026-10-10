import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = keyof Database["public"]["Tables"];

/** Insert (id null) or update a row; RLS decides whether the caller may do it. */
export async function saveRow(table: T, id: string | null, values: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = supabase.from(table) as any;
  const { error } = id ? await q.update(values).eq("id", id) : await q.insert(values);
  if (error) throw new Error(error.message);
}

export async function deleteRow(table: T, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error, count } = await (supabase.from(table) as any).delete({ count: "exact" }).eq("id", id);
  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("You don't have permission to delete this record");
}

export function nextCode(prefix: string, existing: { code: string }[], pad = 3) {
  const max = existing.reduce((m, r) => {
    const n = parseInt(r.code.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return prefix + String(max + 1).padStart(pad, "0");
}
