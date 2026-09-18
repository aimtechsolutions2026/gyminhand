"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { QrCode, Phone, AlertCircle, ArrowLeft } from "lucide-react";

export default function MemberLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError("Please enter your registered phone number or Member ID");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/members/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanIdentifier }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Member not found. Check with gym reception.");
      }

      // Route to member mobile app
      router.push(`/member/dashboard?memberId=${data.data.memberId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Member verification failed. Please ask front desk.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mb-3">
          <QrCode className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Member Portal</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your 10-digit phone number or Member ID
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
            label="Phone Number or Member ID"
            id="identifier"
            name="identifier"
            placeholder="e.g. 9876543210 or GYM-HQ-000001"
            required
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setError(null);
            }}
            helperText="No password required. Phone number must match your gym registration."
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-4 shadow-md shadow-brand-500/20"
          size="lg"
          isLoading={isLoading}
        >
          Access Member Pass
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Staff & Owner Login</span>
        </Link>
      </div>
    </div>
  );
}

