"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardTopNav from "@/components/dashboard/DashboardTopNav";
import DashboardSidebarNav from "@/components/dashboard/DashboardSidebarNav";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0F1622] via-[#141D2A] to-[#0C121B] text-white">
        <DashboardTopNav />
        <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 pb-12 pt-8">
          <DashboardSidebarNav />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
