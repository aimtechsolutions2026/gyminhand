import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateTaskSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  outcomeNotes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const whereClause: Record<string, unknown> = {
      organizationId: tenant.organizationId,
    };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const tasks = await prisma.followUpTask.findMany({
      where: whereClause,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            memberCode: true,
            phone: true,
            riskScore: true,
          },
        },
        branch: { select: { name: true } },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 50,
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Fetch CRM tasks error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch CRM tasks" } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { taskId, status, outcomeNotes } = await req.json();

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Task ID required" } },
        { status: 400 }
      );
    }

    const updated = await prisma.followUpTask.updateMany({
      where: {
        id: taskId,
        organizationId: tenant.organizationId,
      },
      data: {
        status: status || "COMPLETED",
        outcomeNotes: outcomeNotes || null,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Follow-up task updated successfully",
    });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update task" } },
      { status: 500 }
    );
  }
}

