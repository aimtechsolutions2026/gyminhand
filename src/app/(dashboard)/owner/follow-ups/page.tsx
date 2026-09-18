"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  UserCheck,
  AlertTriangle,
  Phone,
  MessageCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

interface FollowUpTask {
  id: string;
  title: string;
  reason: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate: string;
  outcomeNotes?: string | null;
  member: {
    id: string;
    name: string;
    memberCode: string;
    phone: string;
    riskScore: number;
  };
  branch: { name: string };
}

export default function FollowUpsPage() {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/crm/tasks?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch {
      console.error("Failed to load CRM tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleRunRiskEngine = async () => {
    setIsScanning(true);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/crm/risk-scoring", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          `Scanned ${data.data.totalEvaluated} members: ${data.data.highRiskCount} at-risk, ${data.data.newTasksCreated} tasks queued.`
        );
        fetchTasks();
      }
    } catch {
      console.error("Failed to execute risk engine");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const outcome = window.prompt("Enter call outcome or member response:", "Member contacted and confirmed visit.");
    if (outcome === null) return;

    try {
      const res = await fetch("/api/crm/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: "COMPLETED", outcomeNotes: outcome }),
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch {
      alert("Failed to complete task");
    }
  };

  const highRiskCount = tasks.filter((t) => t.member.riskScore >= 80).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Retention CRM & Churn Moat
            </h1>
            <Badge variant="warning" className="text-xs uppercase font-bold">
              FitFlow Moat
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Proactively recover inactive and drop-off members before they cancel their membership
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleRunRiskEngine}
            isLoading={isScanning}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw className="h-4 w-4 text-brand-500" />
            <span>Run Churn Scan</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-success-50 border border-success/20 flex items-start gap-2.5 text-success-700 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-success-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Moat Impact Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-danger-50/40 border-danger/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-danger-700">
              High Risk / Inactive
            </span>
            <AlertTriangle className="h-4 w-4 text-danger-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-danger-800">{highRiskCount}</div>
            <p className="text-xs text-danger-600 mt-0.5">Absent for 14+ days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Pending Outreach
            </span>
            <Clock className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{tasks.length}</div>
            <p className="text-xs text-neutral-500 mt-0.5">Staff calls & messages queued</p>
          </CardContent>
        </Card>

        <Card className="bg-brand-50/40 border-brand-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Churn Reduction Target
            </span>
            <TrendingDown className="h-4 w-4 text-brand-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-800">40% → 15%</div>
            <p className="text-xs text-brand-600 mt-0.5">Average FitFlow customer retention</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <Button
          variant={statusFilter === "PENDING" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("PENDING")}
        >
          Pending Outreach ({tasks.length})
        </Button>
        <Button
          variant={statusFilter === "COMPLETED" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setStatusFilter("COMPLETED")}
        >
          Completed Logs
        </Button>
      </div>

      {/* Follow-Up Action Tasks List */}
      {isLoading ? (
        <div className="text-center py-16 text-neutral-400">Loading follow-up tasks...</div>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-16 text-neutral-500">
          <UserCheck className="h-12 w-12 mx-auto text-success-500 mb-2" />
          <p className="font-bold text-neutral-900 text-lg">All caught up!</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            No members are currently slipping away or overdue for follow-ups. Run a churn scan to re-evaluate recent check-ins.
          </p>
          <Button
            onClick={handleRunRiskEngine}
            size="sm"
            variant="outline"
            className="mt-4"
          >
            Run Churn Scan
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {tasks.map((task) => {
            const risk = task.member.riskScore;
            const waMessage = encodeURIComponent(
              `Hi ${task.member.name}! We noticed you haven't been able to visit the gym recently. Everything okay? Let us know if you need any adjustments to your workout schedule!`
            );
            const waLink = `https://wa.me/91${task.member.phone.replace(/[^0-9]/g, "")}?text=${waMessage}`;

            return (
              <Card
                key={task.id}
                className="p-4 hover:border-neutral-300 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/owner/members/${task.member.id}`}
                        className="font-bold text-base text-neutral-900 hover:text-brand-600 transition-colors"
                      >
                        {task.member.name}
                      </Link>
                      <span className="text-xs font-mono text-neutral-500">
                        ({task.member.memberCode})
                      </span>
                      <Badge
                        variant={risk >= 80 ? "danger" : risk >= 60 ? "warning" : "default"}
                        className="text-[10px]"
                      >
                        Risk Score: {risk}/100
                      </Badge>
                    </div>

                    <div className="text-xs text-neutral-600 font-medium">
                      Reason: <span className="text-danger-700">{task.reason}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span>Phone: {task.member.phone}</span>
                      <span>• Branch: {task.branch.name}</span>
                    </div>
                  </div>

                  {/* Quick Action Hub */}
                  <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-success-50 text-success-700 hover:bg-success-100 transition-colors border border-success/30"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${task.member.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors border border-neutral-200"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call</span>
                    </a>

                    {task.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                        className="text-xs shadow-sm"
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

