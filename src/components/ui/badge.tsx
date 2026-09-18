import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-brand-50 text-brand-700 border-brand-200",
    success: "bg-success-50 text-success-700 border-success/30",
    warning: "bg-warning-50 text-warning-700 border-warning/30",
    danger: "bg-danger-50 text-danger-700 border-danger/30",
    outline: "border-neutral-300 text-neutral-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

