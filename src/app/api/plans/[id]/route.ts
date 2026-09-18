import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updatePlanSchema = z.object({
  name: z.string().min(2).optional(),
  durationDays: z.coerce.number().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    if (tenant.role !== "OWNER" && tenant.role !== "MANAGER" && tenant.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only Owner or Manager can edit plans" } },
        { status: 403 }
      );
    }

    const planId = params.id;
    const body = await req.json();
    const validated = updatePlanSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: validated.error.errors[0]?.message },
        },
        { status: 400 }
      );
    }

    // Verify plan belongs to tenant
    const existing = await prisma.membershipPlan.findFirst({
      where: { id: planId, organizationId: tenant.organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Plan not found" } },
        { status: 404 }
      );
    }

    const updated = await prisma.membershipPlan.update({
      where: { id: planId },
      data: validated.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update plan" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    if (tenant.role !== "OWNER" && tenant.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only Owner can delete plans" } },
        { status: 403 }
      );
    }

    const planId = params.id;

    // Verify plan belongs to tenant
    const existing = await prisma.membershipPlan.findFirst({
      where: { id: planId, organizationId: tenant.organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Plan not found" } },
        { status: 404 }
      );
    }

    // Soft-deactivate to preserve historical memberships
    const updated = await prisma.membershipPlan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Plan deactivated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Delete plan error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete plan" } },
      { status: 500 }
    );
  }
}

