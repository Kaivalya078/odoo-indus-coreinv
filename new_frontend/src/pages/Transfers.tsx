import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transferService, TransferCreate } from "@/services/transferService";
import { productService } from "@/services/productService";
import { warehouseService } from "@/services/warehouseService";
import { Loader2, Plus, Search, CheckCircle2, XCircle, ArrowRightLeft } from "lucide-react";
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

export default function Transfers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [sourceWarehouse, setSourceWarehouse] = useState<string>("");
  const [destWarehouse, setDestWarehouse] = useState<string>("");
  const [items, setItems] = useState<Array<{ product_id: string; source_location_id: string; dest_location_id: string; quantity: number }>>([]);
  
  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["transfers", statusFilter],
    queryFn: () => transferService.getTransfers(statusFilter === "all" ? undefined : statusFilter),
  });

  const { data: warehouses = [] } = useQuery({ queryKey: ["warehouses"], queryFn: warehouseService.getWarehouses });
  
  const { data: sourceLocations = [] } = useQuery({ 
    queryKey: ["locations", sourceWarehouse], 
    queryFn: () => warehouseService.getLocations(sourceWarehouse),
    enabled: !!sourceWarehouse,
  });

  const { data: destLocations = [] } = useQuery({ 
    queryKey: ["locations", destWarehouse], 
    queryFn: () => warehouseService.getLocations(destWarehouse),
    enabled: !!destWarehouse,
  });

  const { data: stockLevels = [] } = useQuery({ 
    queryKey: ["stock", sourceWarehouse], 
    queryFn: () => stockService.getStockLevels({ warehouse_id: sourceWarehouse }),
    enabled: !!sourceWarehouse,
  });

  const createMutation = useMutation({
    mutationFn: (data: TransferCreate) => transferService.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transfer created successfully");
      setIsAddOpen(false);
      setItems([]);
      setSourceWarehouse("");
      setDestWarehouse("");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to create transfer"),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => transferService.validateTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transfer validated. Ready for moving.");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to validate transfer"),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => transferService.confirmTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transfer confirmed. Stock updated in both locations.");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to confirm transfer"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => transferService.cancelTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast.success("Transfer cancelled");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to cancel transfer"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWarehouse || !destWarehouse || items.length === 0) {
      toast.error("Please select warehouses and add at least one item.");
      return;
    }
    if (sourceWarehouse === destWarehouse) {
      toast.error("Source and destination warehouses cannot be the same.");
      return;
    }
    createMutation.mutate({
      source_warehouse_id: sourceWarehouse,
      dest_warehouse_id: destWarehouse,
      items,
    });
  };

  const addItemRow = () => setItems([...items, { product_id: "", source_location_id: "", dest_location_id: "", quantity: 1 }]);
  const updateItemRow = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  const removeItemRow = (index: number) => setItems(items.filter((_, i) => i !== index));

  const filteredTransfers = transfers.filter(t => 
    t.reference.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Internal Transfers</h1>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><ArrowRightLeft className="h-4 w-4 mr-2" /> Create Transfer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>New Internal Transfer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source Warehouse *</Label>
                  <Select value={sourceWarehouse} onValueChange={setSourceWarehouse}>
                    <SelectTrigger><SelectValue placeholder="From Warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destination Warehouse *</Label>
                  <Select value={destWarehouse} onValueChange={setDestWarehouse}>
                    <SelectTrigger><SelectValue placeholder="To Warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {sourceWarehouse && destWarehouse && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <Label>Items to Transfer</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                  </div>
                  {items.map((item, i) => {
                    // Filter available products based on stock in the source warehouse
                    const availableProducts = stockLevels.filter(s => s.quantity > 0);
                    
                    return (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-[2] space-y-1">
                        <Label className="text-xs">Product in Stock</Label>
                        <Select value={item.product_id} onValueChange={(val) => {
                          const stockItem = stockLevels.find(s => s.product_id === val);
                          updateItemRow(i, "product_id", val);
                          if (stockItem) {
                            updateItemRow(i, "source_location_id", stockItem.location_id);
                          }
                        }}>
                          <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                          <SelectContent>
                            {availableProducts.map(p => (
                              <SelectItem key={`${p.product_id}-${p.location_id}`} value={p.product_id}>
                                {p.product_name} ({p.quantity} {p.unit} in {p.location_name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Dest Location</Label>
                        <Select value={item.dest_location_id} onValueChange={(val) => updateItemRow(i, "dest_location_id", val)}>
                          <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
                          <SelectContent>
                            {destLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItemRow(i, "quantity", parseInt(e.target.value) || 1)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItemRow(i)}>
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )})}
                  {items.length === 0 && <p className="text-xs text-muted-foreground">No items added yet.</p>}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createMutation.isPending || items.length === 0}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Transfer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transfers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready (Validated)</SelectItem>
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
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transfers found.</TableCell></TableRow>
              ) : (
                filteredTransfers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.reference}</TableCell>
                    <TableCell>{t.source_warehouse_name}</TableCell>
                    <TableCell>{t.dest_warehouse_name}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'done' ? 'default' : t.status === 'ready' ? 'secondary' : t.status === 'cancelled' ? 'destructive' : 'outline'}>
                        {t.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.items.length}</TableCell>
                    <TableCell className="text-right space-x-2">
                       {t.status === 'draft' && (
                         <Button size="sm" variant="outline" onClick={() => validateMutation.mutate(t.id)}>Validate</Button>
                       )}
                       {t.status === 'ready' && (
                         <Button size="sm" variant="default" onClick={() => confirmMutation.mutate(t.id)}>
                           <CheckCircle2 className="h-4 w-4 mr-1"/> Confirm
                         </Button>
                       )}
                       {(t.status === 'draft' || t.status === 'ready') && (
                         <Button size="icon" variant="ghost" onClick={() => {
                           if(confirm("Cancel this transfer?")) cancelMutation.mutate(t.id);
                         }}>
                           <XCircle className="h-4 w-4 text-destructive" />
                         </Button>
                       )}
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
