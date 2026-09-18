"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Input } from "@/components/ui";
import { AlertCircle, CheckCircle2, QrCode } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";

  const [formData, setFormData] = useState({
    email: "",
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
      const res = await signIn("credentials", {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email address or password");
      } else {
        // Fetch session to obtain role
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const role = (session?.user as unknown as { role?: string })?.role?.toUpperCase();

        if (role === "SUPERADMIN") {
          router.push("/admin/dashboard");
        } else if (role === "RECEPTION") {
          router.push("/owner/scan");
        } else if (role === "TRAINER") {
          router.push("/owner/members");
        } else if (role === "MEMBER") {
          router.push("/member/dashboard");
        } else {
          router.push("/owner/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Welcome Back</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Sign in to manage your gym members & attendance
        </p>
      </div>

      {isRegistered && (
        <div className="mb-5 p-3.5 rounded-lg bg-success-50 border border-success/20 flex items-start gap-2.5 text-success-700 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-success-600" />
          <span>Your account has been created! Please log in with your credentials.</span>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 rounded-lg bg-danger-50 border border-danger/20 flex items-start gap-2.5 text-danger text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            placeholder="owner@gym.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-neutral-700">Password</span>
            <Link
              href="/password-reset"
              className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
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
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-neutral-100 flex flex-col gap-3">
        <Link href="/member-login" className="w-full">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>Member Quick Check-In / QR</span>
          </Button>
        </Link>

        <div className="text-center text-sm text-neutral-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}

