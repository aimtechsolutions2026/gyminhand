export type UserRole = "SUPERADMIN" | "OWNER" | "MANAGER" | "TRAINER" | "RECEPTION" | "MEMBER";

export type AttendanceMethod = "QR" | "BIOMETRIC" | "MANUAL";

export type MembershipStatus = "ACTIVE" | "EXPIRED" | "FROZEN" | "CANCELLED";

export type PaymentMethod = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER";

export type PaymentStatus = "PAID" | "PENDING" | "PARTIAL" | "FAILED" | "REFUNDED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  branchId?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

