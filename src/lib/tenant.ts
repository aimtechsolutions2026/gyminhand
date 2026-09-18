import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface TenantContext {
  userId: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  branchId?: string | null;
  isSuspended?: boolean;
  suspensionReason?: "DEACTIVATED" | "SUBSCRIPTION_EXPIRED" | null;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: Date | null;
}

export async function getTenantContext(): Promise<TenantContext | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const user = session.user as unknown as {
    id: string;
    name: string;
    email: string;
    role: string;
    organizationId?: string;
    branchId?: string;
  };

  if (!user.organizationId && user.role !== "SUPERADMIN") {
    return null;
  }

  let isSuspended = false;
  let suspensionReason: "DEACTIVATED" | "SUBSCRIPTION_EXPIRED" | null = null;
  let subscriptionPlan = "FREE";
  let subscriptionExpiresAt: Date | null = null;

  if (user.role !== "SUPERADMIN" && user.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: {
        isActive: true,
        subscriptionPlan: true,
        subscriptionExpiresAt: true,
        subscriptionStatus: true,
      },
    });

    if (org) {
      subscriptionPlan = org.subscriptionPlan || "FREE";
      subscriptionExpiresAt = org.subscriptionExpiresAt;

      if (!org.isActive) {
        isSuspended = true;
        suspensionReason = "DEACTIVATED";
      } else if (
        org.subscriptionExpiresAt &&
        new Date(org.subscriptionExpiresAt).getTime() < Date.now()
      ) {
        isSuspended = true;
        suspensionReason = "SUBSCRIPTION_EXPIRED";
      }
    }
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId || "",
    branchId: user.branchId,
    isSuspended,
    suspensionReason,
    subscriptionPlan,
    subscriptionExpiresAt,
  };
}

export async function requireTenantContext(): Promise<TenantContext> {
  const ctx = await getTenantContext();
  if (!ctx) {
    throw new Error("UNAUTHORIZED: Active gym session required");
  }
  if (ctx.isSuspended) {
    throw new Error(
      `GYM_SUSPENDED: Your gym access is currently ${
        ctx.suspensionReason === "DEACTIVATED" ? "deactivated" : "expired"
      }. Contact your platform administrator.`
    );
  }
  return ctx;
}
