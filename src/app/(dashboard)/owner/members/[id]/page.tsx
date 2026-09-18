import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  QrCode,
  Calendar,
  Phone,
  Mail,
  Dumbbell,
  Printer,
  CreditCard,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default async function MemberProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await getTenantContext();
  if (!tenant) return null;

  const [member, org] = await Promise.all([
    prisma.member.findFirst({
      where: {
        id: params.id,
        organizationId: tenant.organizationId,
        isActive: true,
      },
      include: {
        branch: true,
        membership: {
          include: { plan: true },
        },
        qrCode: true,
        attendances: {
          orderBy: { entryTime: "desc" },
          take: 10,
        },
        payments: {
          orderBy: { paidAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.organization.findUnique({
      where: { id: tenant.organizationId },
      select: { name: true },
    }),
  ]);

  if (!member) {
    notFound();
  }

  const isPlanActive = member.membership?.status === "ACTIVE";
  const expiryDate = member.membership?.expiryDate
    ? new Date(member.membership.expiryDate)
    : null;
  const daysLeft = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // BMI Calculation
  const heightM = member.height ? member.height / 100 : null;
  const bmi =
    heightM && member.weight
      ? (member.weight / (heightM * heightM)).toFixed(1)
      : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/owner/members">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
              <span>{member.name}</span>
              <Badge variant={isPlanActive ? "success" : "danger"}>
                {isPlanActive ? "Active Member" : "Expired"}
              </Badge>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5 font-mono">
              {member.memberCode} • {member.branch.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/owner/members/${member.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit Details
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Digital QR ID Pass */}
        <div className="space-y-6">
          <Card className="border-brand-300 bg-gradient-to-b from-brand-50/50 to-white text-center shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-center gap-2 text-brand-600 font-bold text-sm">
                <Dumbbell className="h-4 w-4" />
                <span>{org?.name || "FitFlow Gym"}</span>
              </div>
              <CardTitle className="text-xl mt-1">{member.name}</CardTitle>
              <p className="text-xs font-mono text-neutral-500">
                {member.memberCode}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Code Presentation Box */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 inline-block mx-auto shadow-sm">
                {/* SVG Visual representation of QR code */}
                <div className="h-44 w-44 bg-neutral-900 text-white rounded-lg flex flex-col items-center justify-center p-3 relative overflow-hidden">
                  <QrCode className="h-28 w-28 text-white" />
                  <div className="text-[9px] font-mono text-neutral-300 mt-1 truncate max-w-full">
                    {member.qrCode?.token?.slice(0, 20)}...
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-600 space-y-1">
                <div className="font-semibold text-neutral-900">
                  {member.membership?.customPlanName || member.membership?.plan?.name || "Standard Membership"}
                </div>
                <div>
                  Valid Until:{" "}
                  <strong>{expiryDate ? expiryDate.toLocaleDateString() : "N/A"}</strong>
                </div>
                {daysLeft > 0 && (
                  <div className="text-brand-600 font-medium text-[11px]">
                    ({daysLeft} days remaining)
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Contact & Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-neutral-700">
                <Phone className="h-4 w-4 text-neutral-400" />
                <span>{member.phone}</span>
              </div>
              {member.email && (
                <div className="flex items-center gap-2.5 text-neutral-700">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  <span>{member.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-neutral-700">
                <Building2 className="h-4 w-4 text-neutral-400" />
                <span>{member.branch.name}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Health, Plan & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health & Fitness Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fitness & Body Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <div className="text-xs text-neutral-500">Height</div>
                  <div className="text-lg font-bold text-neutral-900 mt-0.5">
                    {member.height ? `${member.height} cm` : "—"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <div className="text-xs text-neutral-500">Weight</div>
                  <div className="text-lg font-bold text-neutral-900 mt-0.5">
                    {member.weight ? `${member.weight} kg` : "—"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <div className="text-xs text-neutral-500">BMI</div>
                  <div className="text-lg font-bold text-neutral-900 mt-0.5">
                    {bmi || "—"}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <div className="text-xs text-neutral-500">Goal</div>
                  <div className="text-sm font-bold text-neutral-900 mt-0.5 capitalize truncate">
                    {member.fitnessGoal?.replace("_", " ") || "General"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attendance History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Visits & Scans</CardTitle>
                <CardDescription>Last 10 entry records</CardDescription>
              </div>
              <Badge variant="default">{member.attendances.length} visits logged</Badge>
            </CardHeader>
            <CardContent>
              {member.attendances.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-sm">
                  No attendance records yet for this member.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {member.attendances.map((att) => (
                    <div
                      key={att.id}
                      className="py-2.5 flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-neutral-400" />
                        <span className="font-medium text-neutral-800">
                          {new Date(att.entryTime).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-500">
                          {new Date(att.entryTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Badge variant="success" className="text-[10px]">
                          {att.method}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment & Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Receipts</CardTitle>
              <CardDescription>Billing history for this member</CardDescription>
            </CardHeader>
            <CardContent>
              {member.payments.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-sm">
                  No payments recorded.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {member.payments.map((p) => (
                    <div
                      key={p.id}
                      className="py-2.5 flex items-center justify-between text-sm"
                    >
                      <div>
                        <div className="font-semibold text-neutral-900">
                          {formatCurrency(Number(p.amount))}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {p.invoiceNumber || "Invoice"} • {p.method}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="success" className="text-[10px]">
                          {p.status}
                        </Badge>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          {new Date(p.paidAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

