"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { ShieldAlert, Dumbbell, Mail, Phone, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function GymSuspendedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "SUBSCRIPTION_EXPIRED";
  const gymName = searchParams.get("gym") || "FitFlow Gym";

  const isDeactivated = reason === "DEACTIVATED";

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 text-neutral-100">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-red-600 shadow-[0_0_25px_5px_rgba(220,38,38,0.7)]" />

        <div className="inline-flex p-4 rounded-2xl bg-red-950/60 border border-red-800/50 text-red-500 shadow-inner">
          <ShieldAlert className="h-10 w-10 animate-pulse" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
            <Dumbbell className="h-3.5 w-3.5" />
            <span>{gymName}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isDeactivated ? "Gym Access Deactivated" : "Platform Subscription Expired"}
          </h1>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            {isDeactivated
              ? "This gym account has been deactivated by the platform superadmin. Access to owner dashboards, member QR kiosks, trainer tools, and attendance tracking is temporarily halted."
              : "Your gym organization's FitFlow subscription has reached its expiration date. Facility staff and members cannot access their accounts until the subscription is renewed."}
          </p>
        </div>

        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 text-xs text-left space-y-2">
          <div className="font-semibold text-neutral-300">How to restore access?</div>
          <div className="text-neutral-400">
            Please contact the FitFlow Platform Superadmin to renew your gym subscription or reactivate your account:
          </div>
          <div className="pt-2 border-t border-neutral-800/80 flex flex-col gap-1.5 text-neutral-300">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-red-400" />
              <span>admin@fitflow.app</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-red-400" />
              <span>+91 98765 00099 (Support Desk)</span>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign In to Another Account</span>
          </button>

          <Link href="/" className="block">
            <Button variant="ghost" size="sm" className="w-full text-xs text-neutral-500 hover:text-neutral-300">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Return to FitFlow Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GymSuspendedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">Loading status...</div>}>
      <GymSuspendedContent />
    </Suspense>
  );
}

