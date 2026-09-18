"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Layers,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GymOrg {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  tier: "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  isActive: boolean;
  subscriptionPlan: string;
  subscriptionExpiresAt: string | null;
  subscriptionStatus: string;
  createdAt: string;
  users: Array<{ id: string; name: string; email: string; phone: string | null }>;
  branches: Array<{ id: string; name: string }>;
  _count: {
    members: number;
    attendances: number;
    payments: number;
  };
}

export default function AdminDashboardPage() {
  const [gyms, setGyms] = useState<GymOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Subscription Edit Modal State
  const [selectedGym, setSelectedGym] = useState<GymOrg | null>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subFormData, setSubFormData] = useState({
    subscriptionPlan: "SILVER" as "FREE" | "SILVER" | "GOLD" | "CUSTOM",
    subscriptionDays: 30,
    isActive: true,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tier: "STARTER" as "STARTER" | "PROFESSIONAL" | "ENTERPRISE",
    subscriptionPlan: "SILVER" as "FREE" | "SILVER" | "GOLD" | "CUSTOM",
    subscriptionDays: 30,
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
  });

  const fetchGyms = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/gyms");
      const data = await res.json();
      if (data.success) {
        setGyms(data.data);
      }
    } catch (err) {
      console.error("Failed to load organizations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/gyms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message || `Gym "${formData.name}" onboarded successfully!`,
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          tier: "STARTER",
          subscriptionPlan: "SILVER",
          subscriptionDays: 30,
          ownerName: "",
          ownerEmail: "",
          ownerPassword: "",
        });
        setIsModalOpen(false);
        fetchGyms();
      } else {
        setFeedback({
          type: "error",
          message: data.error?.message || "Failed to onboard new gym",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Network error occurred while creating gym",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleGymActive = async (gym: GymOrg) => {
    const nextStatus = !gym.isActive;
    try {
      const res = await fetch("/api/admin/gyms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: gym.id,
          isActive: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGyms((prev) =>
          prev.map((g) => (g.id === gym.id ? { ...g, isActive: nextStatus } : g))
        );
        setFeedback({
          type: "success",
          message: `Gym "${gym.name}" is now ${nextStatus ? "ACTIVE" : "DEACTIVATED (Access Locked Out)"}`,
        });
      } else {
        alert(data.error?.message || "Failed to update gym status");
      }
    } catch {
      alert("Network error updating gym status");
    }
  };

  const openSubscriptionModal = (gym: GymOrg) => {
    setSelectedGym(gym);
    setSubFormData({
      subscriptionPlan: (gym.subscriptionPlan as "FREE" | "SILVER" | "GOLD" | "CUSTOM") || "SILVER",
      subscriptionDays: 30,
      isActive: gym.isActive,
    });
    setIsSubModalOpen(true);
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGym) return;
    setFormSubmitting(true);

    try {
      const res = await fetch("/api/admin/gyms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedGym.id,
          subscriptionPlan: subFormData.subscriptionPlan,
          subscriptionDays: subFormData.subscriptionDays,
          isActive: subFormData.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          message: `Subscription updated for ${selectedGym.name}! Valid for next ${subFormData.subscriptionDays} days.`,
        });
        setIsSubModalOpen(false);
        fetchGyms();
      } else {
        alert(data.error?.message || "Failed to update subscription");
      }
    } catch {
      alert("Network error updating subscription");
    } finally {
      setFormSubmitting(false);
    }
  };

  const totalMembers = gyms.reduce((acc, g) => acc + (g._count?.members || 0), 0);
  const totalAttendances = gyms.reduce((acc, g) => acc + (g._count?.attendances || 0), 0);
  const activeGymsCount = gyms.filter((g) => g.isActive).length;

  const tierMRR = gyms.reduce((acc, g) => {
    if (!g.isActive) return acc;
    const rate = g.tier === "ENTERPRISE" ? 9999 : g.tier === "PROFESSIONAL" ? 4999 : 1999;
    return acc + rate;
  }, 0);

  const filteredGyms = gyms.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.users[0]?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.users[0]?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">
            <ShieldCheck className="h-4 w-4" />
            FitFlow Master Control
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Gyms, Subscriptions & Tenant Directory
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Provision gym owners, set active days validity, manage platform subscription tiers, and control access lockouts.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Onboard New Gym
        </Button>
      </div>

      {/* Global Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
              : "bg-red-950/40 border-red-800/50 text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Total Gyms (Tenants)</span>
            <Building2 className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">{gyms.length}</div>
          <div className="mt-1 text-xs text-neutral-400 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">{activeGymsCount} Active</span>
            <span>• {gyms.length - activeGymsCount} Deactivated</span>
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Network Members</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">{totalMembers}</div>
          <div className="mt-1 text-xs text-neutral-400">Total registered gym lifters</div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Platform SaaS MRR</span>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            ₹{tierMRR.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-emerald-400 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" />
            <span>Active tenant subscription revenue</span>
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Total Attendance Scans</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">{totalAttendances}</div>
          <div className="mt-1 text-xs text-neutral-400">Multi-branch QR validations</div>
        </div>
      </div>

      {/* Gym Directory List */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Tenants & Platform Subscriptions</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Control operational status, days validity till active, and lockout permissions
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search gym, owner, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 h-9 text-xs"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-neutral-400 text-sm">
            Loading tenant directory...
          </div>
        ) : filteredGyms.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 text-sm">
            No gyms found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-950/60 text-xs uppercase text-neutral-400 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">Gym Organization</th>
                  <th className="px-5 py-3.5">Platform Status</th>
                  <th className="px-5 py-3.5">SaaS Plan & Expiry</th>
                  <th className="px-5 py-3.5">Owner Account</th>
                  <th className="px-5 py-3.5">Branches</th>
                  <th className="px-5 py-3.5">Members</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredGyms.map((gym) => {
                  const owner = gym.users[0];
                  const expiry = gym.subscriptionExpiresAt ? new Date(gym.subscriptionExpiresAt) : null;
                  const now = new Date();
                  const isExpired = expiry ? expiry.getTime() < now.getTime() : false;
                  const daysLeft = expiry
                    ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <tr
                      key={gym.id}
                      className="hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{gym.name}</div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-neutral-500" /> {gym.email}
                          </span>
                          {gym.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-neutral-500" /> {gym.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleGymActive(gym)}
                            className={`p-1 rounded-lg transition-colors ${
                              gym.isActive ? "text-emerald-400 hover:bg-emerald-950/40" : "text-neutral-500 hover:bg-neutral-800"
                            }`}
                            title={gym.isActive ? "Click to Deactivate (Lockout)" : "Click to Activate"}
                          >
                            {gym.isActive ? (
                              <ToggleRight className="h-6 w-6 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-neutral-500" />
                            )}
                          </button>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              gym.isActive
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                : "bg-red-950/80 text-red-400 border-red-800"
                            }`}
                          >
                            {gym.isActive ? "ACTIVE" : "DEACTIVATED"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                gym.subscriptionPlan === "GOLD"
                                  ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                                  : gym.subscriptionPlan === "SILVER"
                                  ? "bg-blue-950/80 text-blue-300 border border-blue-800"
                                  : gym.subscriptionPlan === "CUSTOM"
                                  ? "bg-purple-950/80 text-purple-300 border border-purple-800"
                                  : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                              }`}
                            >
                              {gym.subscriptionPlan || "FREE"}
                            </span>

                            <span
                              className={`text-[11px] font-semibold ${
                                isExpired
                                  ? "text-red-400"
                                  : daysLeft && daysLeft <= 7
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              {isExpired
                                ? "Expired"
                                : daysLeft !== null
                                ? `${daysLeft}d left`
                                : "Unlimited"}
                            </span>
                          </div>

                          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-neutral-500" />
                            <span>
                              Valid till: {expiry ? expiry.toLocaleDateString() : "No expiry set"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {owner ? (
                          <div>
                            <div className="font-medium text-neutral-200">{owner.name}</div>
                            <div className="text-xs text-red-400">{owner.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500 italic">No Owner Assigned</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {gym.branches.length} Branch{gym.branches.length > 1 ? "es" : ""}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-semibold text-neutral-200">
                        {gym._count?.members || 0}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openSubscriptionModal(gym)}
                          className="h-8 text-xs border-neutral-700 bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700 hover:text-white"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Manage Sub
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subscription Management Modal */}
      {isSubModalOpen && selectedGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Manage Platform Subscription</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{selectedGym.name}</p>
              </div>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubscription} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 font-medium mb-1 block">
                  Subscription Model / Plan
                </label>
                <select
                  value={subFormData.subscriptionPlan}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      subscriptionPlan: e.target.value as "FREE" | "SILVER" | "GOLD" | "CUSTOM",
                    })
                  }
                  className="w-full h-9 rounded-md bg-neutral-950 border border-neutral-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="FREE">Free Trial (14 Days standard)</option>
                  <option value="SILVER">Silver Package (₹1,999/mo)</option>
                  <option value="GOLD">Gold Enterprise (₹14,999/yr)</option>
                  <option value="CUSTOM">Custom Plan (Specify Days)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-medium mb-1 block">
                  Active Validity Days (Extend by)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[14, 30, 90, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSubFormData({ ...subFormData, subscriptionDays: d })}
                      className={`py-1.5 rounded-lg border text-xs font-semibold ${
                        subFormData.subscriptionDays === d
                          ? "bg-red-600 border-red-500 text-white"
                          : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min="1"
                  placeholder="Or enter custom number of days..."
                  value={subFormData.subscriptionDays}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, subscriptionDays: parseInt(e.target.value, 10) || 1 })
                  }
                  className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
                />
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                <div className="text-neutral-400 font-medium">Subscription Policy:</div>
                <p className="text-neutral-500 leading-relaxed">
                  When a gym&apos;s subscription expires or is deactivated, all associated gym owners,
                  managers, trainers, receptionists, and members are immediately redirected to the
                  suspension lock-screen.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubModalOpen(false)}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {formSubmitting ? "Updating..." : "Save & Apply Days"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard Gym Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Onboard New Gym & Owner</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Provisions isolated database tenant, initial facility branch, and gym owner credentials.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGym} className="space-y-4 text-sm">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
                1. Gym Organization Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-300 font-medium mb-1 block">Gym Name *</label>
                  <Input
                    required
                    placeholder="e.g. Iron Forge Fitness"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 font-medium mb-1 block">
                    Gym Official Email *
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="contact@ironforge.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-300 font-medium mb-1 block">Phone</label>
                  <Input
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 font-medium mb-1 block">
                    Subscription Model
                  </label>
                  <select
                    value={formData.subscriptionPlan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subscriptionPlan: e.target.value as "FREE" | "SILVER" | "GOLD" | "CUSTOM",
                      })
                    }
                    className="w-full h-9 rounded-md bg-neutral-950 border border-neutral-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="FREE">Free Trial</option>
                    <option value="SILVER">Silver Tier</option>
                    <option value="GOLD">Gold Tier</option>
                    <option value="CUSTOM">Custom Plan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-300 font-medium mb-1 block">
                    Active Days Validity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.subscriptionDays}
                    onChange={(e) =>
                      setFormData({ ...formData, subscriptionDays: parseInt(e.target.value, 10) || 30 })
                    }
                    className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium mb-1 block">
                  Location / Address
                </label>
                <Input
                  placeholder="e.g. 5th Block, Koramangala, Bengaluru"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
                />
              </div>

              <div className="pt-2 text-xs font-bold text-red-400 uppercase tracking-wider border-t border-neutral-800">
                2. Gym Owner Admin Credentials
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-medium mb-1 block">
                  Owner Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Vikramaditya Rathore"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-300 font-medium mb-1 block">
                    Owner Login Email *
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="owner@ironforge.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 font-medium mb-1 block">
                    Initial Password *
                  </label>
                  <Input
                    required
                    type="password"
                    placeholder="Min 8 characters"
                    value={formData.ownerPassword}
                    onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                    className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30"
                >
                  {formSubmitting ? "Provisioning Tenant..." : "Create Gym & Owner"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
