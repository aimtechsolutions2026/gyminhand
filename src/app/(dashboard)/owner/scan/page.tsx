"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Keyboard,
  ArrowLeft,
  Clock,
  Flame,
  UserCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface ScanResult {
  type: "success" | "expired" | "duplicate" | "error";
  message: string;
  member?: {
    id?: string;
    name: string;
    memberCode: string;
    planName?: string;
    branchName?: string;
    homeBranchName?: string;
    isRoaming?: boolean;
    totalVisits?: number;
    daysLeft?: number;
    daysOverdue?: number;
    lastEntryTime?: string;
  };
}

export default function QRScannerPage() {
  const [inputCode, setInputCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [recentScans, setRecentScans] = useState<
    Array<{ name: string; memberCode: string; time: string; status: string; isRoaming?: boolean }>
  >([]);

  // Load gym facility branches for multi-branch roaming kiosks
  useState(() => {
    fetch("/api/gym/branches")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setBranches(data.data);
          setSelectedBranchId(data.data[0].id);
        }
      })
      .catch(() => {});
  });

  const handleProcessScan = async (code: string, force = false) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setIsProcessing(true);
    setScanResult(null);

    try {
      // Determines whether code is a token or memberCode
      const isToken = cleanCode.startsWith("FITFLOW_");
      const payload: Record<string, unknown> = {
        force,
        method: "QR",
        scannerBranchId: selectedBranchId || undefined,
      };

      if (isToken) {
        payload.token = cleanCode;
      } else {
        payload.memberCode = cleanCode;
      }

      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setScanResult({
          type: "success",
          message: data.message,
          member: data.data,
        });

        setRecentScans((prev) => [
          {
            name: data.data.name,
            memberCode: data.data.memberCode,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "CHECKED IN",
          },
          ...prev.slice(0, 9),
        ]);

        setInputCode("");
      } else if (res.status === 403) {
        setScanResult({
          type: "expired",
          message: data.error?.message || "Membership expired",
          member: data.error?.member,
        });
      } else if (res.status === 409) {
        setScanResult({
          type: "duplicate",
          message: data.error?.message || "Member already checked in",
          member: data.error?.member,
        });
      } else {
        setScanResult({
          type: "error",
          message: data.error?.message || "Scan failed. Member not found.",
        });
      }
    } catch {
      setScanResult({
        type: "error",
        message: "Failed to connect to attendance server",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessScan(inputCode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/owner/dashboard">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <span>QR Check-In Scanner</span>
              <Badge variant="default" className="text-xs">Live Gate</Badge>
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Rapid member check-in kiosk for mobile and reception desks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {branches.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-500 hidden sm:inline">Facility:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="h-9 rounded-lg border border-neutral-300 bg-white px-2.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Link href="/owner/attendance">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Attendance Log</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Scanner Box & Manual Entry */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-2 border-dashed border-neutral-300 bg-neutral-900 text-white text-center p-8 relative">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="w-32 h-32 mx-auto rounded-2xl border-2 border-brand-400/80 flex items-center justify-center relative animate-pulse bg-brand-950/30">
                <QrCode className="h-16 w-16 text-brand-400" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-400 shadow-sm shadow-brand-400 animate-bounce" />
              </div>

              <div>
                <h3 className="font-bold text-base text-white">Scanner Ready</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Position member QR code in front of the lens or enter Member Code below
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Manual Entry Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-brand-500" />
                <span>Fast Code / Token Check-In</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Member Code (e.g. FF-MAIN-000001) or Scan..."
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="font-mono text-sm"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    isLoading={isProcessing}
                    className="shrink-0 shadow-sm shadow-brand-500/20"
                  >
                    Check In
                  </Button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Tip: USB Barcode & QR scanners input automatically when focused here.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Scan Result Feedback & Recent Feed */}
        <div className="space-y-4">
          {/* Result Card */}
          {scanResult ? (
            <Card
              className={
                scanResult.type === "success"
                  ? "border-success bg-success-50/40"
                  : scanResult.type === "expired"
                  ? "border-danger bg-danger-50/40"
                  : scanResult.type === "duplicate"
                  ? "border-warning bg-warning-50/40"
                  : "border-danger bg-danger-50/40"
              }
            >
              <CardContent className="p-6">
                {scanResult.type === "success" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-neutral-900">
                          {scanResult.member?.name}
                        </div>
                        <div className="text-xs text-neutral-500 font-mono">
                          {scanResult.member?.memberCode} • {scanResult.member?.branchName}
                        </div>
                      </div>
                    </div>

                    {scanResult.member?.isRoaming && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900 flex items-center gap-2.5 shadow-sm">
                        <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-bold text-blue-800">Multi-Branch Roaming Pass Approved!</div>
                          <div className="text-[11px] text-blue-600 mt-0.5">
                            Home Branch: <strong>{scanResult.member.homeBranchName}</strong> ➔ Visiting: <strong>{scanResult.member.branchName}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-success/20 text-xs text-neutral-700">
                      <div>
                        Plan: <strong>{scanResult.member?.planName}</strong>
                      </div>
                      <div>
                        Validity:{" "}
                        <strong className="text-success-700">
                          {scanResult.member?.daysLeft} days left
                        </strong>
                      </div>
                      <div>
                        Total Visits: <strong>{scanResult.member?.totalVisits}</strong>
                      </div>
                      <div className="flex items-center gap-1 text-brand-600 font-semibold">
                        <Flame className="h-3.5 w-3.5 text-warning-500" />
                        <span>Streak Active 🔥</span>
                      </div>
                    </div>
                  </div>
                )}

                {scanResult.type === "expired" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-danger text-white flex items-center justify-center shrink-0">
                        <XCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-danger-800">
                          MEMBERSHIP EXPIRED
                        </div>
                        <div className="text-sm font-semibold text-neutral-900">
                          {scanResult.member?.name} ({scanResult.member?.memberCode})
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-danger-700">
                      Plan expired {scanResult.member?.daysOverdue} days ago. Please renew before allowing entry.
                    </p>

                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          handleProcessScan(
                            scanResult.member?.memberCode || inputCode,
                            true
                          )
                        }
                      >
                        Override & Allow Entry
                      </Button>
                      {scanResult.member?.id && (
                        <Link href={`/owner/members/${scanResult.member.id}`}>
                          <Button size="sm" variant="outline">
                            Renew Plan
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {scanResult.type === "duplicate" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-warning-800 font-semibold">
                      <AlertTriangle className="h-5 w-5 text-warning-600 shrink-0" />
                      <span>Already Checked In</span>
                    </div>
                    <p className="text-xs text-warning-700">{scanResult.message}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleProcessScan(
                          scanResult.member?.memberCode || inputCode,
                          true
                        )
                      }
                      className="mt-1 text-xs"
                    >
                      Force Re-entry
                    </Button>
                  </div>
                )}

                {scanResult.type === "error" && (
                  <div className="flex items-center gap-2.5 text-danger font-medium text-sm">
                    <XCircle className="h-5 w-5 shrink-0" />
                    <span>{scanResult.message}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-neutral-200 bg-neutral-50/50 text-center py-10">
              <UserCheck className="h-10 w-10 mx-auto text-neutral-300 mb-2" />
              <p className="text-sm font-semibold text-neutral-700">Awaiting Next Check-In</p>
              <p className="text-xs text-neutral-400 mt-0.5">Scan member pass or enter ID</p>
            </Card>
          )}

          {/* Recent Live Feed in Session */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Session Check-In History</CardTitle>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-400">
                  No check-ins recorded in this session.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 text-xs">
                  {recentScans.map((scan, i) => (
                    <div key={i} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-neutral-900">{scan.name}</span>{" "}
                        <span className="text-neutral-400 font-mono">({scan.memberCode})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">{scan.time}</span>
                        <Badge variant="success" className="text-[10px]">
                          ✓
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

