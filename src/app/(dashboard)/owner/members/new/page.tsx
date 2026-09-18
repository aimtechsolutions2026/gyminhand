"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, AlertCircle, Sparkles, Dumbbell } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Branch {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
}

export default function NewMemberPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPlanName, setCustomPlanName] = useState("");
  const [customDurationDays, setCustomDurationDays] = useState(30);
  const [customPrice, setCustomPrice] = useState("");
  const [overridePrice, setOverridePrice] = useState(false);

  const [formData, setFormData] = useState({
    branchId: "",
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "MALE",
    height: "",
    weight: "",
    fitnessGoal: "weight_loss",
    planId: "",
    paymentMethod: "UPI",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [branchRes, settingsRes] = await Promise.all([
          fetch("/api/gym/branches"),
          fetch("/api/gym/settings"),
        ]);

        const branchData = await branchRes.json();
        const settingsData = await settingsRes.json();

        if (branchData.success && branchData.data.length > 0) {
          setBranches(branchData.data);
          setFormData((prev) => ({ ...prev, branchId: branchData.data[0].id }));
        }

        if (settingsData.success && settingsData.data?.membershipPlans) {
          setPlans(settingsData.data.membershipPlans);
          if (settingsData.data.membershipPlans.length > 0) {
            setFormData((prev) => ({
              ...prev,
              planId: settingsData.data.membershipPlans[0].id,
            }));
          }
        }
      } catch {
        setError("Failed to load registration configuration");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Calculate BMI in real-time
  const heightM = parseFloat(formData.height) / 100;
  const weightKg = parseFloat(formData.weight);
  const bmi =
    heightM > 0 && weightKg > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : null;

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: "Underweight", variant: "warning" as const };
    if (val < 25) return { label: "Normal weight", variant: "success" as const };
    if (val < 30) return { label: "Overweight", variant: "warning" as const };
    return { label: "Obese", variant: "danger" as const };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        isCustom: formData.planId === "custom",
        customPlanName: formData.planId === "custom" ? customPlanName : undefined,
        customDurationDays: formData.planId === "custom" ? customDurationDays : undefined,
        customPrice:
          formData.planId === "custom" || overridePrice
            ? parseFloat(customPrice) || 0
            : undefined,
      };

      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to register member");
      }

      router.push(`/owner/members/${data.data.id}`);
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
    return <div className="text-center py-16 text-neutral-400">Loading registration form...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/owner/members">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Register New Member
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Create member profile, auto-issue digital QR pass, and record initial payment
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-danger-50 border border-danger/20 flex items-start gap-2.5 text-danger text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Branch & Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Gym Branch & Identity</CardTitle>
            <CardDescription>Select location and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Gym Branch
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  value={formData.branchId}
                  onChange={(e) =>
                    setFormData({ ...formData, branchId: e.target.value })
                  }
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Full Name *"
                id="name"
                placeholder="e.g. Vikram Malhotra"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number (10 digits) *"
                id="phone"
                type="tel"
                placeholder="9876543210"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                helperText="Used for unique member login and attendance confirmation"
              />

              <Input
                label="Email Address"
                id="email"
                type="email"
                placeholder="vikram@gmail.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Gender
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Fitness & Health Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">2. Fitness Metrics & Goal</CardTitle>
                <CardDescription>Track member baseline and BMI.</CardDescription>
              </div>
              {bmi && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 font-medium">BMI: {bmi}</span>
                  <Badge variant={getBmiCategory(parseFloat(bmi)).variant}>
                    {getBmiCategory(parseFloat(bmi)).label}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Height (cm)"
                id="height"
                type="number"
                placeholder="175"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
              />

              <Input
                label="Weight (kg)"
                id="weight"
                type="number"
                placeholder="75"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Primary Fitness Goal
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  value={formData.fitnessGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, fitnessGoal: e.target.value })
                  }
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain / Hypertrophy</option>
                  <option value="general_fitness">General Fitness & Endurance</option>
                  <option value="athletic_performance">Athletic Performance</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Membership Plan & Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Membership Subscription & Payment</CardTitle>
            <CardDescription>Select a standard gym package or configure a custom plan and fee for this member.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Select Membership Plan *
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 font-medium"
                  value={formData.planId}
                  onChange={(e) =>
                    setFormData({ ...formData, planId: e.target.value })
                  }
                  required
                >
                  <optgroup label="Standard Gym Plans">
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.durationDays} days) - {formatCurrency(p.price)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Custom Options">
                    <option value="custom">✨ Custom Membership Plan (Specify Price & Months)</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Payment Collection Method
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                >
                  <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash at Reception</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                </select>
              </div>
            </div>

            {/* Custom Plan Details Form */}
            {formData.planId === "custom" ? (
              <div className="p-4 bg-brand-50/50 border border-brand-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  Custom Plan Configuration
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Custom Plan Name *"
                    placeholder="e.g. 2 Months PT Special or Student Pass"
                    required
                    value={customPlanName}
                    onChange={(e) => setCustomPlanName(e.target.value)}
                  />

                  <Input
                    label="Custom Amount / Price (₹) *"
                    type="number"
                    min="0"
                    placeholder="e.g. 3500"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Plan Duration (Days) *
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[
                      { label: "1 Month", days: 30 },
                      { label: "2 Months", days: 60 },
                      { label: "3 Months", days: 90 },
                      { label: "6 Months", days: 180 },
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setCustomDurationDays(preset.days)}
                        className={`py-1.5 rounded-lg border text-xs font-semibold ${
                          customDurationDays === preset.days
                            ? "bg-brand-500 border-brand-500 text-white"
                            : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min="1"
                    required
                    placeholder="Or enter exact days..."
                    value={customDurationDays}
                    onChange={(e) => setCustomDurationDays(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>
            ) : (
              /* Standard Plan Custom Price Override option */
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overridePrice}
                    onChange={(e) => setOverridePrice(e.target.checked)}
                    className="rounded text-brand-500 focus:ring-brand-400"
                  />
                  <span>Apply custom discounted fee / custom amount for this member</span>
                </label>

                {overridePrice && (
                  <div className="mt-3 max-w-xs">
                    <Input
                      label="Override Fee (₹) *"
                      type="number"
                      min="0"
                      placeholder="e.g. 1200"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/owner/members">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="shadow-md shadow-brand-500/20"
          >
            <span>Complete Registration & Issue QR</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

