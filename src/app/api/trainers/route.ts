import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createTrainerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  specialty: z.string().optional(),
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

    const trainers = await prisma.trainer.findMany({
      where: {
        organizationId: tenant.organizationId,
        isActive: true,
      },
      include: {
        _count: { select: { assignedMembers: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: trainers });
  } catch (error) {
    console.error("Fetch trainers error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch trainers" } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = createTrainerSchema.safeParse(body);

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

    const trainer = await prisma.trainer.create({
      data: {
        ...validated.data,
        email: validated.data.email || null,
        organizationId: tenant.organizationId,
      },
    });

    return NextResponse.json({ success: true, data: trainer }, { status: 201 });
  } catch (error) {
    console.error("Create trainer error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create trainer" } },
      { status: 500 }
    );
  }
}

