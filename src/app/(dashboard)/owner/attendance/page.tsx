import Link from "next/link";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  QrCode,
  Clock,
  Flame,
  Users,
  Building2,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AttendanceLogsPage() {
  const tenant = await getTenantContext();
  if (!tenant) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [todayCount, weekCount, recentLogs] = await Promise.all([
    prisma.attendance.count({
      where: {
        organizationId: tenant.organizationId,
        entryTime: { gte: today },
      },
    }),
    prisma.attendance.count({
      where: {
        organizationId: tenant.organizationId,
        entryTime: { gte: startOfWeek },
      },
    }),
    prisma.attendance.findMany({
      where: { organizationId: tenant.organizationId },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            memberCode: true,
            phone: true,
          },
        },
        branch: { select: { name: true } },
      },
      orderBy: { entryTime: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Attendance Records
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time gym visit audit log and check-in timeline
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/owner/scan">
            <Button size="sm" className="gap-1.5 shadow-sm shadow-brand-500/20">
              <QrCode className="h-4 w-4" />
              <span>Open QR Scanner</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Today&apos;s Check-Ins
            </span>
            <CalendarCheck className="h-4 w-4 text-brand-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{todayCount}</div>
            <p className="text-xs text-neutral-500 mt-0.5">Visits since 12:00 AM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              7-Day Total Visits
            </span>
            <Flame className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{weekCount}</div>
            <p className="text-xs text-neutral-500 mt-0.5">Weekly gym floor traffic</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Peak Hours
            </span>
            <Clock className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">6 PM - 9 PM</div>
            <p className="text-xs text-neutral-500 mt-0.5">High-intensity evening slot</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Check-In Stream</CardTitle>
            <CardDescription>Showing latest 50 verification events</CardDescription>
          </div>
          <Badge variant="default">{recentLogs.length} Records</Badge>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <CalendarCheck className="h-10 w-10 mx-auto text-neutral-300 mb-2" />
              <p className="font-semibold text-neutral-700">No attendance logs found</p>
              <p className="text-xs text-neutral-400 mt-1">
                Check-ins will appear here as members scan their passes.
              </p>
              <Link href="/owner/scan" className="inline-block mt-4">
                <Button size="sm">Launch Scanner</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs font-semibold uppercase text-neutral-500">
                    <th className="pb-3 pr-4">Member</th>
                    <th className="pb-3 px-4">Location</th>
                    <th className="pb-3 px-4">Check-In Date</th>
                    <th className="pb-3 px-4">Time</th>
                    <th className="pb-3 pl-4 text-right">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/owner/members/${log.member.id}`}
                          className="font-medium text-neutral-900 hover:text-brand-600 transition-colors"
                        >
                          {log.member.name}
                        </Link>
                        <div className="text-xs font-mono text-neutral-400">
                          {log.member.memberCode}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 text-xs">
                        {log.branch.name}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 text-xs">
                        {new Date(log.entryTime).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-neutral-900 font-semibold text-xs">
                        {new Date(log.entryTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <Badge variant="success" className="text-[10px]">
                          {log.method}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

