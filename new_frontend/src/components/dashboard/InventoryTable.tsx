import { useState } from "react";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { stockService } from "@/services/stockService";
import { Loader2 } from "lucide-react";

type SortKey = "product" | "sku" | "category" | "stock" | "warehouse" | "status";

export function InventoryTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("product");
  const [sortAsc, setSortAsc] = useState(true);

  const { data: stockLevels = [], isLoading } = useQuery({
    queryKey: ["dashboard-inventory-table"],
    queryFn: () => stockService.getStockLevels(),
  });

  const formattedData = stockLevels.map((s) => ({
    product: s.product_name,
    sku: s.product_sku,
    category: s.warehouse_name, // Using warehouse as category filter logic for now
    stock: Number(s.quantity),
    warehouse: s.location_name,
    status: Number(s.quantity) <= 0 ? "Critical" : Number(s.quantity) <= Number(s.min_stock) ? "Low Stock" : "In Stock",
  }));

  const filtered = formattedData
    .filter((row) => {
      const matchSearch = Object.values(row).some((v) =>
        String(v).toLowerCase().includes(search.toLowerCase())
      );
      // const matchCategory = categoryFilter === "all" || row.category === categoryFilter;
      return matchSearch;
    })
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      const cmp = typeof valA === "number" ? valA - (valB as number) : String(valA).localeCompare(String(valB));
      return sortAsc ? cmp : -cmp;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "product", label: "Product" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Category" },
    { key: "stock", label: "Stock" },
    { key: "warehouse", label: "Warehouse" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="bg-card rounded-xl card-shadow p-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left py-3 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="py-3 px-3 font-medium text-card-foreground">{row.product}</td>
                <td className="py-3 px-3 text-muted-foreground font-mono text-xs">{row.sku}</td>
                <td className="py-3 px-3 text-muted-foreground">{row.category}</td>
                <td className="py-3 px-3">
                  <span className="flex items-center gap-2">
                    {row.stock}
                    {row.stock <= 12 && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full font-medium",
                        row.stock <= 5 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                      )}>
                        {row.stock <= 5 ? "⚠ CRITICAL" : "⚠ LOW"}
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-3 px-3 text-muted-foreground">{row.warehouse}</td>
                <td className="py-3 px-3">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    row.status === "In Stock" && "bg-success/10 text-success",
                    row.status === "Low Stock" && "bg-warning/10 text-warning",
                    row.status === "Critical" && "bg-destructive/10 text-destructive"
                  )}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">Showing {filtered.length} of {formattedData.length} products</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className="h-8 px-3 bg-foreground text-background hover:bg-foreground/90">1</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
