import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Medal, Award, Crown, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const tenant = await getTenantContext();
  if (!tenant) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch top active members by attendance count
  const topMembers = await prisma.member.findMany({
    where: {
      organizationId: tenant.organizationId,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          attendances: true,
        },
      },
      branch: { select: { name: true } },
    },
    orderBy: {
      attendances: { _count: "desc" },
    },
    take: 10,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Member Leaderboard & Gamification
          </h1>
          <Badge variant="default" className="text-xs">
            Engagement Booster
          </Badge>
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          Monthly attendance rankings and milestone badges driving member retention
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 2nd Place */}
        {topMembers[1] && (
          <Card className="text-center p-5 border-neutral-300 bg-neutral-50 order-2 sm:order-1 sm:mt-6">
            <div className="h-10 w-10 mx-auto rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-sm mb-2 shadow-inner">
              🥈 2nd
            </div>
            <h3 className="font-bold text-neutral-900 truncate">{topMembers[1].name}</h3>
            <p className="text-xs text-neutral-500 font-mono">{topMembers[1].memberCode}</p>
            <div className="mt-3 text-lg font-black text-neutral-800">
              {topMembers[1]._count.attendances} Visits
            </div>
          </Card>
        )}

        {/* 1st Place */}
        {topMembers[0] && (
          <Card className="text-center p-6 border-brand-400 bg-gradient-to-b from-brand-50 to-white order-1 sm:order-2 shadow-md">
            <div className="h-12 w-12 mx-auto rounded-full bg-warning-100 text-warning-700 flex items-center justify-center font-bold text-base mb-2 shadow">
              👑 1st
            </div>
            <Badge variant="default" className="text-[10px] mb-1">Gym Champion</Badge>
            <h3 className="text-lg font-bold text-neutral-900 truncate">{topMembers[0].name}</h3>
            <p className="text-xs text-neutral-500 font-mono">{topMembers[0].memberCode}</p>
            <div className="mt-3 text-2xl font-black text-brand-600 flex items-center justify-center gap-1">
              <span>{topMembers[0]._count.attendances}</span>
              <span className="text-xs font-semibold text-neutral-500">Visits</span>
            </div>
          </Card>
        )}

        {/* 3rd Place */}
        {topMembers[2] && (
          <Card className="text-center p-5 border-neutral-300 bg-neutral-50 order-3 sm:order-3 sm:mt-10">
            <div className="h-10 w-10 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm mb-2 shadow-inner">
              🥉 3rd
            </div>
            <h3 className="font-bold text-neutral-900 truncate">{topMembers[2].name}</h3>
            <p className="text-xs text-neutral-500 font-mono">{topMembers[2].memberCode}</p>
            <div className="mt-3 text-lg font-black text-neutral-800">
              {topMembers[2]._count.attendances} Visits
            </div>
          </Card>
        )}
      </div>

      {/* Full Top 10 Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Top Active Athletes</CardTitle>
            <CardDescription>Based on check-in consistency</CardDescription>
          </div>
          <Trophy className="h-5 w-5 text-warning-500" />
        </CardHeader>
        <CardContent>
          {topMembers.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 text-xs">
              No attendance data available for leaderboard yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 text-sm">
              {topMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="py-3 flex items-center justify-between hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-black text-neutral-400 text-sm">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-neutral-900">{member.name}</div>
                      <div className="text-xs font-mono text-neutral-400">
                        {member.memberCode} • {member.branch.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <Flame className="h-4 w-4 text-warning-500 fill-warning-400" />
                    <span>{member._count.attendances} Workouts</span>
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

