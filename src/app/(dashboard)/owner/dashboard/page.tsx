import Link from "next/link";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
  UserPlus,
  QrCode,
  ArrowUpRight,
  TrendingDown,
  Clock,
} from "lucide-react";

export default async function OwnerDashboardPage() {
  const tenant = await getTenantContext();
  if (!tenant) return null;

  const orgId = tenant.organizationId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parallel database metrics gathering (tenant isolated)
  const [
    totalMembers,
    todayAttendance,
    paymentsThisMonth,
    recentAttendances,
    atRiskMembersCount,
  ] = await Promise.all([
    prisma.member.count({
      where: { organizationId: orgId, isActive: true },
    }),
    prisma.attendance.count({
      where: {
        organizationId: orgId,
        entryTime: { gte: today },
      },
    }),
    prisma.payment.aggregate({
      where: {
        organizationId: orgId,
        status: "PAID",
        paidAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
    prisma.attendance.findMany({
      where: { organizationId: orgId },
      orderBy: { entryTime: "desc" },
      take: 5,
      include: {
        member: {
          select: { name: true, memberCode: true, phone: true },
        },
      },
    }),
    // At risk: members with active membership whose last attendance was > 7 days ago
    prisma.member.count({
      where: {
        organizationId: orgId,
        isActive: true,
        attendances: {
          none: {
            entryTime: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    }),
  ]);

  const monthlyRevenue = paymentsThisMonth._sum.amount
    ? Number(paymentsThisMonth._sum.amount)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time operations, attendance, and member retention metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/owner/scan">
            <Button variant="outline" size="sm" className="gap-1.5">
              <QrCode className="h-4 w-4 text-brand-500" />
              <span>Scan QR</span>
            </Button>
          </Link>
          <Link href="/owner/members/new">
            <Button variant="primary" size="sm" className="gap-1.5 shadow-sm shadow-brand-500/20">
              <UserPlus className="h-4 w-4" />
              <span>Add Member</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <Card className="hover:border-neutral-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Active Members
            </span>
            <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{totalMembers}</div>
            <p className="text-xs text-neutral-500 mt-1">
              Registered fitness members
            </p>
          </CardContent>
        </Card>

        {/* Today's Attendance */}
        <Card className="hover:border-neutral-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Today&apos;s Visits
            </span>
            <div className="h-8 w-8 rounded-lg bg-success-50 text-success-600 flex items-center justify-center">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{todayAttendance}</div>
            <p className="text-xs text-success-600 mt-1 font-medium">
              Checked in today
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="hover:border-neutral-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Month Revenue
            </span>
            <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">
              {formatCurrency(monthlyRevenue)}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Collected this month
            </p>
          </CardContent>
        </Card>

        {/* At-Risk Members (Moat) */}
        <Card className="border-warning/30 bg-warning-50/20 hover:border-warning/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-warning-700">
              At Risk (7+ Days)
            </span>
            <div className="h-8 w-8 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-700">{atRiskMembersCount}</div>
            <Link
              href="/owner/follow-ups"
              className="inline-flex items-center text-xs text-warning-700 font-semibold hover:underline mt-1 gap-1"
            >
              <span>Take CRM action</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Recent Attendance & Quick Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Attendance Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Check-Ins</CardTitle>
                <p className="text-xs text-neutral-500 mt-0.5">Live QR & gate visits</p>
              </div>
              <Link href="/owner/attendance">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentAttendances.length === 0 ? (
                <div className="text-center py-10 text-neutral-400">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No check-ins recorded yet</p>
                  <p className="text-xs mt-1">
                    Use the QR Scanner or mark manual attendance to view live logs
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {recentAttendances.map((record) => (
                    <div
                      key={record.id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-semibold text-xs">
                          {record.member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-neutral-900">
                            {record.member.name}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {record.member.memberCode}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant="success" className="text-[11px]">
                          {record.method}
                        </Badge>
                        <div className="text-xs text-neutral-500 mt-1">
                          {new Date(record.entryTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Operations & FitFlow Moat Spotlight */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-brand-50 to-white border-brand-200">
            <CardHeader>
              <CardTitle className="text-brand-900 text-base">
                Churn Prevention Engine
              </CardTitle>
              <p className="text-xs text-brand-700 mt-1 leading-relaxed">
                FitFlow automatically detects inactive members before they churn. Follow up via WhatsApp or calls to recover revenue.
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/owner/follow-ups">
                <Button className="w-full shadow-sm shadow-brand-500/20" size="sm">
                  Open CRM Task List ({atRiskMembersCount})
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Health & Branch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-neutral-600">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span>Current Plan:</span>
                <Badge variant="default">Starter Trial</Badge>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span>Multi-tenant Isolation:</span>
                <span className="text-success-600 font-semibold text-xs">ENFORCED</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Database Sync:</span>
                <span className="text-success-600 font-semibold text-xs">CONNECTED</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

