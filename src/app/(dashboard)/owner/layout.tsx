import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";
import { OwnerSidebar } from "@/components/owner/sidebar";
import { prisma } from "@/lib/prisma";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantContext();

  // If unauthenticated in server component, redirect to login
  if (!tenant) {
    redirect("/login");
  }

  // Fetch gym details for display
  let gymName = "FitFlow Gym";
  if (tenant.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: tenant.organizationId },
      select: { name: true },
    });
    if (org?.name) gymName = org.name;
  }

  // Lockout perimeter check: if gym is deactivated or subscription expired
  if (tenant.isSuspended && tenant.role !== "SUPERADMIN") {
    redirect(
      `/gym-suspended?reason=${tenant.suspensionReason || "SUBSCRIPTION_EXPIRED"}&gym=${encodeURIComponent(
        gymName
      )}`
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <OwnerSidebar
        gymName={gymName}
        userName={tenant.name}
        userRole={tenant.role}
      />
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

