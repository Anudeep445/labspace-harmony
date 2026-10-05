import { useRouteContext } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "./constants";
import type { Faculty, Student } from "./data";

export interface Me {
  id: string;
  email: string;
  name: string;
  role: Role;
  faculty: Faculty | null;
  student: Student | null;
}

export async function loadMe(): Promise<Me | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const u = data.user;
  const [roles, profile, fac, stu] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", u.id),
    supabase.from("profiles").select("*").eq("id", u.id).maybeSingle(),
    supabase.from("faculty").select("*").eq("user_id", u.id).maybeSingle(),
    supabase.from("students").select("*").eq("user_id", u.id).maybeSingle(),
  ]);
  const rs = (roles.data ?? []).map((r) => r.role as Role);
  const role: Role = rs.includes("admin") ? "admin" : rs.includes("faculty") ? "faculty" : "student";
  return {
    id: u.id,
    email: u.email ?? "",
    name: profile.data?.name ?? (u.user_metadata?.name as string) ?? u.email ?? "User",
    role,
    faculty: fac.data ?? null,
    student: stu.data ?? null,
  };
}

export function useMe(): Me {
  return useRouteContext({ from: "/_authenticated" }).me;
}
