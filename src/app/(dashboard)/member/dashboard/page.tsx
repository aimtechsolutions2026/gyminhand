import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Flame,
  Calendar,
  Dumbbell,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Globe,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberDashboardPage({
  searchParams,
}: {
  searchParams: { memberId?: string };
}) {
  const memberId = searchParams.memberId;

  // Locate member
  let member = null;
  if (memberId) {
    member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        organization: true,
        branch: true,
        membership: { include: { plan: true } },
        qrCode: true,
        attendances: {
          orderBy: { entryTime: "desc" },
          take: 5,
        },
        _count: { select: { attendances: true } },
      },
    });
  }

  // Fallback to first active member for demonstration if no param provided
  if (!member) {
    member = await prisma.member.findFirst({
      where: { isActive: true },
      include: {
        organization: true,
        branch: true,
        membership: { include: { plan: true } },
        qrCode: true,
        attendances: {
          orderBy: { entryTime: "desc" },
          take: 5,
        },
        _count: { select: { attendances: true } },
      },
    });
  }

  if (!member) {
    redirect("/member-login");
  }

  const now = new Date();
  const expiryDate = member.membership?.expiryDate
    ? new Date(member.membership.expiryDate)
    : null;
  const isPlanActive = expiryDate && expiryDate > now;
  const daysLeft = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Calculate simple attendance streak
  const totalVisits = member._count.attendances;
  const streakDays = Math.min(totalVisits, 5); // demonstration streak

  return (
    <div className="space-y-5">
      {/* Top Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-brand-600 flex items-center gap-1.5">
            <Dumbbell className="h-3.5 w-3.5" />
            <span>{member.organization.name}</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mt-0.5">
            Hi, {member.name}! 👋
          </h1>
          <p className="text-xs text-neutral-500 font-mono">
            {member.memberCode} • {member.branch.name}
          </p>
        </div>

        {/* Streak Counter */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-warning-50 to-warning-100 border border-warning/30 flex items-center gap-2 shadow-sm">
          <Flame className="h-5 w-5 text-warning-600 fill-warning-500" />
          <div className="text-right">
            <div className="text-xs font-extrabold text-warning-800 leading-none">
              {streakDays} DAYS
            </div>
            <div className="text-[9px] font-bold text-warning-600 uppercase mt-0.5">
              Streak
            </div>
          </div>
        </div>
      </div>

      {/* Digital QR Check-in Banner */}
      <Link href={`/member/qr?memberId=${member.id}`} className="block">
        <Card className="border-brand-300 bg-gradient-to-r from-brand-600 to-brand-500 text-white p-5 shadow-lg shadow-brand-500/20 active:scale-[0.99] transition-transform">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge className="bg-white/20 text-white border-none text-[10px]">
                One-Tap Entry Pass
              </Badge>
              <h3 className="text-lg font-bold">Tap for QR Badge</h3>
              <p className="text-xs text-brand-100">
                Hold to scanner at turnstile or reception
              </p>
            </div>
            <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center p-2 shadow-md shrink-0">
              <QrCode className="h-12 w-12 text-neutral-900" />
            </div>
          </div>
        </Card>
      </Link>

      {/* Digital Member Card & Roaming Banner */}
      <Link href={`/member/card?memberId=${member.id}`} className="block">
        <div className="p-3.5 rounded-2xl bg-neutral-900 text-white flex items-center justify-between shadow-md border border-neutral-800 active:scale-[0.99] transition-transform">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Digital ID & Roaming Pass</span>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-black">
                  MULTI-BRANCH
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                View wallet pass & cross-facility access
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-neutral-400" />
        </div>
      </Link>

      {/* Membership Plan Countdown */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Active Subscription</CardTitle>
            <Badge variant={isPlanActive ? "success" : "danger"}>
              {isPlanActive ? "Active" : "Expired"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-base text-neutral-900">
              {member.membership?.customPlanName || member.membership?.plan?.name || "General Membership"}
            </span>
            <span className="text-xs text-neutral-500">
              {daysLeft} days remaining
            </span>
          </div>

          {/* Countdown Progress Bar */}
          <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                daysLeft > 7 ? "bg-success" : daysLeft > 2 ? "bg-warning" : "bg-danger"
              }`}
              style={{
                width: `${Math.min(100, Math.max(5, (daysLeft / 30) * 100))}%`,
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-neutral-500">
            <span>
              Expires: {expiryDate ? expiryDate.toLocaleDateString() : "N/A"}
            </span>
            {daysLeft <= 5 && (
              <span className="text-danger font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Renew Soon
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fitness Profile Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">My Fitness Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="text-neutral-400">Weight</div>
              <div className="font-bold text-neutral-800 text-sm mt-0.5">
                {member.weight ? `${member.weight} kg` : "—"}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="text-neutral-400">Height</div>
              <div className="font-bold text-neutral-800 text-sm mt-0.5">
                {member.height ? `${member.height} cm` : "—"}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="text-neutral-400">Total Visits</div>
              <div className="font-bold text-brand-600 text-sm mt-0.5">
                {totalVisits}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Check-Ins List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold">Recent Visits</CardTitle>
          <Link
            href={`/member/attendance?memberId=${member.id}`}
            className="text-xs text-brand-600 font-semibold flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {member.attendances.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-400">
              No gym check-ins recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {member.attendances.map((att) => (
                <div key={att.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    <span>
                      {new Date(att.entryTime).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-800">
                    {new Date(att.entryTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

