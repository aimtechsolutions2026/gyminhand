import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { generateMemberId } from "@/lib/utils";
import crypto from "crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bulkMemberItemSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  fitnessGoal: z.string().optional(),
  gender: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { items, branchId, planId } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "No items provided for import" } },
        { status: 400 }
      );
    }

    // Ensure branch and plan exist
    const [branch, plan, existingCount] = await Promise.all([
      branchId
        ? prisma.branch.findUnique({ where: { id: branchId } })
        : prisma.branch.findFirst({ where: { organizationId: tenant.organizationId } }),
      planId
        ? prisma.membershipPlan.findUnique({ where: { id: planId } })
        : prisma.membershipPlan.findFirst({ where: { organizationId: tenant.organizationId } }),
      prisma.member.count({ where: { organizationId: tenant.organizationId } }),
    ]);

    if (!branch || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_CONFIG", message: "Default branch or plan not found" } },
        { status: 400 }
      );
    }

    let successCount = 0;
    const errors: string[] = [];
    let currentCount = existingCount;

    for (const item of items) {
      const parsed = bulkMemberItemSchema.safeParse(item);
      if (!parsed.success) {
        errors.push(`Row for phone ${item.phone || "unknown"}: Invalid format`);
        continue;
      }

      const { name, phone, email, fitnessGoal, gender } = parsed.data;

      // Check duplicate
      const exists = await prisma.member.findUnique({
        where: {
          organizationId_branchId_phone: {
            organizationId: tenant.organizationId,
            branchId: branch.id,
            phone: phone.trim(),
          },
        },
      });

      if (exists) {
        errors.push(`Phone ${phone} already exists in branch ${branch.name}`);
        continue;
      }

      currentCount++;
      const memberCode = generateMemberId("FF", branch.name, currentCount);
      const qrToken = `FITFLOW_${tenant.organizationId}_${crypto.randomBytes(16).toString("hex")}`;
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

      await prisma.$transaction(async (tx) => {
        const member = await tx.member.create({
          data: {
            organizationId: tenant.organizationId,
            branchId: branch.id,
            memberCode,
            name: name.trim(),
            phone: phone.trim(),
            email: email?.trim() || null,
            fitnessGoal: fitnessGoal || null,
            gender: gender || null,
          },
        });

        await tx.qRCode.create({
          data: {
            organizationId: tenant.organizationId,
            memberId: member.id,
            token: qrToken,
          },
        });

        await tx.membership.create({
          data: {
            organizationId: tenant.organizationId,
            memberId: member.id,
            planId: plan.id,
            startDate,
            expiryDate,
            status: "ACTIVE",
          },
        });
      });

      successCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${successCount} member(s)`,
      data: {
        successCount,
        failedCount: errors.length,
        errors,
      },
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to perform bulk import" } },
      { status: 500 }
    );
  }
}

