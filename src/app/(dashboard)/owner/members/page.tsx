"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  UserPlus,
  QrCode,
  Calendar,
  Phone,
  ChevronRight,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MemberRecord {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  email?: string | null;
  branch: { name: string };
  membership?: {
    status: string;
    expiryDate: string;
    customPlanName?: string | null;
    plan?: { name: string; price: number } | null;
  } | null;
  qrCode?: { token: string } | null;
  _count: { attendances: number };
}

export default function MembersDirectoryPage() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/members?query=${encodeURIComponent(searchQuery)}`;
      if (statusFilter !== "ALL") {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMembers(data.data.members);
        setTotalCount(data.data.pagination.totalCount);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Member Directory
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Total {totalCount} registered fitness member{totalCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/owner/members/new">
            <Button size="sm" className="gap-1.5 shadow-sm shadow-brand-500/20">
              <UserPlus className="h-4 w-4" />
              <span>Register Member</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or Member ID..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              className="h-10 px-3 text-sm rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Member Directory List */}
      {isLoading ? (
        <div className="text-center py-16 text-neutral-400">Loading members list...</div>
      ) : members.length === 0 ? (
        <Card className="text-center py-16 text-neutral-500">
          <Users className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
          <p className="font-semibold text-neutral-800 text-lg">No members found</p>
          <p className="text-sm text-neutral-400 mt-1">
            {searchQuery
              ? "Try adjusting your search query or filters."
              : "Register your first gym member to get started."}
          </p>
          {!searchQuery && (
            <Link href="/owner/members/new" className="inline-block mt-4">
              <Button size="sm">Add First Member</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {members.map((member) => {
            const isPlanActive = member.membership?.status === "ACTIVE";
            const expiry = member.membership?.expiryDate
              ? new Date(member.membership.expiryDate)
              : null;
            const isExpiringSoon =
              expiry &&
              expiry.getTime() - Date.now() < 5 * 24 * 60 * 60 * 1000 &&
              expiry.getTime() > Date.now();

            return (
              <Link
                key={member.id}
                href={`/owner/members/${member.id}`}
                className="block group"
              >
                <Card className="p-4 hover:border-brand-300 transition-all shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-neutral-900 group-hover:text-brand-600 transition-colors">
                            {member.name}
                          </span>
                          <span className="text-xs font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                            {member.memberCode}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </span>
                          <span>• {member.branch.name}</span>
                          <span>• {member._count.attendances} visits</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-neutral-500">
                          {member.membership?.customPlanName || member.membership?.plan?.name || "No Active Plan"}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {expiry
                            ? `Expires: ${expiry.toLocaleDateString()}`
                            : "No expiry recorded"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isExpiringSoon ? (
                          <Badge variant="warning">Expiring Soon</Badge>
                        ) : isPlanActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="danger">Expired</Badge>
                        )}
                        <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-700 transition-colors hidden sm:block" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

