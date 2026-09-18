import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateMemberSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.string().optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  fitnessGoal: z.string().optional(),
});

export async function GET(
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

    const member = await prisma.member.findFirst({
      where: {
        id: params.id,
        organizationId: tenant.organizationId,
        isActive: true,
      },
      include: {
        branch: true,
        membership: {
          include: { plan: true },
        },
        qrCode: true,
        attendances: {
          orderBy: { entryTime: "desc" },
          take: 10,
        },
        payments: {
          orderBy: { paidAt: "desc" },
          take: 5,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Member not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error("Fetch single member error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch member" } },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await req.json();
    const validated = updateMemberSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid update data",
          },
        },
        { status: 400 }
      );
    }

    const updated = await prisma.member.updateMany({
      where: {
        id: params.id,
        organizationId: tenant.organizationId,
      },
      data: validated.data,
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Member not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Member updated successfully" });
  } catch (error) {
    console.error("Update member error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update member" } },
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

    // Soft delete member
    const updated = await prisma.member.updateMany({
      where: {
        id: params.id,
        organizationId: tenant.organizationId,
      },
      data: { isActive: false },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Member not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Member archived successfully" });
  } catch (error) {
    console.error("Delete member error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete member" } },
      { status: 500 }
    );
  }
}

