import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  name: z.string().min(2, "Gym name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
});

export async function GET() {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: tenant.organizationId },
      include: {
        branches: {
          select: { id: true, name: true, phone: true, capacity: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: org });
  } catch (error) {
    console.error("Fetch gym settings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch settings" } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant || tenant.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Owner access required" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = settingsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid input",
          },
        },
        { status: 400 }
      );
    }

    const updated = await prisma.organization.update({
      where: { id: tenant.organizationId },
      data: validated.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update gym settings error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update settings" } },
      { status: 500 }
    );
  }
}
