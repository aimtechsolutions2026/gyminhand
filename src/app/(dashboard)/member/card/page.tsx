import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Dumbbell,
  ArrowLeft,
  Globe,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Share2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DigitalMembershipCardPage({
  searchParams,
}: {
  searchParams: { memberId?: string };
}) {
  const memberId = searchParams.memberId;

  let member = null;
  if (memberId) {
    member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        organization: true,
        branch: true,
        membership: { include: { plan: true } },
        qrCode: true,
      },
    });
  }

  if (!member) {
    member = await prisma.member.findFirst({
      where: { isActive: true },
      include: {
        organization: true,
        branch: true,
        membership: { include: { plan: true } },
        qrCode: true,
      },
    });
  }

  if (!member) {
    redirect("/member-login");
  }

  const now = new Date();
  const expiryDate = member.membership?.expiryDate ? new Date(member.membership.expiryDate) : null;
  const isPlanActive =
    member.membership?.status === "ACTIVE" && expiryDate ? expiryDate > now : false;

  const daysRemaining = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const planName =
    member.membership?.customPlanName || member.membership?.plan?.name || "Standard Membership";

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href={`/member/dashboard?memberId=${member.id}`}>
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Digital ID Pass
        </span>
        <div className="w-9" />
      </div>

      {/* Main Wallet Card */}
      <div className="relative mx-auto max-w-sm rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-brand-950 text-white p-6 shadow-2xl border border-neutral-800 overflow-hidden space-y-6">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/30">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white leading-tight">
                {member.organization.name}
              </div>
              <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
                Home: {member.branch.name}
              </div>
            </div>
          </div>

          <Badge
            variant={isPlanActive ? "success" : "danger"}
            className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5"
          >
            {isPlanActive ? "Active" : "Expired"}
          </Badge>
        </div>

        {/* Roaming Badge Highlight */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-xs relative z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold">
            <Globe className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Multi-Branch Roaming Pass</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-300 bg-neutral-900/90 px-2 py-0.5 rounded-md">
            All Facilities
          </span>
        </div>

        {/* Center Section: Member Identity & QR Code */}
        <div className="flex items-center justify-between gap-4 pt-2 relative z-10">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              Member Name
            </div>
            <h2 className="text-xl font-black text-white tracking-tight leading-tight">
              {member.name}
            </h2>
            <div className="font-mono text-xs font-semibold text-brand-400">
              {member.memberCode}
            </div>

            <div className="pt-2">
              <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                Membership Tier
              </div>
              <div className="text-xs font-bold text-neutral-200 mt-0.5">{planName}</div>
            </div>
          </div>

          {/* High-Contrast QR Code Box */}
          <div className="p-2.5 bg-white rounded-2xl shadow-xl shrink-0">
            <div className="h-28 w-28 flex flex-col items-center justify-center">
              <QrCode className="h-24 w-24 text-neutral-950" />
              <div className="text-[8px] font-mono text-neutral-500 truncate max-w-[100px] mt-0.5">
                {member.qrCode?.token || member.memberCode}
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Validity & Countdown */}
        <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs relative z-10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
              Valid Thru
            </div>
            <div className="text-xs font-bold text-white mt-0.5">
              {expiryDate ? expiryDate.toLocaleDateString() : "Lifetime"}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
              Time Remaining
            </div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center justify-end gap-1">
              <Clock className="h-3 w-3" />
              <span>{daysRemaining} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Information & Instructions */}
      <div className="p-4 bg-white border border-neutral-200 rounded-2xl space-y-2 text-xs text-neutral-600 shadow-sm max-w-sm mx-auto">
        <div className="font-bold text-neutral-900 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-brand-500" />
          <span>How to use your Digital Pass:</span>
        </div>
        <p className="leading-relaxed">
          Present this pass at any facility entrance gate. The QR scanner will automatically detect
          your identity and approve your check-in even when visiting other branch locations.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 max-w-sm mx-auto">
        <Link href={`/member/qr?memberId=${member.id}`} className="flex-1">
          <Button variant="outline" className="w-full text-xs flex items-center justify-center gap-1.5">
            <QrCode className="h-4 w-4" />
            <span>Full-Screen QR</span>
          </Button>
        </Link>
        <Link href={`/member/dashboard?memberId=${member.id}`} className="flex-1">
          <Button className="w-full text-xs flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white">
            <Dumbbell className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

