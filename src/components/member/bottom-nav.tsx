"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, QrCode, CalendarCheck, LogOut, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export function MemberBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const memberId = searchParams.get("memberId");

  const querySuffix = memberId ? `?memberId=${memberId}` : "";

  const items = [
    { name: "Home", href: `/member/dashboard${querySuffix}`, icon: LayoutDashboard },
    { name: "ID Card", href: `/member/card${querySuffix}`, icon: CreditCard },
    { name: "QR Pass", href: `/member/qr${querySuffix}`, icon: QrCode, isPrimary: true },
    { name: "History", href: `/member/attendance${querySuffix}`, icon: CalendarCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-neutral-200 py-2 px-6 flex items-center justify-around max-w-md mx-auto sm:rounded-t-2xl shadow-lg">
      {items.map((item) => {
        const isActive =
          pathname === item.href.split("?")[0] ||
          (item.href.includes("dashboard") && pathname === "/member/dashboard");
        const Icon = item.icon;

        if (item.isPrimary) {
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center -mt-6 group"
            >
              <div className="h-14 w-14 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 group-active:scale-95 transition-transform">
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-[11px] font-bold text-brand-600 mt-1">
                {item.name}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors",
              isActive ? "text-brand-600 font-semibold" : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[11px]">{item.name}</span>
          </Link>
        );
      })}

      <Link
        href="/member-login"
        className="flex flex-col items-center gap-1 py-1 px-3 text-neutral-400 hover:text-neutral-700"
        title="Exit"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-[11px]">Exit</span>
      </Link>
    </nav>
  );
}

