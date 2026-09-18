"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  QrCode,
  CreditCard,
  UserCheck,
  Settings,
  LogOut,
  Dumbbell,
  Shield,
  Trophy,
  Layers,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OwnerSidebarProps {
  gymName?: string;
  userName?: string;
  userRole?: string;
}

export function OwnerSidebar({
  gymName = "FitFlow Gym",
  userName = "Gym Owner",
  userRole = "OWNER",
}: OwnerSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Define full list of all navigation items with allowed roles
  const allNavItems = [
    {
      name: "Overview",
      href: "/owner/dashboard",
      icon: LayoutDashboard,
      roles: ["OWNER", "MANAGER", "SUPERADMIN"],
    },
    {
      name: "QR Scanner",
      href: "/owner/scan",
      icon: QrCode,
      roles: ["OWNER", "MANAGER", "RECEPTION", "SUPERADMIN"],
      badge: userRole === "RECEPTION" ? "Fast Kiosk" : undefined,
    },
    {
      name: "Attendance",
      href: "/owner/attendance",
      icon: CalendarCheck,
      roles: ["OWNER", "MANAGER", "TRAINER", "RECEPTION", "SUPERADMIN"],
    },
    {
      name: "Members",
      href: "/owner/members",
      icon: Users,
      roles: ["OWNER", "MANAGER", "TRAINER", "RECEPTION", "SUPERADMIN"],
    },
    {
      name: "Billing & Invoices",
      href: "/owner/payments",
      icon: CreditCard,
      roles: ["OWNER", "MANAGER", "RECEPTION", "SUPERADMIN"],
    },
    {
      name: "Membership Plans",
      href: "/owner/plans",
      icon: Layers,
      roles: ["OWNER", "MANAGER", "SUPERADMIN"],
    },
    {
      name: "Staff & RBAC",
      href: "/owner/staff",
      icon: Shield,
      roles: ["OWNER", "MANAGER", "SUPERADMIN"],
    },
    {
      name: "Retention CRM",
      href: "/owner/follow-ups",
      icon: UserCheck,
      badge: "Moat",
      roles: ["OWNER", "MANAGER", "SUPERADMIN"],
    },
    {
      name: "Leaderboard",
      href: "/owner/leaderboard",
      icon: Trophy,
      roles: ["OWNER", "MANAGER", "TRAINER", "SUPERADMIN"],
    },
    {
      name: "Gym Settings",
      href: "/owner/settings",
      icon: Settings,
      roles: ["OWNER", "SUPERADMIN"],
    },
  ];

  // Filter items matching the user's role
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(userRole.toUpperCase())
  );

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toUpperCase()) {
      case "SUPERADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "OWNER":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "MANAGER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "TRAINER":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "RECEPTION":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-neutral-900 leading-none">{gymName}</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">FitFlow OS • {userRole}</div>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-neutral-200 flex items-center justify-between">
          <Link href={userRole === "RECEPTION" ? "/owner/scan" : userRole === "TRAINER" ? "/owner/members" : "/owner/dashboard"} className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-sm shadow-brand-500/20">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-neutral-900 leading-none">
                Fit<span className="text-brand-500">Flow</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 truncate max-w-[140px]">
                {gymName}
              </div>
            </div>
          </Link>
        </div>

        {/* Superadmin Quick Bridge */}
        {userRole === "SUPERADMIN" && (
          <div className="p-3 bg-red-50/80 border-b border-red-200/60">
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-between text-xs font-semibold text-red-700 hover:text-red-900"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-red-600" />
                Return to Superadmin HQ
              </span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase px-3 mb-2">
            {userRole} Workspace
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-brand-600" : "text-neutral-400"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-warning-50 text-warning-700 border border-warning/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-sm font-semibold text-neutral-900 truncate">{userName}</div>
              <div className="mt-1">
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                    getRoleBadgeStyle(userRole)
                  )}
                >
                  {userRole}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-lg text-neutral-500 hover:text-danger hover:bg-danger-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
