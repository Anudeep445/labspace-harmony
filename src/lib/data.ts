import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Lab = Tables<"labs">;
export type Faculty = Tables<"faculty">;
export type Student = Tables<"students">;
export type Equipment = Tables<"equipment">;
export type Booking = Tables<"bookings">;
export type Maintenance = Tables<"maintenance_requests">;
export type Inventory = Tables<"inventory">;
export type Attendance = Tables<"attendance">;
export type Notification = Tables<"notifications">;
export type Activity = Tables<"activity_log">;

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const useLabs = () =>
  useQuery({ queryKey: ["labs"], queryFn: () => unwrap<Lab[]>(supabase.from("labs").select("*").order("code")) });
export const useFaculty = () =>
  useQuery({ queryKey: ["faculty"], queryFn: () => unwrap<Faculty[]>(supabase.from("faculty").select("*").order("code")) });
export const useStudents = () =>
  useQuery({ queryKey: ["students"], queryFn: () => unwrap<Student[]>(supabase.from("students").select("*").order("code")) });
export const useEquipment = () =>
  useQuery({ queryKey: ["equipment"], queryFn: () => unwrap<Equipment[]>(supabase.from("equipment").select("*").order("code")) });
export const useBookings = () =>
  useQuery({
    queryKey: ["bookings"],
    queryFn: () => unwrap<Booking[]>(supabase.from("bookings").select("*").order("booking_date", { ascending: false }).order("start_time")),
  });
export const useMaintenance = () =>
  useQuery({
    queryKey: ["maintenance"],
    queryFn: () => unwrap<Maintenance[]>(supabase.from("maintenance_requests").select("*").order("created_at", { ascending: false })),
  });
export const useInventory = () =>
  useQuery({ queryKey: ["inventory"], queryFn: () => unwrap<Inventory[]>(supabase.from("inventory").select("*").order("code")) });
export const useAttendance = () =>
  useQuery({
    queryKey: ["attendance"],
    queryFn: () => unwrap<Attendance[]>(supabase.from("attendance").select("*").order("att_date", { ascending: false }).limit(5000)),
  });
export const useNotifications = (userId: string) =>
  useQuery({
    queryKey: ["notifications", userId],
    queryFn: () =>
      unwrap<Notification[]>(supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(100)),
    refetchInterval: 30000,
  });
export const useActivity = () =>
  useQuery({
    queryKey: ["activity"],
    queryFn: () => unwrap<Activity[]>(supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(12)),
  });

/** Invalidate everything after a mutation — triggers touch several tables at once. */
export function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

export function byId<T extends { id: string }>(rows: T[] | undefined) {
  const m = new Map<string, T>();
  rows?.forEach((r) => m.set(r.id, r));
  return m;
}
