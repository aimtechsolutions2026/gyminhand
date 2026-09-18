"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Phone,
  Lock,
  Search,
  Key,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "OWNER" | "MANAGER" | "TRAINER" | "RECEPTION";
  isActive: boolean;
  branchId: string | null;
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
}

export default function GymStaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "RECEPTION" as "MANAGER" | "TRAINER" | "RECEPTION",
    branchId: "",
    password: "",
    specialty: "Crossfit, Strength & Conditioning",
  });

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/gym/staff");
      const data = await res.json();
      if (data.success) {
        setStaff(data.data.staff);
        setBranches(data.data.branches);
        if (data.data.branches.length > 0 && !formData.branchId) {
          setFormData((prev) => ({ ...prev, branchId: data.data.branches[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/gym/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message || `Staff member "${formData.name}" added successfully!`,
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "RECEPTION",
          branchId: branches[0]?.id || "",
          password: "",
          specialty: "Crossfit, Strength & Conditioning",
        });
        setIsModalOpen(false);
        fetchStaff();
      } else {
        setFeedback({
          type: "error",
          message: data.error?.message || "Failed to add staff member",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Network error occurred while creating staff member",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/gym/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          isActive: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === userId ? { ...s, isActive: !currentStatus } : s))
        );
      } else {
        alert(data.error?.message || "Failed to update staff status");
      }
    } catch {
      alert("Network error updating status");
    }
  };

  const handleRoleChange = async (userId: string, newRole: "MANAGER" | "TRAINER" | "RECEPTION") => {
    try {
      const res = await fetch("/api/gym/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === userId ? { ...s, role: newRole } : s))
        );
      } else {
        alert(data.error?.message || "Failed to update role");
      }
    } catch {
      alert("Network error updating role");
    }
  };

  const ownersCount = staff.filter((s) => s.role === "OWNER").length;
  const managersCount = staff.filter((s) => s.role === "MANAGER").length;
  const trainersCount = staff.filter((s) => s.role === "TRAINER").length;
  const receptionCount = staff.filter((s) => s.role === "RECEPTION").length;

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Shield className="h-4 w-4" />
            Role-Based Access Control (RBAC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Staff & Roles Management
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Add team members, assign facility branches, and customize sidebar permissions.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 self-start sm:self-auto bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20"
        >
          <UserPlus className="h-4 w-4" />
          Add Staff Member
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-neutral-500">Gym Owners</div>
          <div className="mt-2 text-2xl font-bold text-purple-700">{ownersCount}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Full Root Control</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-neutral-500">Managers</div>
          <div className="mt-2 text-2xl font-bold text-blue-600">{managersCount}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Operations & CRM</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-neutral-500">Trainers</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{trainersCount}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Workouts & Diet Plans</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-neutral-500">Front Desk / Reception</div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{receptionCount}</div>
          <div className="text-[11px] text-neutral-400 mt-1">QR Kiosk Check-In</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Gym Team Directory</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Control active credentials and toggle sidebar feature visibility
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-neutral-500 text-sm">Loading staff members...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 text-sm">
            No staff accounts found. Click &quot;Add Staff Member&quot; to invite your first employee.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-700">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3.5">Staff Member</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Branch Facility</th>
                  <th className="px-5 py-3.5">Sidebar Permissions</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredStaff.map((member) => {
                  const branchName =
                    branches.find((b) => b.id === member.branchId)?.name || "Main Facility";

                  return (
                    <tr key={member.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-neutral-900">{member.name}</div>
                        <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-neutral-400" /> {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-neutral-400" /> {member.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {member.role === "OWNER" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            OWNER
                          </span>
                        ) : (
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(
                                member.id,
                                e.target.value as "MANAGER" | "TRAINER" | "RECEPTION"
                              )
                            }
                            className={`text-xs font-bold px-2 py-1 rounded-md border focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer ${
                              member.role === "MANAGER"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : member.role === "TRAINER"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            <option value="MANAGER">MANAGER</option>
                            <option value="TRAINER">TRAINER</option>
                            <option value="RECEPTION">RECEPTION</option>
                          </select>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-neutral-600">
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{branchName}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-neutral-500">
                        {member.role === "OWNER" && (
                          <span className="text-purple-700 font-medium">
                            Full Admin: Overview, Members, Billing, CRM, Settings, Staff
                          </span>
                        )}
                        {member.role === "MANAGER" && (
                          <span className="text-blue-700 font-medium">
                            Operations: Overview, Members, Scanner, Billing, CRM, Staff
                          </span>
                        )}
                        {member.role === "TRAINER" && (
                          <span className="text-emerald-700 font-medium">
                            Fitness: Member Roster, Attendance, Workouts & Diets
                          </span>
                        )}
                        {member.role === "RECEPTION" && (
                          <span className="text-amber-700 font-medium">
                            Front Desk: QR Scanner, Attendance, Members, Payments
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.isActive
                              ? "bg-success-50 text-success-700 border border-success/20"
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.isActive ? "bg-success-600" : "bg-neutral-400"
                            }`}
                          />
                          {member.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {member.role !== "OWNER" && (
                          <button
                            onClick={() => handleToggleStatus(member.id, member.isActive)}
                            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                              member.isActive
                                ? "text-danger hover:bg-danger-50"
                                : "text-success-600 hover:bg-success-50"
                            }`}
                            title={member.isActive ? "Deactivate Account" : "Activate Account"}
                          >
                            {member.isActive ? (
                              <div className="flex items-center gap-1">
                                <ToggleRight className="h-5 w-5 text-emerald-600" />
                                <span className="text-[11px] text-neutral-500">Disable</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <ToggleLeft className="h-5 w-5 text-neutral-400" />
                                <span className="text-[11px] text-neutral-500">Enable</span>
                              </div>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Explainer Card */}
      <div className="bg-brand-50/50 border border-brand-200/60 rounded-xl p-5">
        <h3 className="text-sm font-bold text-brand-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" />
          How FitFlow RBAC Adapts The Sidebar Navigation
        </h3>
        <p className="text-xs text-brand-700 mt-1 leading-relaxed">
          When any team member signs in with their credentials, FitFlow automatically adapts their
          sidebar navigation according to their assigned role. Receptionists see a streamlined
          front-desk view focused on QR scanning and immediate check-ins, while Gym Owners maintain
          full control over membership plans, financial reports, and team permissions.
        </p>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Add New Team Member</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Create credentials and assign role-based permissions
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-neutral-700 font-medium mb-1 block">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-700 font-medium mb-1 block">Email Address *</label>
                  <Input
                    required
                    type="email"
                    placeholder="ramesh@fitflow.app"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-700 font-medium mb-1 block">Phone</label>
                  <Input
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-700 font-medium mb-1 block">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as "MANAGER" | "TRAINER" | "RECEPTION",
                      })
                    }
                    className="w-full h-9 rounded-md border border-neutral-300 px-3 text-xs bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="RECEPTION">Reception / Front Desk</option>
                    <option value="TRAINER">Trainer</option>
                    <option value="MANAGER">Gym Manager</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-700 font-medium mb-1 block">
                    Facility Branch *
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full h-9 rounded-md border border-neutral-300 px-3 text-xs bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.role === "TRAINER" && (
                <div>
                  <label className="text-xs text-neutral-700 font-medium mb-1 block">
                    Specialty / Certifications
                  </label>
                  <Input
                    placeholder="e.g. Crossfit L2, Hypertrophy, Rehab"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-neutral-700 font-medium mb-1 block">
                  Initial Password *
                </label>
                <Input
                  required
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-1">
                <div className="font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-neutral-500" />
                  Role Access Summary:
                </div>
                <div className="text-neutral-500">
                  {formData.role === "MANAGER" &&
                    "Manager will have access to Members, Check-In, Invoicing, Churn CRM, and Staff management."}
                  {formData.role === "TRAINER" &&
                    "Trainer will have access to Member Profiles, Attendance Logs, and Diet & Workout Builder."}
                  {formData.role === "RECEPTION" &&
                    "Receptionist will have access to Fast QR Kiosk Scanner, Member Check-In, and Bill Payments."}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-neutral-100">
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
                  {isSubmitting ? "Creating..." : "Add Staff Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

