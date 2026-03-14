import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adjustmentService, AdjustmentCreate } from "@/services/adjustmentService";
import { warehouseService } from "@/services/warehouseService";
import { Loader2, Plus, Search, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { stockService } from "@/services/stockService";

export default function Adjustments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [warehouse, setWarehouse] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  
  const queryClient = useQueryClient();

  const { data: adjustments = [], isLoading } = useQuery({
    queryKey: ["adjustments", statusFilter],
    queryFn: () => adjustmentService.getAdjustments(statusFilter === "all" ? undefined : statusFilter),
  });

  const { data: warehouses = [] } = useQuery({ queryKey: ["warehouses"], queryFn: warehouseService.getWarehouses });
  const { data: stockLevels = [] } = useQuery({ 
    queryKey: ["stock", warehouse], 
    queryFn: () => stockService.getStockLevels({ warehouse_id: warehouse }),
    enabled: !!warehouse,
  });

  const createMutation = useMutation({
    mutationFn: (data: AdjustmentCreate) => adjustmentService.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustments"] });
      toast.success("Adjustment recorded immediately as Done");
      setIsAddOpen(false);
      
      // Reset form
      setWarehouse("");
      setLocationId("");
      setProductId("");
      setQuantity(0);
      setReason("");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to create adjustment"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || !productId || !reason) {
      toast.error("Please fill all fields.");
      return;
    }
    createMutation.mutate({
      product_id: productId,
      location_id: locationId,
      quantity,
      reason
    });
  };

  const filteredAdjustments = adjustments.filter(a => 
    a.reference.toLowerCase().includes(search.toLowerCase()) ||
    a.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Inventory Adjustments</h1>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><RotateCcw className="h-4 w-4 mr-2" /> Record Adjustment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Inventory Adjustment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select value={warehouse} onValueChange={setWarehouse}>
                  <SelectTrigger><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {warehouse && (
                <>
                  <div className="space-y-2">
                    <Label>Product in Stock</Label>
                    <Select value={productId} onValueChange={(val) => {
                      const stockItem = stockLevels.find(s => s.product_id === val);
                      setProductId(val);
                      if (stockItem) {
                        setLocationId(stockItem.location_id);
                        setQuantity(stockItem.quantity); // preload current stock
                      }
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                      <SelectContent>
                        {stockLevels.map(p => (
                          <SelectItem key={`${p.product_id}-${p.location_id}`} value={p.product_id}>
                            {p.product_name} (Current: {p.quantity} in {p.location_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Real Quantity (Counted)</Label>
                      <Input type="number" min="0" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 0)} required />
                      <p className="text-xs text-muted-foreground mt-1">Set the actual quantity observed.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason *</Label>
                    <Input value={reason} onChange={e => setReason(e.target.value)} required placeholder="e.g., Annual audit count, damage" />
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createMutation.isPending || !productId}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Adjustment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search adjustments..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
                <TableHead>Reference</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No adjustments found.</TableCell></TableRow>
              ) : (
                filteredAdjustments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.reference}</TableCell>
                    <TableCell>{a.product_name}</TableCell>
                    <TableCell>{a.location_name}</TableCell>
                    <TableCell>{a.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{a.reason}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === 'done' ? 'default' : 'destructive'}>
                        {a.status.toUpperCase()}
                      </Badge>
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
