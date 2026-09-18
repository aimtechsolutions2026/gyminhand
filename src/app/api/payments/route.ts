import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const recordPaymentSchema = z.object({
  memberId: z.string().min(1, "Invalid member ID"),
  planId: z.string().optional().or(z.literal("")),
  durationDays: z.coerce.number().optional(),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
  method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER"]).default("UPI"),
  notes: z.string().optional(),
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
    const method = searchParams.get("method") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      organizationId: tenant.organizationId,
    };

    if (method && method !== "ALL") {
      whereClause.method = method;
    }

    const [payments, totalCount, totalRevenueAggregate] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          member: {
            select: {
              id: true,
              name: true,
              memberCode: true,
              phone: true,
            },
          },
        },
        orderBy: { paidAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where: whereClause }),
      prisma.payment.aggregate({
        where: {
          organizationId: tenant.organizationId,
          status: "PAID",
        },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        payments,
        totalRevenue: Number(totalRevenueAggregate._sum.amount || 0),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch payments" } },
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
    const validated = recordPaymentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid payment input",
          },
        },
        { status: 400 }
      );
    }

    const { memberId, planId, durationDays, amount, method, notes } = validated.data;

    // Verify member belongs to this gym tenant
    const member = await prisma.member.findFirst({
      where: { id: memberId, organizationId: tenant.organizationId, isActive: true },
      include: { membership: true },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: { code: "MEMBER_NOT_FOUND", message: "Member not found" } },
        { status: 404 }
      );
    }

    let plan = null;
    let finalDays = durationDays || 30;
    let planTitle = "Custom Membership Renewal";

    if (planId && planId !== "custom") {
      plan = await prisma.membershipPlan.findFirst({
        where: { id: planId, organizationId: tenant.organizationId, isActive: true },
      });
      if (plan) {
        finalDays = plan.durationDays;
        planTitle = plan.name;
      }
    }

    const now = new Date();
    let newStartDate = now;
    let newExpiryDate = new Date(now);

    if (member.membership) {
      const currentExpiry = new Date(member.membership.expiryDate);
      if (currentExpiry > now) {
        // If plan is still active, extend from the current expiry date
        newStartDate = member.membership.startDate;
        newExpiryDate = new Date(currentExpiry);
        newExpiryDate.setDate(newExpiryDate.getDate() + finalDays);
      } else {
        // Expired, renew starting from today
        newStartDate = now;
        newExpiryDate.setDate(now.getDate() + finalDays);
      }
    } else {
      newExpiryDate.setDate(now.getDate() + finalDays);
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Atomic update of payment and subscription extension
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment Transaction Record
      const payment = await tx.payment.create({
        data: {
          organizationId: tenant.organizationId,
          memberId: member.id,
          amount,
          method,
          status: "PAID",
          invoiceNumber,
          notes: notes || `Payment for ${planTitle} (${finalDays} days)`,
        },
      });

      // 2. Upsert Membership Subscription
      const membership = await tx.membership.upsert({
        where: { memberId: member.id },
        create: {
          organizationId: tenant.organizationId,
          memberId: member.id,
          planId: plan ? plan.id : null,
          customPlanName: !plan ? planTitle : null,
          customPrice: amount,
          customDurationDays: finalDays,
          isCustom: !plan,
          startDate: newStartDate,
          expiryDate: newExpiryDate,
          status: "ACTIVE",
        },
        update: {
          planId: plan ? plan.id : null,
          customPlanName: !plan ? planTitle : null,
          customPrice: amount,
          customDurationDays: finalDays,
          isCustom: !plan,
          startDate: newStartDate,
          expiryDate: newExpiryDate,
          status: "ACTIVE",
        },
      });

      return { payment, membership };
    });

    return NextResponse.json({
      success: true,
      message: `Payment recorded and membership extended until ${newExpiryDate.toLocaleDateString()}`,
      data: {
        paymentId: result.payment.id,
        invoiceNumber: result.payment.invoiceNumber,
        amount: result.payment.amount,
        newExpiryDate: result.membership.expiryDate,
        planName: plan ? plan.name : planTitle,
      },
    });
  } catch (error) {
    console.error("Record payment error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to record payment" } },
      { status: 500 }
    );
  }
}

