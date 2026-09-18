"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ShieldCheck,
  Building2,
  Users,
  Activity,
  Layers,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  adminName?: string;
  adminEmail?: string;
}

export function AdminSidebar({
  adminName = "Super Admin",
  adminEmail = "admin@fitflow.app",
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      name: "Platform Overview",
      href: "/admin/dashboard",
      icon: Activity,
      badge: "Live",
    },
    {
      name: "Gyms & Organizations",
      href: "/admin/gyms",
      icon: Building2,
    },
    {
      name: "System Tiers & RBAC",
      href: "/admin/tiers",
      icon: Layers,
    },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white leading-none">FitFlow Central</div>
            <div className="text-[11px] text-red-400 mt-0.5">Superadmin Console</div>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-800"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-neutral-950/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 text-neutral-200",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold shadow-md shadow-red-600/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white leading-none">
                FitFlow <span className="text-red-500 font-black">HQ</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
                Superadmin
              </div>
            </div>
          </Link>
        </div>

        {/* Global Action */}
        <div className="p-4 border-b border-neutral-800/80">
          <Link
            href="/admin/dashboard#onboard-gym"
            onClick={() => setIsMobileOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-sm transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Onboard New Gym</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase px-3 mb-2">
            Multi-Tenant Management
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
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-red-600/15 text-red-400 border border-red-500/20 font-semibold"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-red-400" : "text-neutral-500"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/50">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-neutral-800/60">
            <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase px-3 mb-2">
              Tenant Switcher
            </div>
            <Link
              href="/owner/dashboard"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-neutral-400" />
                <span>Gym Portal (Demo)</span>
              </div>
              <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                Exit HQ
              </span>
            </Link>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/40">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-sm font-semibold text-white truncate">{adminName}</div>
              <div className="text-xs text-neutral-400 truncate">{adminEmail}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-900 transition-colors"
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

