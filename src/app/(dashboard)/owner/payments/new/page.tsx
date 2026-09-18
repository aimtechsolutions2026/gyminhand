"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MemberOption {
  id: string;
  name: string;
  memberCode: string;
  phone: string;
}

interface PlanOption {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

export default function RecordPaymentPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customDuration, setCustomDuration] = useState("30");

  const [formData, setFormData] = useState({
    memberId: "",
    planId: "",
    amount: "",
    method: "UPI",
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [membersRes, plansRes] = await Promise.all([
          fetch("/api/members?limit=100"),
          fetch("/api/plans"),
        ]);

        const membersData = await membersRes.json();
        const plansData = await plansRes.json();

        if (membersData.success && membersData.data.members.length > 0) {
          setMembers(membersData.data.members);
          setFormData((prev) => ({ ...prev, memberId: membersData.data.members[0].id }));
        }

        if (plansData.success && plansData.data.length > 0) {
          setPlans(plansData.data);
          setFormData((prev) => ({
            ...prev,
            planId: plansData.data[0].id,
            amount: String(plansData.data[0].price),
          }));
        }
      } catch {
        setError("Failed to load members or plan data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handlePlanChange = (planId: string) => {
    const selected = plans.find((p) => p.id === planId);
    setFormData((prev) => ({
      ...prev,
      planId,
      amount: selected ? String(selected.price) : prev.amount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        durationDays:
          formData.planId === "custom" ? parseInt(customDuration, 10) || 30 : undefined,
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to record payment");
      }

      router.push(`/owner/payments/invoice/${data.data.paymentId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-16 text-neutral-400">Loading payment form...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/owner/payments">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Record Fee / Renewal Payment
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Collect membership fees, extend active subscription, and generate official receipt
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-danger-50 border border-danger/20 flex items-start gap-2.5 text-danger text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {members.length === 0 ? (
        <Card className="text-center py-12">
          <p className="font-semibold text-neutral-800">No members registered yet</p>
          <p className="text-xs text-neutral-500 mt-1">
            You must register a member before recording fee payments.
          </p>
          <Link href="/owner/members/new" className="inline-block mt-4">
            <Button size="sm">Register Member</Button>
          </Link>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Details</CardTitle>
            <CardDescription>
              Select member and plan duration. The expiry date will automatically extend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Select Member *
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  value={formData.memberId}
                  onChange={(e) =>
                    setFormData({ ...formData, memberId: e.target.value })
                  }
                  required
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.memberCode} - {m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Renewal / Membership Plan *
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
                  value={formData.planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  required
                >
                  <optgroup label="Standard Gym Packages">
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.durationDays} Days) - {formatCurrency(p.price)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Custom Override">
                    <option value="custom">✨ Custom Renewal (Specify Days & Amount)</option>
                  </optgroup>
                </select>
              </div>

              {formData.planId === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Custom Extension Duration (Days) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 30, 60, 90"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Amount Collected (₹) *"
                  id="amount"
                  type="number"
                  placeholder="1500"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-neutral-700">
                    Payment Method *
                  </label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    value={formData.method}
                    onChange={(e) =>
                      setFormData({ ...formData, method: e.target.value })
                    }
                  >
                    <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                    <option value="CASH">Cash at Reception</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="BANK_TRANSFER">Bank IMPS / RTGS</option>
                  </select>
                </div>
              </div>

              <Input
                label="Transaction Notes (Optional)"
                id="notes"
                placeholder="e.g. Paid via PhonePe reference ID 3948..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />

              <div className="flex items-center justify-end gap-3 pt-3">
                <Link href="/owner/payments">
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="shadow-md shadow-brand-500/20"
                >
                  Generate Invoice & Renew
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

