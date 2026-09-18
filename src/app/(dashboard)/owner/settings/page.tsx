import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Shield, ChevronRight } from "lucide-react";

export default async function GymSettingsPage() {
  const tenant = await getTenantContext();
  if (!tenant) return null;

  const org = await prisma.organization.findUnique({
    where: { id: tenant.organizationId },
    include: {
      branches: true,
      _count: {
        select: { members: true, users: true },
      },
    },
  });

  if (!org) return <div>Gym not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Gym Settings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your fitness center profile, multi-location branches, and staff permissions
        </p>
      </div>

      {/* Gym Profile Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{org.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-0.5">
                  <span>Organization ID: {org.id.slice(0, 8)}...</span>
                  <Badge variant="default" className="text-[10px]">{org.tier} TIER</Badge>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-neutral-100">
          <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-sm text-neutral-500 flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> Official Email
            </span>
            <span className="sm:col-span-2 text-sm font-medium text-neutral-900">
              {org.email}
            </span>
          </div>

          <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-sm text-neutral-500 flex items-center gap-1.5">
              <Phone className="h-4 w-4" /> Contact Phone
            </span>
            <span className="sm:col-span-2 text-sm font-medium text-neutral-900">
              {org.phone || "Not configured"}
            </span>
          </div>

          <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-sm text-neutral-500 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Main Address
            </span>
            <span className="sm:col-span-2 text-sm font-medium text-neutral-900">
              {org.address || "Address not provided"}
            </span>
          </div>

          <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-sm text-neutral-500 flex items-center gap-1.5">
              <Shield className="h-4 w-4" /> GST Number
            </span>
            <span className="sm:col-span-2 text-sm font-medium text-neutral-900">
              {org.gstNumber || "Optional / Unregistered"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Branch Management Quick Link */}
      <Card className="hover:border-brand-300 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Branches & Locations</CardTitle>
            <CardDescription className="mt-0.5">
              You have {org.branches.length} active location{org.branches.length > 1 ? "s" : ""}.
            </CardDescription>
          </div>
          <Link href="/owner/settings/branches">
            <Button variant="outline" size="sm" className="gap-1.5">
              <span>Manage Branches</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {org.branches.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sm text-neutral-900">{b.name}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {b.address || "Main Gym Floor"}
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Isolation & Security Card */}
      <Card className="bg-neutral-50 border-neutral-200">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-600">
            Tenant Security & Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-neutral-500 space-y-2">
          <p>
            • All member records, financial invoices, and check-in tokens are cryptographically isolated under Organization ID <code className="bg-neutral-200 px-1 py-0.5 rounded text-neutral-800">{org.id}</code>.
          </p>
          <p>
            • Cross-tenant leakage is strictly prevented at database foreign-key constraints and API middleware layers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

