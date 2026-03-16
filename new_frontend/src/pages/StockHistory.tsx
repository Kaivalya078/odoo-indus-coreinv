import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { stockService } from "@/services/stockService";
import { Loader2, Search, ArrowDownToLine, ArrowUpFromLine, Repeat } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function StockHistory() {
  const [search, setSearch] = useState("");
  const [moveTypeFilter, setMoveTypeFilter] = useState<string>("all");

  const { data: moves = [], isLoading } = useQuery({
    queryKey: ["stock-moves", moveTypeFilter],
    queryFn: () => stockService.getStockMoves(moveTypeFilter === "all" ? undefined : { move_type: moveTypeFilter }),
  });

  const filteredMoves = moves.filter(m => 
    m.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.reference.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    if (type === "receipt" || type === "return") return <ArrowDownToLine className="h-4 w-4 text-success mr-2" />;
    if (type === "delivery" || type === "loss") return <ArrowUpFromLine className="h-4 w-4 text-destructive mr-2" />;
    return <Repeat className="h-4 w-4 text-muted-foreground mr-2" />;
  };

  const getTypeColor = (type: string) => {
    if (type === "receipt" || type === "return") return "bg-success/15 text-success hover:bg-success/25 border-transparent";
    if (type === "delivery" || type === "loss") return "bg-destructive/15 text-destructive hover:bg-destructive/25 border-transparent";
    return "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Stock Movements History</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search product or ref..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={moveTypeFilter} onValueChange={setMoveTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Move Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Movements</SelectItem>
            <SelectItem value="receipt">Receipts</SelectItem>
            <SelectItem value="delivery">Deliveries</SelectItem>
            <SelectItem value="transfer">Transfers</SelectItem>
            <SelectItem value="adjustment">Adjustments</SelectItem>
            <SelectItem value="return">Returns</SelectItem>
            <SelectItem value="loss">Loss</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMoves.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No movements found.</TableCell></TableRow>
              ) : (
                filteredMoves.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(m.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{m.reference}</TableCell>
                    <TableCell className="font-medium">{m.product_name || "Unknown Product"}</TableCell>
                    <TableCell>{m.location_name || "Unknown Location"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`flex items-center w-fit ${getTypeColor(m.move_type)}`}>
                        {getTypeIcon(m.move_type)}
                        {m.move_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${
                      m.move_type === "receipt" || m.move_type === "return" ? "text-success" : 
                      m.move_type === "delivery" || m.move_type === "loss" ? "text-destructive" : ""
                    }`}>
                      {m.move_type === "receipt" || m.move_type === "return" ? "+" : 
                       m.move_type === "delivery" || m.move_type === "loss" ? "-" : ""}{m.quantity}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
