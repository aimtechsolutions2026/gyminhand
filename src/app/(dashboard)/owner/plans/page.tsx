"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Search,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  durationDays: number;
  price: number | string;
  isActive: boolean;
  _count?: {
    memberships: number;
  };
}

export default function OwnerPlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    durationDays: 30,
    price: "",
    description: "",
  });

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      durationDays: 30,
      price: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      durationDays: plan.durationDays,
      price: plan.price.toString(),
      description: plan.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (editingPlan) {
        // Update plan
        const res = await fetch(`/api/plans/${editingPlan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            durationDays: formData.durationDays,
            price: parseFloat(formData.price),
            description: formData.description,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setFeedback({ type: "success", message: `Plan "${formData.name}" updated successfully!` });
          setIsModalOpen(false);
          fetchPlans();
        } else {
          setFeedback({ type: "error", message: data.error?.message || "Failed to update plan" });
        }
      } else {
        // Create plan
        const res = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            durationDays: formData.durationDays,
            price: parseFloat(formData.price),
            description: formData.description,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setFeedback({ type: "success", message: `Plan "${formData.name}" created successfully!` });
          setIsModalOpen(false);
          fetchPlans();
        } else {
          setFeedback({ type: "error", message: data.error?.message || "Failed to create plan" });
        }
      }
    } catch {
      setFeedback({ type: "error", message: "Network error saving plan" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePlanActive = async (plan: MembershipPlan) => {
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setPlans((prev) =>
          prev.map((p) => (p.id === plan.id ? { ...p, isActive: !plan.isActive } : p))
        );
      } else {
        alert(data.error?.message || "Failed to toggle plan status");
      }
    } catch {
      alert("Network error updating plan");
    }
  };

  const activePlansCount = plans.filter((p) => p.isActive).length;
  const totalSubscribers = plans.reduce((acc, p) => acc + (p._count?.memberships || 0), 0);

  const filteredPlans = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <CreditCard className="h-4 w-4" />
            Gym Subscription Packages
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Membership Plans Management
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Create standard packages for your members, customize pricing, and manage membership durations.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="flex items-center gap-2 self-start sm:self-auto bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20"
        >
          <Plus className="h-4 w-4" />
          Create Membership Plan
        </Button>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            feedback.type === "success"
              ? "bg-success-50 border-success/30 text-success-700"
              : "bg-danger-50 border-danger/30 text-danger"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-danger" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-medium text-neutral-500">Active Membership Plans</div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">{activePlansCount}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Available for new member enrollments</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-medium text-neutral-500">Subscribed Members</div>
          <div className="mt-2 text-2xl font-bold text-brand-600">{totalSubscribers}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Active recurring athletes</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-medium text-neutral-500">Flexibility Moat</div>
          <div className="mt-2 text-sm font-semibold text-emerald-700">Custom Rates Allowed</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Staff can also assign custom months/fees on registration
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Configured Plans</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Plans configured here immediately appear on the member registration wizard and invoice generator
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search plan name or perks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-neutral-400 text-sm">Loading plans...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 text-sm">
            No membership plans found. Click &quot;Create Membership Plan&quot; to configure your first package.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
            {filteredPlans.map((plan) => {
              const months = Math.round((plan.durationDays / 30) * 10) / 10;

              return (
                <div
                  key={plan.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    plan.isActive
                      ? "border-neutral-200 bg-white hover:border-brand-300 hover:shadow-md"
                      : "border-neutral-200/60 bg-neutral-50/70 opacity-70"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                        {plan.durationDays} Days ({months} {months === 1 ? "Month" : "Months"})
                      </span>

                      <button
                        onClick={() => handleTogglePlanActive(plan)}
                        title={plan.isActive ? "Deactivate Plan" : "Activate Plan"}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        {plan.isActive ? (
                          <ToggleRight className="h-6 w-6 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-neutral-400" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mt-3">{plan.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1 min-h-[36px] line-clamp-2">
                      {plan.description || "Standard gym membership access."}
                    </p>

                    <div className="mt-4 pt-4 border-t border-neutral-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-black text-neutral-900">
                          ₹{Number(plan.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-neutral-400 ml-1">/ cycle</span>
                      </div>

                      <div className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{plan._count?.memberships || 0} enrolled</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-100 flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(plan)}
                      className="h-8 text-xs flex items-center gap-1 border-neutral-300 hover:bg-neutral-50"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Plan</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {editingPlan ? "Edit Membership Plan" : "Create New Membership Plan"}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Set membership duration and subscription fees for your lifters
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-700 font-medium mb-1 block">Plan Name *</label>
                <Input
                  required
                  placeholder="e.g. 3 Months Silver or Couples Annual"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="text-neutral-700 font-medium mb-1 block">
                  Duration (Days) *
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { label: "1 Month", days: 30 },
                    { label: "3 Months", days: 90 },
                    { label: "6 Months", days: 180 },
                    { label: "1 Year", days: 365 },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => setFormData({ ...formData, durationDays: preset.days })}
                      className={`py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        formData.durationDays === preset.days
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
                  placeholder="Or enter custom days..."
                  value={formData.durationDays}
                  onChange={(e) =>
                    setFormData({ ...formData, durationDays: parseInt(e.target.value, 10) || 1 })
                  }
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="text-neutral-700 font-medium mb-1 block">Price (₹) *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="e.g. 2999"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="text-neutral-700 font-medium mb-1 block">Description & Perks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cardio + Strength access, locker, 1 free trainer consultation"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-500 hover:bg-brand-600 text-white text-xs"
                >
                  {isSubmitting ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

