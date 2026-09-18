import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Dumbbell, ArrowLeft, Sun, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberQRPassPage({
  searchParams,
}: {
  searchParams: { memberId?: string };
}) {
  const memberId = searchParams.memberId;

  let member = null;
  if (memberId) {
    member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        organization: true,
        branch: true,
        membership: { include: { plan: true } },
        qrCode: true,
      },
    });
  }

  if (!member) {
    member = await prisma.member.findFirst({
      where: { isActive: true },
      include: {
        organization: true,
        branch: true,
        membership: { include: { plan: true } },
        qrCode: true,
      },
    });
  }

  if (!member) {
    redirect("/member-login");
  }

  const isPlanActive =
    member.membership?.status === "ACTIVE" &&
    member.membership.expiryDate > new Date();

  return (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-between text-left">
        <Link href={`/member/dashboard?memberId=${member.id}`}>
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Digital ID Pass
        </span>
        <div className="w-9" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium">
        <Sun className="h-3.5 w-3.5 text-warning-500" />
        <span>Keep screen brightness high for faster scanning</span>
      </div>

      {/* Main Digital QR Card */}
      <Card className="border-brand-200 bg-white p-6 shadow-xl rounded-3xl relative overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-brand-600 font-bold text-sm">
            <Dumbbell className="h-4 w-4" />
            <span>{member.organization.name}</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
              {member.name}
            </h2>
            <p className="text-xs font-mono font-semibold text-neutral-500 mt-0.5">
              {member.memberCode} • {member.branch.name}
            </p>
          </div>

          {/* Large High-Contrast QR Code Visual */}
          <div className="p-4 bg-neutral-950 text-white rounded-2xl inline-block mx-auto shadow-inner">
            <div className="h-52 w-52 flex flex-col items-center justify-center relative">
              <QrCode className="h-44 w-44 text-white" />
              <div className="text-[10px] font-mono text-neutral-400 mt-1 truncate max-w-[180px]">
                {member.qrCode?.token || member.memberCode}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <Badge variant={isPlanActive ? "success" : "danger"} className="text-xs px-3 py-1">
              {isPlanActive ? "✓ Active Member" : "Expired - Renew at Front Desk"}
            </Badge>

            <div className="text-xs text-neutral-500">
              Valid until:{" "}
              <strong>
                {member.membership?.expiryDate
                  ? new Date(member.membership.expiryDate).toLocaleDateString()
                  : "N/A"}
              </strong>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

