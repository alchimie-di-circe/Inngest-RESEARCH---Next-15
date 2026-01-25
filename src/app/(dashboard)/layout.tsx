import type { ReactNode } from "react";

import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 text-slate-100">
        {children}
      </main>
    </div>
  );
}
