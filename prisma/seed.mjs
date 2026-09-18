import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting FitFlow database seeding...");

  const passwordHash = await bcrypt.hash("Password123", 10);

  // 1. Clean existing records or find/upsert organization
  let org = await prisma.organization.findFirst({
    where: { email: "demo@fitflow.app" },
  });

  const subscriptionExpiresAt = new Date();
  subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 365); // 1 year active

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "FitFlow Power Gym",
        email: "demo@fitflow.app",
        phone: "9876543200",
        address: "100 Feet Road, Indiranagar, Bangalore",
        gstNumber: "29AAAAA0000A1Z5",
        tier: "ENTERPRISE",
        isActive: true,
        subscriptionPlan: "ENTERPRISE",
        subscriptionExpiresAt,
        subscriptionStatus: "ACTIVE",
      },
    });
    console.log("✓ Created Organization:", org.name);
  } else {
    org = await prisma.organization.update({
      where: { id: org.id },
      data: {
        isActive: true,
        subscriptionPlan: "ENTERPRISE",
        subscriptionExpiresAt,
        subscriptionStatus: "ACTIVE",
      },
    });
    console.log("✓ Updated Organization subscription:", org.name);
  }

  // 2. Branches
  let branchHQ = await prisma.branch.findFirst({
    where: { organizationId: org.id, name: "Indiranagar HQ" },
  });

  if (!branchHQ) {
    branchHQ = await prisma.branch.create({
      data: {
        organizationId: org.id,
        name: "Indiranagar HQ",
        address: "100 Feet Rd, Indiranagar, Bangalore",
        phone: "9876543201",
        capacity: 350,
      },
    });
  }

  let branchKora = await prisma.branch.findFirst({
    where: { organizationId: org.id, name: "Koramangala Downtown" },
  });

  if (!branchKora) {
    branchKora = await prisma.branch.create({
      data: {
        organizationId: org.id,
        name: "Koramangala Downtown",
        address: "80 Feet Rd, 4th Block, Koramangala, Bangalore",
        phone: "9876543202",
        capacity: 250,
      },
    });
  }
  console.log("✓ Created Branches: Indiranagar HQ, Koramangala Downtown");

  // 3. Membership Plans
  const plansData = [
    {
      name: "1 Month Standard",
      durationDays: 30,
      price: 1800,
      description: "Full cardio & strength access for 30 days",
    },
    {
      name: "3 Months Silver",
      durationDays: 90,
      price: 4500,
      description: "Quarterly fitness & steam room access",
    },
    {
      name: "Annual Gold",
      durationDays: 365,
      price: 14000,
      description: "Unlimited 1-year access with free trainer consultation",
    },
  ];

  const plans = [];
  for (const p of plansData) {
    let plan = await prisma.membershipPlan.findFirst({
      where: { organizationId: org.id, name: p.name },
    });
    if (!plan) {
      plan = await prisma.membershipPlan.create({
        data: { ...p, organizationId: org.id },
      });
    }
    plans.push(plan);
  }
  console.log("✓ Created Membership Plans");

  // 4. Seed Demo Users for Each Role
  const demoUsers = [
    {
      name: "Amit Sharma (Owner)",
      email: "owner@fitflow.app",
      role: "OWNER",
      phone: "9876500001",
      branchId: branchHQ.id,
    },
    {
      name: "Priya Patel (Manager)",
      email: "manager@fitflow.app",
      role: "MANAGER",
      phone: "9876500002",
      branchId: branchHQ.id,
    },
    {
      name: "Rahul Verma (Trainer)",
      email: "trainer@fitflow.app",
      role: "TRAINER",
      phone: "9876500003",
      branchId: branchHQ.id,
    },
    {
      name: "Sneha Reddy (Reception)",
      email: "reception@fitflow.app",
      role: "RECEPTION",
      phone: "9876500004",
      branchId: branchHQ.id,
    },
    {
      name: "Vikram Malhotra (Member)",
      email: "member@fitflow.app",
      role: "MEMBER",
      phone: "9876543210",
      branchId: branchHQ.id,
    },
    {
      name: "Super Admin",
      email: "admin@fitflow.app",
      role: "SUPERADMIN",
      phone: "9876500099",
      branchId: branchHQ.id,
    },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        organizationId: org.id,
        branchId: u.branchId,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        phone: u.phone,
        isActive: true,
      },
      update: {
        name: u.name,
        role: u.role,
        passwordHash,
        isActive: true,
      },
    });
  }
  console.log("✓ Seeded Users for all roles (Password: Password123)");

  // 5. Trainer Profile
  let trainer = await prisma.trainer.findFirst({
    where: { organizationId: org.id, phone: "9876500003" },
  });
  if (!trainer) {
    trainer = await prisma.trainer.create({
      data: {
        organizationId: org.id,
        name: "Rahul Verma",
        phone: "9876500003",
        email: "trainer@fitflow.app",
        specialty: "Strength, Crossfit & Hypertrophy",
      },
    });
  }

  // 6. Seed Realistic Members with Churn Risk Levels & QR Tokens
  const membersData = [
    {
      name: "Vikram Malhotra",
      phone: "9876543210",
      email: "vikram@malhotra.in",
      memberCode: "FF-IND-000001",
      height: 178,
      weight: 76,
      fitnessGoal: "muscle_gain",
      gender: "MALE",
      riskScore: 10, // Active healthy member
      planIndex: 2, // Annual Gold
      daysAgoVisited: 0, // Visited today!
      totalVisits: 18,
    },
    {
      name: "Rohan Gupta",
      phone: "9876543211",
      email: "rohan.gupta@corp.in",
      memberCode: "FF-IND-000002",
      height: 172,
      weight: 84,
      fitnessGoal: "weight_loss",
      gender: "MALE",
      riskScore: 65, // At Risk (9 days absent)
      planIndex: 1, // 3 Months
      daysAgoVisited: 9,
      totalVisits: 8,
    },
    {
      name: "Ananya Singh",
      phone: "9876543212",
      email: "ananya.singh@gmail.com",
      memberCode: "FF-IND-000003",
      height: 165,
      weight: 58,
      fitnessGoal: "general_fitness",
      gender: "FEMALE",
      riskScore: 95, // Critical Churn (22 days absent)
      planIndex: 0, // 1 Month
      daysAgoVisited: 22,
      totalVisits: 4,
    },
    {
      name: "Karan Mehta",
      phone: "9876543213",
      email: "karan.mehta@yahoo.com",
      memberCode: "FF-IND-000004",
      height: 180,
      weight: 90,
      fitnessGoal: "weight_loss",
      gender: "MALE",
      riskScore: 85, // Expired Plan
      planIndex: 0,
      daysAgoVisited: 14,
      totalVisits: 12,
      isExpired: true,
    },
  ];

  const now = new Date();

  for (const m of membersData) {
    const existingMember = await prisma.member.findFirst({
      where: {
        organizationId: org.id,
        phone: m.phone,
      },
    });

    let member = existingMember;

    if (!member) {
      member = await prisma.member.create({
        data: {
          organizationId: org.id,
          branchId: branchHQ.id,
          trainerId: trainer.id,
          name: m.name,
          phone: m.phone,
          email: m.email,
          memberCode: m.memberCode,
          height: m.height,
          weight: m.weight,
          fitnessGoal: m.fitnessGoal,
          gender: m.gender,
          riskScore: m.riskScore,
          isActive: true,
        },
      });

      // QR Code
      await prisma.qRCode.create({
        data: {
          organizationId: org.id,
          memberId: member.id,
          token: `FITFLOW_${org.id}_DEMO_${m.memberCode}`,
        },
      });

      // Membership Subscription
      const selectedPlan = plans[m.planIndex] || plans[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (m.isExpired ? 40 : 15));

      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + selectedPlan.durationDays);

      await prisma.membership.create({
        data: {
          organizationId: org.id,
          memberId: member.id,
          planId: selectedPlan.id,
          startDate,
          expiryDate,
          status: m.isExpired ? "EXPIRED" : "ACTIVE",
        },
      });

      // Payment
      await prisma.payment.create({
        data: {
          organizationId: org.id,
          memberId: member.id,
          amount: selectedPlan.price,
          method: "UPI",
          status: "PAID",
          invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
          paidAt: startDate,
          notes: `Membership subscription: ${selectedPlan.name}`,
        },
      });

      // Attendance history
      for (let i = 0; i < m.totalVisits; i++) {
        const visitDate = new Date();
        visitDate.setDate(visitDate.getDate() - m.daysAgoVisited - i * 2);
        visitDate.setHours(7 + (i % 12), 15, 0, 0);

        await prisma.attendance.create({
          data: {
            organizationId: org.id,
            branchId: branchHQ.id,
            memberId: member.id,
            entryTime: visitDate,
            method: "QR",
          },
        });
      }

      // If at risk or critical churn, create retention CRM follow-up task
      if (m.riskScore >= 60) {
        const taskDueDate = new Date();
        taskDueDate.setDate(taskDueDate.getDate() + 1);

        await prisma.followUpTask.create({
          data: {
            organizationId: org.id,
            branchId: branchHQ.id,
            memberId: member.id,
            title: `Call ${m.name} - Inactive for ${m.daysAgoVisited} days`,
            reason: m.isExpired
              ? "Membership expired - Offer 10% renewal discount"
              : `Member absent for ${m.daysAgoVisited} days. High churn risk!`,
            priority: m.riskScore >= 80 ? "HIGH" : "MEDIUM",
            status: "PENDING",
            dueDate: taskDueDate,
          },
        });
      }
    }
  }

  console.log("✓ Seeded Members, Attendance, QR Tokens, Invoices & CRM Tasks");
  console.log("\n🎉 FitFlow Demo Database Seeding Completed!");
  console.log("====================================================");
  console.log("Demo Accounts (Password for all: Password123)");
  console.log("1. Gym Owner:    owner@fitflow.app");
  console.log("2. Gym Manager:  manager@fitflow.app");
  console.log("3. Gym Trainer:  trainer@fitflow.app");
  console.log("4. Reception:    reception@fitflow.app");
  console.log("5. Member Login: member@fitflow.app (or Phone: 9876543210 / ID: FF-IND-000001)");
  console.log("6. Super Admin:  admin@fitflow.app");
  console.log("====================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

