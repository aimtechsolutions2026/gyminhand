import Link from "next/link";
import { getTenantContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileText,
  DollarSign,
  Wallet,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentsLedgerPage() {
  const tenant = await getTenantContext();
  if (!tenant) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthPaymentsAggregate, allPayments, plans] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        organizationId: tenant.organizationId,
        status: "PAID",
        paidAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.findMany({
      where: { organizationId: tenant.organizationId },
      include: {
        member: {
          select: { id: true, name: true, memberCode: true, phone: true },
        },
      },
      orderBy: { paidAt: "desc" },
      take: 50,
    }),
    prisma.membershipPlan.findMany({
      where: { organizationId: tenant.organizationId, isActive: true },
      include: { _count: { select: { memberships: true } } },
    }),
  ]);

  const monthRevenue = Number(monthPaymentsAggregate._sum.amount || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Billing & Invoices
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Track membership payments, dues, and GST-ready invoices
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/owner/payments/new">
            <Button size="sm" className="gap-1.5 shadow-sm shadow-brand-500/20">
              <Plus className="h-4 w-4" />
              <span>Record Payment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              This Month Collection
            </span>
            <TrendingUp className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">
              {formatCurrency(monthRevenue)}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {monthPaymentsAggregate._count} transaction(s) in {now.toLocaleString("default", { month: "long" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Active Plans
            </span>
            <CreditCard className="h-4 w-4 text-brand-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{plans.length}</div>
            <p className="text-xs text-neutral-500 mt-0.5">Configured duration tiers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Payment Methods
            </span>
            <Wallet className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-neutral-900 mt-1">UPI, Cash & Card</div>
            <p className="text-xs text-neutral-500 mt-0.5">Instant receipts generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Quick View */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Gym Membership Plans</CardTitle>
            <CardDescription>Pricing structures offered to members</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-sm text-neutral-900">{plan.name}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{plan.durationDays} Days Duration</div>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-200/60">
                  <span className="font-bold text-base text-brand-600">
                    {formatCurrency(Number(plan.price))}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {plan._count.memberships} active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Ledger Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Transaction Ledger</CardTitle>
            <CardDescription>All collected payments and renewal invoices</CardDescription>
          </div>
          <Badge variant="default">{allPayments.length} Invoices</Badge>
        </CardHeader>
        <CardContent>
          {allPayments.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Receipt className="h-10 w-10 mx-auto text-neutral-300 mb-2" />
              <p className="font-semibold text-neutral-700">No payment records found</p>
              <p className="text-xs text-neutral-400 mt-1">
                Record new payments to generate invoices and update member subscriptions.
              </p>
              <Link href="/owner/payments/new" className="inline-block mt-4">
                <Button size="sm">Record First Payment</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs font-semibold uppercase text-neutral-500">
                    <th className="pb-3 pr-4">Invoice #</th>
                    <th className="pb-3 px-4">Member</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 px-4">Method</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {allPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3 pr-4 font-mono font-medium text-brand-600 text-xs">
                        <Link href={`/owner/payments/invoice/${p.id}`} className="hover:underline">
                          {p.invoiceNumber || "INV-RECEIPT"}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/owner/members/${p.member.id}`}
                          className="font-medium text-neutral-900 hover:text-brand-600 transition-colors"
                        >
                          {p.member.name}
                        </Link>
                        <div className="text-xs font-mono text-neutral-400">
                          {p.member.memberCode}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        {formatCurrency(Number(p.amount))}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[11px]">
                          {p.method}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" className="text-[11px]">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 pl-4 text-right text-xs text-neutral-500">
                        {new Date(p.paidAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

