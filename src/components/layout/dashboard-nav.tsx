"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardNav({ user }: { user: any }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getRoleDashboard = () => {
    switch (user.role) {
      case "DOCTOR":
        return "/dashboard/doctor";
      case "CLIENT":
        return "/dashboard/client";
      case "RECEPTIONIST":
        return "/dashboard/receptionist";
      default:
        return "/dashboard";
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              ClincOS
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href={getRoleDashboard()}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive(getRoleDashboard())
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Dashboard
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {user.name} ({user.role})
            </span>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
