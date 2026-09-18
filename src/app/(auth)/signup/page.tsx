"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Building2, User, Mail, Phone, Lock, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gymName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create account");
      }

      // Successfully registered, redirect to login with query param
      router.push("/login?registered=true");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-neutral-900">
          Create Gym Account
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Start your 30-day free trial. No credit card required.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-lg bg-danger-50 border border-danger/20 flex items-start gap-2.5 text-danger text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Gym Name"
            id="gymName"
            name="gymName"
            placeholder="e.g. Iron Fitness Hub"
            required
            value={formData.gymName}
            onChange={handleChange}
          />
        </div>

        <div>
          <Input
            label="Owner / Manager Name"
            id="name"
            name="name"
            placeholder="e.g. Amit Sharma"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            placeholder="amit@ironfitness.in"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <Input
            label="Phone Number"
            id="phone"
            name="phone"
            type="tel"
            placeholder="9876543210"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="Min. 8 characters, 1 uppercase, 1 number"
            required
            helperText="Must be 8+ characters with at least 1 uppercase and 1 number"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-6 shadow-md shadow-brand-500/20"
          size="lg"
          isLoading={isLoading}
        >
          Create Gym Account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-500 hover:text-brand-600 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

