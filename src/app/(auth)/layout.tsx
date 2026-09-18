import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="h-11 w-11 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
            <Dumbbell className="h-6 w-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-neutral-900">
            Fit<span className="text-brand-500">Flow</span>
          </span>
        </Link>
        <p className="mt-2 text-sm text-neutral-500">
          The Operating System for Modern Gyms
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-neutral-200 rounded-2xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}

