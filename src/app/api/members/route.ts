import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { generateMemberId } from "@/lib/utils";
import crypto from "crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createMemberSchema = z.object({
  branchId: z.string().min(1, "Please select a valid branch"),
  name: z.string().min(2, "Member name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  fitnessGoal: z.string().optional(),
  planId: z.string().optional().or(z.literal("")),
  isCustom: z.boolean().default(false),
  customPlanName: z.string().optional(),
  customDurationDays: z.coerce.number().min(1).optional(),
  customPrice: z.coerce.number().min(0).optional(),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER"]).default("CASH"),
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
    const query = searchParams.get("query") || "";
    const branchId = searchParams.get("branchId") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      organizationId: tenant.organizationId,
      isActive: true,
    };

    if (branchId) {
      whereClause.branchId = branchId;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
        { memberCode: { contains: query, mode: "insensitive" } },
      ];
    }

    if (status === "ACTIVE" || status === "EXPIRED") {
      whereClause.membership = { status };
    }

    const [members, totalCount] = await Promise.all([
      prisma.member.findMany({
        where: whereClause,
        include: {
          branch: { select: { id: true, name: true } },
          membership: {
            include: { plan: { select: { name: true, price: true } } },
          },
          qrCode: { select: { token: true } },
          _count: { select: { attendances: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.member.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        members,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Fetch members error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch members" } },
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
    const validated = createMemberSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid member data",
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const {
      branchId,
      name,
      phone,
      email,
      dateOfBirth,
      gender,
      height,
      weight,
      fitnessGoal,
      planId,
      isCustom,
      customPlanName,
      customDurationDays,
      customPrice,
      paymentMethod,
    } = validated.data;

    // Check duplicate phone within organization branch
    const existing = await prisma.member.findUnique({
      where: {
        organizationId_branchId_phone: {
          organizationId: tenant.organizationId,
          branchId,
          phone: phone.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MEMBER_EXISTS",
            message: "A member with this phone number already exists in this branch",
          },
        },
        { status: 409 }
      );
    }

    // Get branch details & total member count
    const [branch, memberCount] = await Promise.all([
      prisma.branch.findUnique({ where: { id: branchId } }),
      prisma.member.count({ where: { organizationId: tenant.organizationId } }),
    ]);

    if (!branch || branch.organizationId !== tenant.organizationId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_BRANCH", message: "Branch not found" } },
        { status: 404 }
      );
    }

    let planRecord = null;
    let finalDurationDays = 30;
    let finalPrice = 0;
    let finalPlanName = "Custom Membership";

    if (planId && planId !== "custom") {
      planRecord = await prisma.membershipPlan.findFirst({
        where: { id: planId, organizationId: tenant.organizationId },
      });
      if (!planRecord) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_PLAN", message: "Plan not found" } },
          { status: 404 }
        );
      }
      finalDurationDays = planRecord.durationDays;
      finalPrice =
        customPrice !== undefined && customPrice !== null ? customPrice : Number(planRecord.price);
      finalPlanName = planRecord.name;
    } else {
      finalDurationDays = customDurationDays || 30;
      finalPrice = customPrice !== undefined && customPrice !== null ? customPrice : 0;
      finalPlanName = customPlanName || "Custom Plan";
    }

    // Generate unique member code & QR token
    const memberCode = generateMemberId("FF", branch.name, memberCount);
    const qrToken = `FITFLOW_${tenant.organizationId}_${crypto.randomBytes(16).toString("hex")}`;

    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + finalDurationDays);

    // Multi-entity atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Member
      const member = await tx.member.create({
        data: {
          organizationId: tenant.organizationId,
          branchId,
          memberCode,
          name: name.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          height: height || null,
          weight: weight || null,
          fitnessGoal: fitnessGoal || null,
        },
      });

      // 2. Create QR Code
      const qrCode = await tx.qRCode.create({
        data: {
          organizationId: tenant.organizationId,
          memberId: member.id,
          token: qrToken,
        },
      });

      // 3. Create Membership Subscription
      const membership = await tx.membership.create({
        data: {
          organizationId: tenant.organizationId,
          memberId: member.id,
          planId: planRecord ? planRecord.id : null,
          customPlanName: isCustom || !planRecord ? finalPlanName : null,
          customPrice: finalPrice,
          customDurationDays: finalDurationDays,
          isCustom: isCustom || !planRecord,
          startDate,
          expiryDate,
          status: "ACTIVE",
        },
      });

      // 4. Record Initial Payment
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const payment = await tx.payment.create({
        data: {
          organizationId: tenant.organizationId,
          memberId: member.id,
          amount: finalPrice,
          method: paymentMethod,
          status: "PAID",
          invoiceNumber,
          notes: `Initial registration for plan: ${finalPlanName} (${finalDurationDays} days)`,
        },
      });

      return { member, qrCode, membership, payment };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Member registered successfully",
        data: {
          id: result.member.id,
          memberCode: result.member.memberCode,
          name: result.member.name,
          qrToken: result.qrCode.token,
          expiryDate: result.membership.expiryDate,
          invoiceNumber: result.payment.invoiceNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create member error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to register member" } },
      { status: 500 }
    );
  }
}

