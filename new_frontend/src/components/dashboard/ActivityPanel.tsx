import { useState } from "react";
import { PackagePlus, ArrowRightLeft, Truck, RotateCcw, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { dashboardService, StockMoveResponse } from "@/services/dashboardService";
import { format } from "date-fns";

const iconMap: Record<string, LucideIcon> = {
  PackagePlus, ArrowRightLeft, Truck, RotateCcw,
};

type Tab = "all" | "incoming" | "outgoing";

export function ActivityPanel() {
  const [tab, setTab] = useState<Tab>("all");

  const { data: moves = [] } = useQuery({
    queryKey: ["recent-moves"],
    queryFn: dashboardService.getRecentMoves,
  });

  const formattedTransactions = moves.map((m) => ({
    id: m.id,
    title: `${m.move_type.replace(/_/g, " ").toUpperCase()} - ${m.reference}`,
    category: m.location_name || "Unknown Location",
    amount: `${m.move_type === "receipt" || m.move_type === "return" ? "+" : "-"}${m.quantity}`,
    type: m.move_type === "receipt" || m.move_type === "return" ? "incoming" as const : "outgoing" as const,
    icon: m.move_type === "receipt" ? "PackagePlus" : m.move_type === "transfer" ? "ArrowRightLeft" : "Truck",
    time: format(new Date(m.created_at), "hh:mm a"),
    date: format(new Date(m.created_at), "MMM dd"),
  }));

  const filtered = tab === "all"
    ? formattedTransactions
    : formattedTransactions.filter((t) => t.type === tab);

  return (
    <aside className="w-full lg:w-[320px] shrink-0 bg-card border-l border-border h-screen overflow-y-auto p-5 hidden lg:block">
      {/* Timeline */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Activity Feed</h3>
        <div className="space-y-3">
          {formattedTransactions.slice(0, 5).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-3 text-sm"
            >
              <span className="text-muted-foreground font-mono text-xs shrink-0 pt-0.5">{item.time}</span>
              <span className="text-card-foreground line-clamp-2">{item.title} ({item.amount})</span>
            </motion.div>
          ))}
          {formattedTransactions.length === 0 && <p className="text-xs text-muted-foreground py-4">No recent activity</p>}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Transactions</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all →</button>
        </div>

        <div className="flex gap-1 mb-4">
          {(["all", "incoming", "outgoing"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {filtered.map((tx) => (
            <TransactionItem key={tx.id} tx={tx} />
          ))}
        </div>
      </div>

      {/* Optimization Tip */}
      <div className="mt-6 rounded-xl bg-foreground text-background p-5">
        <h4 className="font-semibold text-sm mb-2">Inventory Optimization Tip</h4>
        <p className="text-xs opacity-80 leading-relaxed">
          Reduce excess stock by optimizing reorder levels. Analyze demand patterns to set accurate safety stock.
        </p>
        <button className="mt-3 text-xs font-medium text-accent hover:underline">
          Learn more →
        </button>
      </div>
    </aside>
  );
}

function TransactionItem({ tx }: { tx: any }) {
  const Icon = iconMap[tx.icon] || PackagePlus;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
      <div className={cn(
        "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
        tx.type === "incoming" ? "bg-highlight" : "bg-secondary"
      )}>
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-card-foreground truncate">{tx.title}</p>
        <p className="text-xs text-muted-foreground">{tx.date} • {tx.category}</p>
      </div>
      <span className={cn(
        "text-sm font-semibold shrink-0",
        tx.type === "incoming" ? "text-success" : "text-destructive"
      )}>
        {tx.amount}
      </span>
    </div>
  );
}
