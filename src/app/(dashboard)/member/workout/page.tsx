import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft, CheckCircle2, Clock, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberWorkoutPage({
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
        trainer: true,
        workoutPlans: { where: { isActive: true }, take: 1 },
      },
    });
  }

  if (!member) {
    member = await prisma.member.findFirst({
      where: { isActive: true },
      include: {
        trainer: true,
        workoutPlans: { where: { isActive: true }, take: 1 },
      },
    });
  }

  if (!member) {
    redirect("/member-login");
  }

  // Pre-configured exercise routine tailored for the member
  const exercises = [
    { name: "Barbell Bench Press", sets: "4 Sets", reps: "8-10 Reps", rest: "90s Rest", target: "Chest" },
    { name: "Incline Dumbbell Press", sets: "3 Sets", reps: "10-12 Reps", rest: "60s Rest", target: "Upper Chest" },
    { name: "Cable Chest Flyes", sets: "3 Sets", reps: "12-15 Reps", rest: "45s Rest", target: "Chest Isolation" },
    { name: "Overhead Tricep Extension", sets: "3 Sets", reps: "12 Reps", rest: "45s Rest", target: "Triceps" },
    { name: "Parallel Bar Dips", sets: "3 Sets", reps: "To Failure", rest: "60s Rest", target: "Chest / Triceps" },
  ];

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
            Today&apos;s Workout Routine
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Coach: {member.trainer?.name || "Assigned Gym Trainer"}
          </p>
        </div>
      </div>

      {/* Routine Banner */}
      <Card className="border-brand-300 bg-gradient-to-r from-brand-600 to-brand-500 text-white p-5 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="bg-white/20 text-white border-none text-[10px] mb-1">
              Push Day • Day 1 of 4
            </Badge>
            <h2 className="text-xl font-extrabold">Chest & Triceps Hypertrophy</h2>
            <div className="flex items-center gap-3 text-xs text-brand-100 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> ~55 Mins
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" /> 5 Exercises
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Dumbbell className="h-7 w-7 text-white" />
          </div>
        </div>
      </Card>

      {/* Exercises Checklist */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">Exercise Checklist</h3>
        {exercises.map((ex, i) => (
          <Card key={i} className="p-4 hover:border-brand-200 transition-colors shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-neutral-900">
                    {i + 1}. {ex.name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {ex.target}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1.5 font-medium">
                  <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                    {ex.sets}
                  </span>
                  <span>{ex.reps}</span>
                  <span>• {ex.rest}</span>
                </div>
              </div>

              <input
                type="checkbox"
                className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500 mt-1 cursor-pointer"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

