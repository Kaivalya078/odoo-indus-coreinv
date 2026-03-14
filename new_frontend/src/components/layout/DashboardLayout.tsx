import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex flex-1 ml-[240px] max-lg:ml-[72px]">
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
