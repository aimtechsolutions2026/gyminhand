import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, ArrowLeft, Flame, Utensils, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberDietPage({
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
        dietPlans: { where: { isActive: true }, take: 1 },
      },
    });
  }

  if (!member) {
    member = await prisma.member.findFirst({
      where: { isActive: true },
      include: {
        trainer: true,
        dietPlans: { where: { isActive: true }, take: 1 },
      },
    });
  }

  if (!member) {
    redirect("/member-login");
  }

  const meals = [
    {
      name: "Meal 1: Breakfast",
      time: "8:00 AM",
      items: "Oats with skimmed milk, 1 scoop whey protein, 1 sliced banana & 5 almonds",
      macros: "450 kcal • 32g Protein • 55g Carbs",
    },
    {
      name: "Meal 2: Post-Workout Fuel",
      time: "11:30 AM",
      items: "Whey isolate shake + 1 green apple or rice cakes",
      macros: "220 kcal • 26g Protein • 24g Carbs",
    },
    {
      name: "Meal 3: High-Protein Lunch",
      time: "1:30 PM",
      items: "150g Grilled chicken breast / Low-fat paneer, 1 bowl brown rice, yellow dal & cucumber salad",
      macros: "580 kcal • 45g Protein • 60g Carbs",
    },
    {
      name: "Meal 4: Evening Snack",
      time: "5:30 PM",
      items: "3 boiled egg whites (or 50g roasted chana) + warm green tea",
      macros: "180 kcal • 15g Protein • 12g Carbs",
    },
    {
      name: "Meal 5: Dinner",
      time: "8:30 PM",
      items: "2 multigrain rotis, mixed seasonal vegetables, Greek yogurt / curd",
      macros: "420 kcal • 22g Protein • 48g Carbs",
    },
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
            Nutrition & Diet Plan
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Prescribed by Coach {member.trainer?.name || "Fitness Team"}
          </p>
        </div>
      </div>

      {/* Macro Target Summary */}
      <Card className="border-brand-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase text-neutral-500">
            Daily Calorie Target
          </span>
          <span className="text-lg font-black text-brand-600 flex items-center gap-1">
            <Flame className="h-4 w-4 text-warning-500 fill-warning-500" />
            2,050 kcal
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-neutral-100">
          <div className="p-2 rounded-lg bg-brand-50/50">
            <div className="text-neutral-500">Protein</div>
            <div className="font-bold text-brand-700 text-sm mt-0.5">140g</div>
          </div>
          <div className="p-2 rounded-lg bg-warning-50/50">
            <div className="text-neutral-500">Carbs</div>
            <div className="font-bold text-warning-700 text-sm mt-0.5">200g</div>
          </div>
          <div className="p-2 rounded-lg bg-neutral-100/50">
            <div className="text-neutral-500">Healthy Fats</div>
            <div className="font-bold text-neutral-800 text-sm mt-0.5">55g</div>
          </div>
        </div>
      </Card>

      {/* Meal Schedule */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">Daily Meal Schedule</h3>
        {meals.map((meal, i) => (
          <Card key={i} className="p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-neutral-900">
                    {meal.name}
                  </span>
                </div>
                <div className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {meal.items}
                </div>
                <div className="text-[11px] font-semibold text-brand-600 mt-1.5">
                  {meal.macros}
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] shrink-0">
                <Clock className="h-3 w-3 mr-1" />
                {meal.time}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

