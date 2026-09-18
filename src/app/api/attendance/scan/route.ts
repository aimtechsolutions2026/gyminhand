import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const {
      token,
      memberCode,
      scannerBranchId,
      method = "QR",
      force = false,
    } = await req.json();

    if (!token && !memberCode) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_INPUT", message: "QR token or Member Code is required" },
        },
        { status: 400 }
      );
    }

    // 1. Locate member by QR token or memberCode within organization
    let member = null;

    if (token) {
      const qr = await prisma.qRCode.findFirst({
        where: {
          token: token.trim(),
          organizationId: tenant.organizationId,
          isActive: true,
        },
        include: {
          member: {
            include: {
              branch: true,
              membership: { include: { plan: true } },
              _count: { select: { attendances: true } },
            },
          },
        },
      });
      member = qr?.member;
    } else if (memberCode) {
      member = await prisma.member.findFirst({
        where: {
          memberCode: memberCode.trim().toUpperCase(),
          organizationId: tenant.organizationId,
          isActive: true,
        },
        include: {
          branch: true,
          membership: { include: { plan: true } },
          _count: { select: { attendances: true } },
        },
      });
    }

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MEMBER_NOT_FOUND",
            message: "Invalid QR code or member not found in this gym",
          },
        },
        { status: 404 }
      );
    }

    const now = new Date();
    const expiryDate = member.membership?.expiryDate
      ? new Date(member.membership.expiryDate)
      : null;
    const isExpired = !expiryDate || expiryDate < now;
    const daysLeft = expiryDate
      ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // 2. Check if membership is expired
    if (isExpired && !force) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MEMBERSHIP_EXPIRED",
            message: `Membership expired on ${expiryDate?.toLocaleDateString() || "Unknown"}. Renewal required.`,
            member: {
              id: member.id,
              name: member.name,
              memberCode: member.memberCode,
              phone: member.phone,
              planName: member.membership?.customPlanName || member.membership?.plan?.name || "None",
              expiryDate,
              daysOverdue: Math.abs(daysLeft),
            },
          },
        },
        { status: 403 }
      );
    }

    // 3. Prevent duplicate scan within 30 minutes
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const recentScan = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        entryTime: { gte: thirtyMinutesAgo },
      },
      orderBy: { entryTime: "desc" },
    });

    if (recentScan && !force) {
      const minutesAgo = Math.round(
        (now.getTime() - new Date(recentScan.entryTime).getTime()) / (60 * 1000)
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_CHECKED_IN",
            message: `${member.name} already checked in ${minutesAgo} minute(s) ago.`,
            member: {
              name: member.name,
              memberCode: member.memberCode,
              lastEntryTime: recentScan.entryTime,
            },
          },
        },
        { status: 409 }
      );
    }

    // Determine current scanning facility branch (for multi-branch cross roaming)
    const currentBranchId = scannerBranchId || tenant.branchId || member.branchId;
    const isRoaming = currentBranchId !== member.branchId;

    let scanningBranch = member.branch;
    if (isRoaming) {
      const foundBranch = await prisma.branch.findFirst({
        where: { id: currentBranchId, organizationId: tenant.organizationId },
      });
      if (foundBranch) {
        scanningBranch = foundBranch;
      }
    }

    // 4. Record attendance log with roaming status
    const attendance = await prisma.attendance.create({
      data: {
        organizationId: tenant.organizationId,
        branchId: scanningBranch.id,
        memberId: member.id,
        entryTime: now,
        method: method === "MANUAL" ? "MANUAL" : "QR",
        isRoaming,
        homeBranchId: isRoaming ? member.branchId : null,
      },
    });

    const totalVisits = member._count.attendances + 1;
    const planName =
      member.membership?.customPlanName || member.membership?.plan?.name || "Standard Plan";

    return NextResponse.json({
      success: true,
      message: isRoaming
        ? `🚀 Multi-Branch Roaming Pass Approved! Home: ${member.branch.name} -> Visiting: ${scanningBranch.name}`
        : `✓ Attendance marked for ${member.name}`,
      data: {
        attendanceId: attendance.id,
        memberId: member.id,
        name: member.name,
        memberCode: member.memberCode,
        branchName: scanningBranch.name,
        homeBranchName: member.branch.name,
        isRoaming,
        planName,
        entryTime: attendance.entryTime,
        method: attendance.method,
        totalVisits,
        daysLeft,
      },
    });
  } catch (error) {
    console.error("Attendance scan error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to record attendance" } },
      { status: 500 }
    );
  }
}

