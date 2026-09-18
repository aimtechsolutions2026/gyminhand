"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Users, Phone, Mail, CheckCircle2, AlertCircle } from "lucide-react";

interface Trainer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  specialty?: string | null;
  _count?: { assignedMembers: number };
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    specialty: "Strength & Conditioning",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTrainers = async () => {
    try {
      const res = await fetch("/api/trainers");
      const data = await res.json();
      if (data.success) {
        setTrainers(data.data);
      }
    } catch {
      console.error("Failed to load trainers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: "", phone: "", email: "", specialty: "Strength & Conditioning" });
        setShowAddForm(false);
        fetchTrainers();
      }
    } catch {
      alert("Failed to create trainer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Trainer Management
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Certified coaches, member assignments, and workout coordination
          </p>
        </div>

        {!showAddForm && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5 shadow-sm shadow-brand-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Trainer</span>
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="border-brand-200 bg-brand-50/20">
          <CardHeader>
            <CardTitle className="text-base">Register Gym Trainer / Coach</CardTitle>
            <CardDescription>Assign up to 20 members per trainer for coaching.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTrainer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Trainer Name *"
                  id="name"
                  placeholder="e.g. Rahul Verma"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label="Phone Number *"
                  id="phone"
                  placeholder="9876543210"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <Input
                  label="Email (Optional)"
                  id="email"
                  type="email"
                  placeholder="rahul@gym.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Input
                  label="Fitness Specialty"
                  id="specialty"
                  placeholder="e.g. Hypertrophy, Crossfit, Fat Loss"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
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
                  Save Trainer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-neutral-400">Loading trainers...</div>
      ) : trainers.length === 0 ? (
        <Card className="text-center py-16 text-neutral-500">
          <Dumbbell className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
          <p className="font-bold text-neutral-900 text-lg">No trainers registered</p>
          <p className="text-xs text-neutral-400 mt-1">
            Add fitness coaches to assign workout and diet programs to members.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trainers.map((t) => (
            <Card key={t.id} className="p-4 hover:border-neutral-300 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-base text-neutral-900">{t.name}</div>
                  <Badge variant="default" className="text-[10px] mt-1">
                    {t.specialty || "Fitness Coach"}
                  </Badge>
                </div>
                <Badge variant="success" className="text-[10px]">Active</Badge>
              </div>

              <div className="space-y-1 mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{t.phone}</span>
                </div>
                {t.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{t.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100">
                <span>Assigned Members:</span>
                <span className="font-bold text-neutral-900">
                  {t._count?.assignedMembers || 0} / 20
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

