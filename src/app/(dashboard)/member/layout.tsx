import { Suspense } from "react";
import { MemberBottomNav } from "@/components/member/bottom-nav";
import { getTenantContext } from "@/lib/tenant";
import { redirect } from "next/navigation";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantContext();
  if (tenant?.isSuspended) {
    redirect(
      `/gym-suspended?reason=${tenant.suspensionReason || "SUBSCRIPTION_EXPIRED"}`
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center">
      <div className="w-full max-w-md bg-neutral-50 min-h-screen flex flex-col relative pb-24 shadow-sm border-x border-neutral-200">
        <main className="flex-1 p-4 sm:p-5">{children}</main>

        <Suspense fallback={null}>
          <MemberBottomNav />
        </Suspense>
      </div>
    </div>
  );
}
