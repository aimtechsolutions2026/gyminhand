import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBranchSchema = z.object({
  name: z.string().min(2, "Branch name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  capacity: z.coerce.number().optional(),
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

    const branches = await prisma.branch.findMany({
      where: { organizationId: tenant.organizationId },
      include: {
        _count: {
          select: { members: true, attendances: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: branches });
  } catch (error) {
    console.error("Fetch branches error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch branches" } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant || tenant.role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Owner access required" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createBranchSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid branch input",
          },
        },
        { status: 400 }
      );
    }

    // Check unique branch name per organization
    const existing = await prisma.branch.findUnique({
      where: {
        organizationId_name: {
          organizationId: tenant.organizationId,
          name: validated.data.name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BRANCH_EXISTS",
            message: "A branch with this name already exists in your gym",
          },
        },
        { status: 409 }
      );
    }

    const branch = await prisma.branch.create({
      data: {
        ...validated.data,
        organizationId: tenant.organizationId,
      },
    });

    return NextResponse.json({ success: true, data: branch }, { status: 201 });
  } catch (error) {
    console.error("Create branch error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create branch" } },
      { status: 500 }
    );
  }
}

