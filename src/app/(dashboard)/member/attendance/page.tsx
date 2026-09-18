import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, ArrowLeft, Clock, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberAttendanceHistoryPage({
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
        attendances: {
          orderBy: { entryTime: "desc" },
        },
        _count: { select: { attendances: true } },
      },
    });
  }

  if (!member) {
    member = await prisma.member.findFirst({
      where: { isActive: true },
      include: {
        attendances: {
          orderBy: { entryTime: "desc" },
        },
        _count: { select: { attendances: true } },
      },
    });
  }

  if (!member) {
    redirect("/member-login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/member/dashboard?memberId=${member.id}`}>
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            My Visit History
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Total {member._count.attendances} workouts logged
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <div className="text-xs text-neutral-500">Total Visits</div>
          <div className="text-2xl font-bold text-brand-600 mt-1">
            {member._count.attendances}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-xs text-neutral-500">Current Streak</div>
          <div className="text-2xl font-bold text-warning-600 mt-1 flex items-center justify-center gap-1">
            <Flame className="h-5 w-5 fill-warning-500 text-warning-600" />
            <span>{Math.min(member._count.attendances, 5)} Days</span>
          </div>
        </Card>
      </div>

      {/* Timeline List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Attendance Log</CardTitle>
        </CardHeader>
        <CardContent>
          {member.attendances.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 text-xs">
              <CalendarCheck className="h-8 w-8 mx-auto text-neutral-300 mb-2" />
              No gym visits recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {member.attendances.map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-success-50 text-success-700 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">
                        {new Date(att.entryTime).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Method: {att.method}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-semibold text-neutral-700">
                      {new Date(att.entryTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

