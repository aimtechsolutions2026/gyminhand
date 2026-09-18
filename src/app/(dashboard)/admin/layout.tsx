import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantContext();

  // Enforce SUPERADMIN security perimeter
  if (!tenant || tenant.role !== "SUPERADMIN") {
    redirect("/login?unauthorized=true");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <AdminSidebar
        adminName={tenant.name}
        adminEmail={tenant.email}
      />
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

