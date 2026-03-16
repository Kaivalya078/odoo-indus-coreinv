import { motion } from "framer-motion";
import { Package, Boxes, Truck, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryCard } from "@/components/dashboard/CategoryCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ActivityPanel } from "@/components/dashboard/ActivityPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });

  const { data: warehouseSummary } = useQuery({
    queryKey: ["warehouse-summary"],
    queryFn: dashboardService.getWarehouseSummary,
  });

  if (statsLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Highlight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl p-8 bg-highlight relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-accent/20 to-transparent" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-highlight-foreground/80">Total Inventory Value</p>
            <p className="text-4xl font-bold text-highlight-foreground mt-2">$35,450</p>
            <p className="text-sm text-highlight-foreground/60 mt-1">Across all warehouses</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <QuickActions />

        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Products" value={stats?.total_products || 0} icon={Package} index={0} />
          <StatCard label="Total Suppliers" value={stats?.total_suppliers || 0} icon={Boxes} index={1} />
          <StatCard label="Pending Deliveries" value={stats?.pending_deliveries || 0} icon={Truck} index={2} />
          <StatCard label="Low Stock Alerts" value={stats?.low_stock_count || 0} icon={AlertTriangle} index={3} />
        </div>

        {/* Category Cards (Reused for Warehouses) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {warehouseSummary?.slice(0, 3).map((wh, i) => (
            <CategoryCard key={wh.warehouse_name} name={wh.warehouse_name} value={Number(wh.total_stock)} icon="Boxes" index={i} />
          ))}
        </div>

        {/* Chart */}
        <ChartCard />

        {/* Table */}
        <InventoryTable />
      </div>

      {/* Right Activity Panel */}
      <ActivityPanel />
    </>
  );
};

export default Index;
