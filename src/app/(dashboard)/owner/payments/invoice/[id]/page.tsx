import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowLeft, Printer, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await getTenantContext();
  if (!tenant) return null;

  const [payment, org] = await Promise.all([
    prisma.payment.findFirst({
      where: {
        id: params.id,
        organizationId: tenant.organizationId,
      },
      include: {
        member: {
          include: {
            branch: true,
            membership: { include: { plan: true } },
          },
        },
      },
    }),
    prisma.organization.findUnique({
      where: { id: tenant.organizationId },
    }),
  ]);

  if (!payment || !org) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/owner/payments">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Billing</span>
          </Button>
        </Link>
        <Link href={`/owner/members/${payment.member.id}`}>
          <Button variant="outline" size="sm">
            View Member Profile
          </Button>
        </Link>
      </div>

      {/* Official Invoice Sheet */}
      <Card className="p-8 bg-white border border-neutral-200 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Gym Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{org.name}</h2>
              <div className="text-xs text-neutral-500 mt-0.5">
                {org.address || "Official Fitness Center"}
              </div>
              {org.gstNumber && (
                <div className="text-xs text-neutral-500 font-mono mt-0.5">
                  GSTIN: {org.gstNumber}
                </div>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <Badge variant="success" className="text-xs font-bold uppercase tracking-wider">
              {payment.status}
            </Badge>
            <div className="text-sm font-mono font-semibold text-neutral-900 mt-1">
              {payment.invoiceNumber || "INV-RECEIPT"}
            </div>
            <div className="text-xs text-neutral-500">
              Date: {new Date(payment.paidAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Member & Location Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-neutral-200 text-sm">
          <div>
            <span className="text-xs font-semibold uppercase text-neutral-400 block mb-1">
              Billed To
            </span>
            <div className="font-bold text-neutral-900">{payment.member.name}</div>
            <div className="text-xs font-mono text-neutral-500 mt-0.5">
              Member ID: {payment.member.memberCode}
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">
              Phone: {payment.member.phone}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-semibold uppercase text-neutral-400 block mb-1">
              Gym Facility Branch
            </span>
            <div className="font-semibold text-neutral-800">{payment.member.branch.name}</div>
            <div className="text-xs text-neutral-500 mt-0.5">
              {payment.member.branch.address || "Main Gym Floor"}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6 border-b border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase text-neutral-500 border-b border-neutral-100 pb-2">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-center">Duration</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr>
                <td className="py-3">
                  <div className="font-semibold text-neutral-900">
                    {payment.notes || "Gym Membership Subscription"}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Full access to gym floor, cardio equipment & locker facilities
                  </div>
                </td>
                <td className="py-3 text-center text-xs text-neutral-600">
                  {payment.member.membership?.customDurationDays || payment.member.membership?.plan?.durationDays || 30} Days
                </td>
                <td className="py-3 text-right font-bold text-neutral-900">
                  {formatCurrency(Number(payment.amount))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-neutral-500">
            <div>Payment Method: <strong>{payment.method}</strong></div>
            <div className="mt-0.5">Generated via FitFlow Gym Operating System</div>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right">
            <div className="text-xs text-neutral-400 uppercase font-semibold">Total Paid</div>
            <div className="text-2xl font-extrabold text-brand-600 mt-0.5">
              {formatCurrency(Number(payment.amount))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

