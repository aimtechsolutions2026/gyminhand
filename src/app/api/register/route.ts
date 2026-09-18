import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  gymName: z.string().min(2, "Gym name must be at least 2 characters"),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validatedData.error.errors[0]?.message || "Invalid input",
            details: validatedData.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const { gymName, name, email, phone, password } = validatedData.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "An account with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Multi-tenant creation in an atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: gymName,
          email: normalizedEmail,
          phone: phone || null,
          tier: "STARTER",
        },
      });

      // 2. Create Default Branch
      const branch = await tx.branch.create({
        data: {
          name: "Main Branch",
          organizationId: org.id,
          phone: phone || null,
        },
      });

      // 3. Create Owner User
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: "OWNER",
          organizationId: org.id,
          branchId: branch.id,
          phone: phone || null,
        },
      });

      // 4. Create Initial Starter Membership Plans
      await tx.membershipPlan.createMany({
        data: [
          {
            organizationId: org.id,
            name: "1 Month Standard",
            durationDays: 30,
            price: 1500,
            description: "Full gym & cardio access for 1 month",
          },
          {
            organizationId: org.id,
            name: "3 Months Silver",
            durationDays: 90,
            price: 3999,
            description: "Quarterly fitness membership",
          },
          {
            organizationId: org.id,
            name: "Annual Gold",
            durationDays: 365,
            price: 12000,
            description: "Complete 1-year unlimited access",
          },
        ],
      });

      return { org, branch, user };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gym owner registered successfully",
        data: {
          organizationId: result.org.id,
          branchId: result.branch.id,
          userId: result.user.id,
          email: result.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while creating your account",
        },
      },
      { status: 500 }
    );
  }
}

