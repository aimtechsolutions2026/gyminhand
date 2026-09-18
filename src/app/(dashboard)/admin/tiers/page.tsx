import { ShieldCheck, Check, X, Layers, UserCheck } from "lucide-react";

export default function AdminTiersPage() {
  const tiers = [
    {
      name: "STARTER",
      price: "₹1,999 / mo",
      branches: "1 Branch",
      members: "Up to 300 Members",
      features: [
        "Single Gym Facility",
        "QR Kiosk & Member Attendance",
        "GST Invoice Generator",
        "Reception & Trainer Roles",
        "Basic Retention Alerts",
      ],
      color: "border-emerald-700 bg-emerald-950/20",
      tagColor: "bg-emerald-900 text-emerald-300",
    },
    {
      name: "PROFESSIONAL",
      price: "₹4,999 / mo",
      branches: "Up to 3 Branches",
      members: "Up to 1,500 Members",
      features: [
        "Multi-Branch Roaming Attendance",
        "AI Churn Risk Scoring (FitFlow Moat)",
        "Automated WhatsApp Outreach",
        "Full Staff RBAC (Managers + Trainers + Reception)",
        "Leaderboard & Gamification",
      ],
      color: "border-blue-700 bg-blue-950/20",
      tagColor: "bg-blue-900 text-blue-300",
      popular: true,
    },
    {
      name: "ENTERPRISE",
      price: "₹9,999 / mo",
      branches: "Unlimited Multi-Chain",
      members: "Unlimited Members",
      features: [
        "Unlimited Multi-City Gym Chains",
        "Centralized HQ Franchise Analytics",
        "Custom White-Label Branding",
        "Dedicated Database Shard & Priority Support",
        "Custom Webhook & Biometrics Integrations",
      ],
      color: "border-purple-700 bg-purple-950/20",
      tagColor: "bg-purple-900 text-purple-300",
    },
  ];

  const permissions = [
    { module: "Platform Tenants & Gym Onboarding", superadmin: true, owner: false, manager: false, trainer: false, reception: false },
    { module: "Gym Settings & GST Billing Configuration", superadmin: true, owner: true, manager: false, trainer: false, reception: false },
    { module: "Staff Management & Role Assignment", superadmin: true, owner: true, manager: true, trainer: false, reception: false },
    { module: "Member Directory & Registration", superadmin: true, owner: true, manager: true, trainer: true, reception: true },
    { module: "QR Attendance Kiosk Scanner", superadmin: true, owner: true, manager: true, trainer: false, reception: true },
    { module: "Payments & Invoicing", superadmin: true, owner: true, manager: true, trainer: false, reception: true },
    { module: "Retention CRM & Churn Risk Actioning", superadmin: true, owner: true, manager: true, trainer: false, reception: false },
    { module: "Workouts & Diet Plans", superadmin: true, owner: true, manager: true, trainer: true, reception: false },
    { module: "Gym Leaderboard & Gamification", superadmin: true, owner: true, manager: true, trainer: true, reception: true },
    { module: "Member Mobile Web App (PWA QR)", superadmin: false, owner: false, manager: false, trainer: false, reception: false, member: true },
  ];

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">
          <Layers className="h-4 w-4" />
          System Configuration
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Platform Subscription Tiers & RBAC
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Review subscription package limits and the role-based access control matrix governing FitFlow OS.
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`border rounded-2xl p-6 flex flex-col justify-between ${tier.color} relative backdrop-blur-sm`}
          >
            {tier.popular && (
              <span className="absolute -top-3 right-6 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Most Popular
              </span>
            )}
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${tier.tagColor}`}>
                  {tier.name}
                </span>
                <span className="text-xs text-neutral-400">{tier.branches}</span>
              </div>
              <div className="mt-4 text-2xl font-black text-white">{tier.price}</div>
              <div className="text-xs text-neutral-400 mt-0.5">{tier.members}</div>

              <div className="mt-6 space-y-2.5">
                {tier.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs text-neutral-300">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RBAC Matrix Table */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-5 border-b border-neutral-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-red-400" />
            FitFlow RBAC Permissions Matrix
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time permissions applied across sidebar navigation, API handlers, and route middleware.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3">Platform Capability / Route</th>
                <th className="px-4 py-3 text-center">Superadmin</th>
                <th className="px-4 py-3 text-center">Owner</th>
                <th className="px-4 py-3 text-center">Manager</th>
                <th className="px-4 py-3 text-center">Trainer</th>
                <th className="px-4 py-3 text-center">Reception</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {permissions.map((p) => (
                <tr key={p.module} className="hover:bg-neutral-800/30">
                  <td className="px-5 py-3.5 font-medium text-neutral-200">{p.module}</td>
                  <td className="px-4 py-3.5 text-center">
                    {p.superadmin ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-neutral-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {p.owner ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-neutral-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {p.manager ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-neutral-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {p.trainer ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-neutral-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {p.reception ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-neutral-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

