"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate password reset request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Reset Password</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your registered email address to receive reset instructions
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center py-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-success-50 flex items-center justify-center text-success-600 mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Check your inbox</h3>
          <p className="mt-1 text-sm text-neutral-600">
            We have sent password reset instructions to <strong>{email}</strong> if an account exists.
          </p>

          <Link href="/login" className="block mt-6">
            <Button variant="outline" className="w-full">
              Return to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="owner@gym.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4 shadow-md shadow-brand-500/20"
            size="lg"
            isLoading={isLoading}
          >
            Send Reset Link
          </Button>

          <div className="mt-6 pt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

