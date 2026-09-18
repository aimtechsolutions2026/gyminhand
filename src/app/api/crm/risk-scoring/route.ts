import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const orgId = tenant.organizationId;
    const now = new Date();

    // 1. Fetch all active members for this gym with their latest attendance and active membership
    const members = await prisma.member.findMany({
      where: { organizationId: orgId, isActive: true },
      include: {
        attendances: {
          orderBy: { entryTime: "desc" },
          take: 1,
        },
        membership: true,
      },
    });

    let highRiskCount = 0;
    let tasksCreated = 0;

    for (const member of members) {
      const lastVisit = member.attendances[0]?.entryTime;
      const daysSinceVisit = lastVisit
        ? Math.floor((now.getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
        : 30; // If never visited, assume 30 days

      let calculatedRiskScore = 0;
      let riskReason = "";

      if (daysSinceVisit >= 21) {
        calculatedRiskScore = 95;
        riskReason = `Critical absence: ${daysSinceVisit} days without gym check-in`;
      } else if (daysSinceVisit >= 14) {
        calculatedRiskScore = 80;
        riskReason = `High absence: ${daysSinceVisit} days without workout`;
      } else if (daysSinceVisit >= 7) {
        calculatedRiskScore = 60;
        riskReason = `At risk: Inactive for ${daysSinceVisit} days`;
      } else if (daysSinceVisit >= 4) {
        calculatedRiskScore = 30;
      } else {
        calculatedRiskScore = 10;
      }

      // Check plan expiration risk factor
      if (member.membership) {
        const daysToExpiry = Math.ceil(
          (new Date(member.membership.expiryDate).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysToExpiry <= 3 && daysToExpiry >= 0) {
          calculatedRiskScore = Math.max(calculatedRiskScore, 75);
          riskReason = `Plan expires in ${daysToExpiry} day(s)`;
        } else if (daysToExpiry < 0) {
          calculatedRiskScore = Math.max(calculatedRiskScore, 90);
          riskReason = `Membership expired ${Math.abs(daysToExpiry)} days ago`;
        }
      }

      // Update member's risk score
      await prisma.member.update({
        where: { id: member.id },
        data: { riskScore: calculatedRiskScore },
      });

      // If risk score >= 60, create or update a pending CRM Follow-Up Task for staff
      if (calculatedRiskScore >= 60) {
        highRiskCount++;

        const existingTask = await prisma.followUpTask.findFirst({
          where: {
            memberId: member.id,
            status: { in: ["PENDING", "IN_PROGRESS"] },
          },
        });

        if (!existingTask) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 1);

          await prisma.followUpTask.create({
            data: {
              organizationId: orgId,
              branchId: member.branchId,
              memberId: member.id,
              title: `Reach out to ${member.name} (${member.phone})`,
              reason: riskReason,
              priority: calculatedRiskScore >= 80 ? "HIGH" : "MEDIUM",
              status: "PENDING",
              dueDate,
            },
          });
          tasksCreated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Risk engine executed. Evaluated ${members.length} members.`,
      data: {
        totalEvaluated: members.length,
        highRiskCount,
        newTasksCreated: tasksCreated,
      },
    });
  } catch (error) {
    console.error("Risk engine calculation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to calculate risk scores" } },
      { status: 500 }
    );
  }
}

