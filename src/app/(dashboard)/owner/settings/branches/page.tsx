"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, ArrowLeft, Users, AlertCircle, CheckCircle2 } from "lucide-react";

interface BranchItem {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  capacity?: number | null;
  _count?: {
    members: number;
    attendances: number;
  };
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    capacity: "200",
  });

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/gym/branches");
      const data = await res.json();
      if (data.success) {
        setBranches(data.data);
      }
    } catch {
      setError("Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/gym/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create branch");
      }

      setSuccess(`Branch "${formData.name}" created successfully!`);
      setFormData({ name: "", address: "", phone: "", capacity: "200" });
      setShowAddForm(false);
      fetchBranches();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create branch");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/owner/settings">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Branch Management
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Configure multi-location gym branches and capacity limits
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-danger-50 border border-danger/20 flex items-start gap-2.5 text-danger text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-success-50 border border-success/20 flex items-start gap-2.5 text-success-700 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-success-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-neutral-900">
          Gym Locations ({branches.length})
        </h2>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="gap-1.5 shadow-sm shadow-brand-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Branch</span>
          </Button>
        )}
      </div>

      {/* Add Branch Inline Form */}
      {showAddForm && (
        <Card className="border-brand-200 bg-brand-50/20">
          <CardHeader>
            <CardTitle className="text-base">Add New Branch Location</CardTitle>
            <CardDescription>
              Members and check-ins can be filtered by this branch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Branch Name"
                  id="name"
                  placeholder="e.g. Indiranagar Branch"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  label="Branch Phone"
                  id="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <Input
                  label="Address / Landmark"
                  id="address"
                  placeholder="e.g. 100 Feet Rd, 2nd Stage"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
                <Input
                  label="Floor Capacity"
                  id="capacity"
                  type="number"
                  placeholder="200"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmitting}
                  className="shadow-sm shadow-brand-500/20"
                >
                  Save Branch
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Branch List Cards */}
      {isLoading ? (
        <div className="text-center py-12 text-neutral-400">Loading branch locations...</div>
      ) : branches.length === 0 ? (
        <Card className="text-center py-12 text-neutral-500">
          <Building2 className="h-10 w-10 mx-auto text-neutral-400 mb-2" />
          <p className="font-semibold text-neutral-800">No branches registered</p>
          <p className="text-xs text-neutral-400 mt-1">Add your first location using the button above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {branches.map((branch) => (
            <Card key={branch.id} className="hover:border-neutral-300 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{branch.name}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {branch.address || "Main Gym Address"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">Active</Badge>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{branch._count?.members || 0} Registered Members</span>
                  </div>
                  <span>Max Capacity: {branch.capacity || 200}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

