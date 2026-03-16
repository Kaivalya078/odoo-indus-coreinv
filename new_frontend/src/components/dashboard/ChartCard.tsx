import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";

export function ChartCard() {
  const [period, setPeriod] = useState("month");

  const { data: warehouseSummary = [] } = useQuery({
    queryKey: ["warehouse-summary"],
    queryFn: dashboardService.getWarehouseSummary,
  });

  const chartData = warehouseSummary.map(wh => ({
    warehouse_name: wh.warehouse_name,
    total_products: wh.total_products,
    total_stock: Number(wh.total_stock),
  }));

  const totalStock = chartData.reduce((acc, curr) => acc + curr.total_stock, 0);
  const totalProducts = chartData.reduce((acc, curr) => acc + curr.total_products, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-card rounded-xl p-6 card-shadow"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Inventory Movement Overview</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="bg-highlight/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Total Stock</p>
          <p className="text-lg font-bold text-card-foreground">{totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Unique Products</p>
          <p className="text-lg font-bold text-card-foreground">{totalProducts.toLocaleString()}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
          <XAxis dataKey="warehouse_name" tick={{ fontSize: 12, fill: "hsl(215 15% 50%)" }} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(215 15% 50%)" }} />
          <Tooltip
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid hsl(214 20% 90%)",
              boxShadow: "0 4px 12px hsl(0 0% 0% / 0.08)",
            }}
          />
          <Legend />
          <Bar dataKey="total_stock" fill="hsl(50 80% 55%)" radius={[4, 4, 0, 0]} name="Total Stock" />
          <Bar dataKey="total_products" fill="hsl(220 20% 15%)" radius={[4, 4, 0, 0]} name="Unique Products" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
