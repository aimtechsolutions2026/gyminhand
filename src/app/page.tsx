import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  QrCode, 
  CreditCard, 
  TrendingDown, 
  Flame, 
  Users, 
  ShieldCheck, 
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
              <Dumbbell className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-neutral-900">
              Fit<span className="text-brand-500">Flow</span>
            </span>
            <Badge variant="default" className="hidden sm:inline-flex ml-2">
              Gym OS v1.0
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs sm:text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Empowering Indian Gyms with Churn Prevention & QR Check-ins</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-tight sm:leading-none">
            The Operating System for <span className="text-brand-500">Modern Gyms</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Manage members, automate billing via UPI/Cards, eliminate check-in lines with encrypted QR codes, and cut member churn from 45% down to 15%.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-brand-500/25">
                <span>Get Started for Free</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
              <div className="text-2xl font-bold text-neutral-900">40% → 15%</div>
              <div className="text-xs text-neutral-500 mt-0.5">Target Churn Reduction</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
              <div className="text-2xl font-bold text-success-600">&lt; 1 sec</div>
              <div className="text-xs text-neutral-500 mt-0.5">Mobile QR Scan Speed</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
              <div className="text-2xl font-bold text-brand-600">100%</div>
              <div className="text-xs text-neutral-500 mt-0.5">Multi-tenant Data Isolation</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
              <div className="text-2xl font-bold text-warning-600">UPI + Cash</div>
              <div className="text-xs text-neutral-500 mt-0.5">India-Ready Billing</div>
            </div>
          </div>
        </section>

        {/* Core Pillars Grid */}
        <section className="py-16 bg-white border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                Engineered for Gym Owners, Staff & Members
              </h2>
              <p className="mt-3 text-neutral-500">
                Replace fragmented spreadsheets and legacy desktop software with a cloud-native platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="hover:border-brand-300 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-2">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <CardTitle>Fast QR Attendance</CardTitle>
                  <CardDescription>
                    Unique encrypted tokens for each member. Works on iOS and Android camera scanners with offline sync capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="success">Core MVP</Badge>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="hover:border-brand-300 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-warning-50 text-warning-500 flex items-center justify-center mb-2">
                    <TrendingDown className="h-6 w-6" />
                  </div>
                  <CardTitle>Member Risk Engine (USP)</CardTitle>
                  <CardDescription>
                    Identifies members slipping away before they drop off. Automated alerts and follow-up CRM tasks for front-desk staff.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="warning">FitFlow Moat</Badge>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="hover:border-brand-300 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-success-50 text-success-500 flex items-center justify-center mb-2">
                    <Flame className="h-6 w-6" />
                  </div>
                  <CardTitle>Engagement & Streaks</CardTitle>
                  <CardDescription>
                    Keep members motivated with attendance streaks, milestone badges, and gym-wide leaderboards.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="default">Retention Booster</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-10 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-brand-500" />
            <span className="text-white font-semibold">FitFlow Gym Operating System</span>
          </div>
          <p>© 2024 FitFlow. Built for high-growth fitness centers.</p>
        </div>
      </footer>
    </div>
  );
}

