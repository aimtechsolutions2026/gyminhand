import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
    const cleanIdentifier = String(identifier || "").trim();

    if (!cleanIdentifier) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_INPUT", message: "Identifier is required" },
        },
        { status: 400 }
      );
    }

    // Search by memberCode or phone
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { phone: cleanIdentifier },
          { memberCode: cleanIdentifier.toUpperCase() },
        ],
        isActive: true,
      },
      select: {
        id: true,
        memberCode: true,
        name: true,
        organizationId: true,
        branchId: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MEMBER_NOT_FOUND",
            message: "No active membership found for this phone number or ID",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        memberId: member.id,
        memberCode: member.memberCode,
        name: member.name,
        organizationId: member.organizationId,
        branchId: member.branchId,
      },
    });
  } catch (error) {
    console.error("Member lookup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to look up member" },
      },
      { status: 500 }
    );
  }
}

