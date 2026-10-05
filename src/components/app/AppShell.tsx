import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Bell, BarChart3, Boxes, CalendarDays, CalendarPlus, ClipboardCheck, ClipboardList, FlaskConical, GraduationCap,
  LayoutDashboard, LogOut, Menu, Microscope, Settings, TriangleAlert, User, Users, Wrench, CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { useNotifications } from "@/lib/data";
import type { Role } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/labs", label: "Laboratories", icon: FlaskConical },
    { to: "/equipment", label: "Equipment", icon: Microscope },
    { to: "/bookings", label: "Bookings", icon: ClipboardList },
    { to: "/timetable", label: "Timetable", icon: CalendarDays },
    { to: "/maintenance", label: "Maintenance", icon: Wrench },
    { to: "/inventory", label: "Inventory", icon: Boxes },
    { to: "/students", label: "Students", icon: GraduationCap },
    { to: "/faculty", label: "Faculty", icon: Users },
    { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  faculty: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/labs", label: "Laboratories", icon: FlaskConical },
    { to: "/equipment", label: "Equipment", icon: Microscope },
    { to: "/bookings", label: "Book Laboratory", icon: CalendarPlus },
    { to: "/timetable", label: "Timetable", icon: CalendarDays },
    { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
    { to: "/maintenance", label: "Maintenance", icon: Wrench },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
  ],
  student: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/labs", label: "Laboratories", icon: FlaskConical },
    { to: "/timetable", label: "Timetable", icon: CalendarDays },
    { to: "/attendance", label: "My Attendance", icon: ClipboardCheck },
    { to: "/equipment", label: "Equipment", icon: Microscope },
    { to: "/report-issue", label: "Report Issue", icon: TriangleAlert },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/profile", label: "Profile", icon: User },
  ],
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const me = useMe();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5"><Logo light /></div>
      <p className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">{me.role} menu</p>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV[me.role].map((n) => {
          const active = path === n.to || path.startsWith(n.to + "/");
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/60">Academic Year 2026–27</div>
    </div>
  );
}

function NotificationBell() {
  const me = useMe();
  const qc = useQueryClient();
  const { data = [] } = useNotifications(me.id);
  const unread = data.filter((n) => !n.is_read).length;
  async function markAll() {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", me.id).eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }
  async function markOne(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button onClick={markAll} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {data.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</p>}
          {data.slice(0, 8).map((n) => (
            <button key={n.id} onClick={() => markOne(n.id)} className={cn("block w-full border-b px-4 py-3 text-left last:border-0 hover:bg-muted", !n.is_read && "bg-accent/50")}>
              <div className="flex items-start gap-2">
                {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <Link to="/notifications" className="block border-t px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted">View all</Link>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const initials = me.name.split(" ").filter((w) => !w.endsWith(".")).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 lg:block"><SidebarNav /></aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
          <div className="hidden text-sm text-muted-foreground sm:block">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-medium leading-tight">{me.name}</span>
                    <span className="block text-xs capitalize text-muted-foreground">{me.role}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal"><p className="text-sm font-medium">{me.name}</p><p className="text-xs text-muted-foreground">{me.email}</p></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: me.role === "admin" ? "/settings" : "/profile" })}><User className="h-4 w-4" /> {me.role === "admin" ? "Settings" : "Profile"}</DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-destructive"><LogOut className="h-4 w-4" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
