import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createGymSchema = z.object({
  name: z.string().min(2, "Gym name is required"),
  email: z.string().email("Valid gym email required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  tier: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).default("STARTER"),
  subscriptionPlan: z.enum(["FREE", "SILVER", "GOLD", "CUSTOM"]).default("SILVER"),
  subscriptionDays: z.coerce.number().min(1).default(30),
  ownerName: z.string().min(2, "Owner name is required"),
  ownerEmail: z.string().email("Valid owner email required"),
  ownerPassword: z.string().min(8, "Password must be 8+ characters"),
});

const updateGymSchema = z.object({
  organizationId: z.string().min(1, "Organization ID required"),
  isActive: z.boolean().optional(),
  subscriptionPlan: z.enum(["FREE", "SILVER", "GOLD", "CUSTOM"]).optional(),
  subscriptionDays: z.coerce.number().optional(),
  subscriptionExpiresAt: z.string().optional(),
  tier: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET() {
  try {
    const tenant = await getTenantContext();
    if (!tenant || tenant.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Superadmin access required" } },
        { status: 403 }
      );
    }

    const organizations = await prisma.organization.findMany({
      include: {
        users: {
          where: { role: "OWNER" },
          select: { id: true, name: true, email: true, phone: true },
        },
        branches: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            members: true,
            attendances: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: organizations });
  } catch (error) {
    console.error("Superadmin fetch gyms error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch gyms" } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant || tenant.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Superadmin access required" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createGymSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid gym details",
          },
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      address,
      tier,
      subscriptionPlan,
      subscriptionDays,
      ownerName,
      ownerEmail,
      ownerPassword,
    } = validated.data;

    // Check if gym or owner email already registered
    const existing = await prisma.user.findUnique({
      where: { email: ownerEmail.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this owner email already exists" },
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(ownerPassword, 10);

    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + subscriptionDays);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          address: address || null,
          tier,
          isActive: true,
          subscriptionPlan,
          subscriptionExpiresAt,
          subscriptionStatus: "ACTIVE",
        },
      });

      // 2. Default Branch
      const branch = await tx.branch.create({
        data: {
          organizationId: org.id,
          name: "Main Facility",
          phone: phone || null,
          address: address || null,
        },
      });

      // 3. Owner User
      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          branchId: branch.id,
          name: ownerName,
          email: ownerEmail.toLowerCase().trim(),
          passwordHash,
          role: "OWNER",
          phone: phone || null,
        },
      });

      // 4. Default Starter Plans for the gym
      await tx.membershipPlan.createMany({
        data: [
          {
            organizationId: org.id,
            name: "1 Month Standard",
            durationDays: 30,
            price: 1500,
            description: "Standard 30-day gym membership",
          },
          {
            organizationId: org.id,
            name: "3 Months Silver",
            durationDays: 90,
            price: 3999,
            description: "Quarterly fitness membership",
          },
          {
            organizationId: org.id,
            name: "Annual Gold",
            durationDays: 365,
            price: 12000,
            description: "Full year unlimited access",
          },
        ],
      });

      return { org, branch, user };
    });

    return NextResponse.json(
      {
        success: true,
        message: `Gym "${result.org.name}" and Owner account created successfully`,
        data: {
          organizationId: result.org.id,
          ownerEmail: result.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Superadmin create gym error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create gym" } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant || tenant.role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Superadmin access required" } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = updateGymSchema.safeParse(body);

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

    const {
      organizationId,
      isActive,
      subscriptionPlan,
      subscriptionDays,
      subscriptionExpiresAt,
      tier,
      name,
      phone,
      address,
    } = validated.data;

    const updateData: Record<string, unknown> = {};

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (subscriptionPlan) {
      updateData.subscriptionPlan = subscriptionPlan;
    }

    if (tier) {
      updateData.tier = tier;
    }

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;

    if (subscriptionDays) {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + subscriptionDays);
      updateData.subscriptionExpiresAt = newExpiry;
      updateData.subscriptionStatus = "ACTIVE";
    } else if (subscriptionExpiresAt) {
      updateData.subscriptionExpiresAt = new Date(subscriptionExpiresAt);
      updateData.subscriptionStatus =
        new Date(subscriptionExpiresAt) > new Date() ? "ACTIVE" : "EXPIRED";
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Gym "${updated.name}" updated successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("Superadmin update gym error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update gym" } },
      { status: 500 }
    );
  }
}
