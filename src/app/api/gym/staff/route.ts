import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createStaffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  role: z.enum(["MANAGER", "TRAINER", "RECEPTION"]),
  branchId: z.string().min(1, "Branch selection required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialty: z.string().optional(), // For trainers
});

const updateStaffSchema = z.object({
  userId: z.string().min(1, "User ID required"),
  isActive: z.boolean().optional(),
  role: z.enum(["OWNER", "MANAGER", "TRAINER", "RECEPTION"]).optional(),
  branchId: z.string().optional(),
});

export async function GET() {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 }
      );
    }

    if (tenant.role !== "OWNER" && tenant.role !== "MANAGER" && tenant.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Owner or Manager permission required" } },
        { status: 403 }
      );
    }

    const orgId = tenant.organizationId;
    if (!orgId) {
      return NextResponse.json(
        { success: false, error: { code: "NO_ORG", message: "No active gym context" } },
        { status: 400 }
      );
    }

    // Fetch all staff users for this organization
    const staff = await prisma.user.findMany({
      where: {
        organizationId: orgId,
        role: {
          in: ["OWNER", "MANAGER", "TRAINER", "RECEPTION"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        branchId: true,
        createdAt: true,
      },
      orderBy: [
        { role: "asc" },
        { createdAt: "asc" },
      ],
    });

    // Fetch branches for assignment
    const branches = await prisma.branch.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        staff,
        branches,
      },
    });
  } catch (error) {
    console.error("Fetch staff error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch staff" } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 }
      );
    }

    if (tenant.role !== "OWNER" && tenant.role !== "MANAGER" && tenant.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Owner or Manager permission required" } },
        { status: 403 }
      );
    }

    const orgId = tenant.organizationId;
    if (!orgId) {
      return NextResponse.json(
        { success: false, error: { code: "NO_ORG", message: "No active gym context" } },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = createStaffSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid staff details",
          },
        },
        { status: 400 }
      );
    }

    const { name, email, phone, role, branchId, password, specialty } = validated.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_EXISTS", message: "A user with this email address already exists" },
        },
        { status: 409 }
      );
    }

    // Verify branch belongs to this organization
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, organizationId: orgId },
    });

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_BRANCH", message: "Specified branch not found in this gym" },
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          organizationId: orgId,
          branchId,
          name,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          role,
          passwordHash,
          isActive: true,
        },
      });

      // If user is TRAINER, create/upsert Trainer record
      if (role === "TRAINER") {
        await tx.trainer.create({
          data: {
            organizationId: orgId,
            name,
            email: email.toLowerCase().trim(),
            phone: phone || "",
            specialty: specialty || "General Fitness & Conditioning",
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Staff member ${result.name} added as ${result.role}`,
        data: {
          id: result.id,
          name: result.name,
          email: result.email,
          role: result.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create staff error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create staff member" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required" } },
        { status: 401 }
      );
    }

    if (tenant.role !== "OWNER" && tenant.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only Gym Owner can modify staff roles and access" } },
        { status: 403 }
      );
    }

    const orgId = tenant.organizationId;
    if (!orgId) {
      return NextResponse.json(
        { success: false, error: { code: "NO_ORG", message: "No active gym context" } },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = updateStaffSchema.safeParse(body);

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

    const { userId, isActive, role, branchId } = validated.data;

    // Prevent modifying self status (can't deactivate own owner account)
    if (userId === tenant.userId && isActive === false) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "You cannot deactivate your own account" },
        },
        { status: 400 }
      );
    }

    // Verify user belongs to same org
    const targetUser = await prisma.user.findFirst({
      where: { id: userId, organizationId: orgId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Staff user not found" } },
        { status: 404 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(typeof isActive === "boolean" ? { isActive } : {}),
        ...(role ? { role } : {}),
        ...(branchId ? { branchId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${updated.name}`,
      data: updated,
    });
  } catch (error) {
    console.error("Update staff error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update staff" } },
      { status: 500 }
    );
  }
}

