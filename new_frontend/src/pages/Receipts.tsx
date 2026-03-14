import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { receiptService, ReceiptCreate } from "@/services/receiptService";
import { productService } from "@/services/productService";
import { warehouseService } from "@/services/warehouseService";
import { supplierService } from "@/services/supplierService";
import { Loader2, Plus, Search, CheckCircle2, XCircle } from "lucide-react";
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

export default function Receipts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [items, setItems] = useState<Array<{ product_id: string; location_id: string; quantity: number }>>([]);
  
  const queryClient = useQueryClient();

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ["receipts", statusFilter],
    queryFn: () => receiptService.getReceipts(statusFilter === "all" ? undefined : statusFilter),
  });

  const { data: suppliers = [] } = useQuery({ queryKey: ["suppliers"], queryFn: supplierService.getSuppliers });
  const { data: warehouses = [] } = useQuery({ queryKey: ["warehouses"], queryFn: warehouseService.getWarehouses });
  const { data: locations = [] } = useQuery({ 
    queryKey: ["locations", selectedWarehouse], 
    queryFn: () => warehouseService.getLocations(selectedWarehouse),
    enabled: !!selectedWarehouse,
  });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => productService.getProducts() });

  const createMutation = useMutation({
    mutationFn: (data: ReceiptCreate) => receiptService.createReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt created successfully");
      setIsAddOpen(false);
      setItems([]);
      setSelectedSupplier("");
      setSelectedWarehouse("");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to create receipt"),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => receiptService.validateReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt validated");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to validate receipt"),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => receiptService.confirmReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt confirmed. Stock updated.");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to confirm receipt"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => receiptService.cancelReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt cancelled");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to cancel receipt"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse || items.length === 0) {
      toast.error("Please select a warehouse and add at least one item.");
      return;
    }
    createMutation.mutate({
      supplier_id: selectedSupplier || undefined,
      warehouse_id: selectedWarehouse,
      items,
    });
  };

  const addItemRow = () => setItems([...items, { product_id: "", location_id: "", quantity: 1 }]);
  const updateItemRow = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  const removeItemRow = (index: number) => setItems(items.filter((_, i) => i !== index));

  const filteredReceipts = receipts.filter(r => 
    r.reference.toLowerCase().includes(search.toLowerCase()) || 
    r.supplier_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Receipts</h1>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Create Receipt</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Receipt</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Warehouse *</Label>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedWarehouse && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <Label>Items to Receive</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Product</Label>
                        <Select value={item.product_id} onValueChange={(val) => updateItemRow(i, "product_id", val)}>
                          <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                          <SelectContent>
                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Location</Label>
                        <Select value={item.location_id} onValueChange={(val) => updateItemRow(i, "location_id", val)}>
                          <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
                          <SelectContent>
                            {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
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
                  ))}
                  {items.length === 0 && <p className="text-xs text-muted-foreground">No items added yet.</p>}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createMutation.isPending || items.length === 0}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Draft
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search receipts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No receipts found.</TableCell></TableRow>
              ) : (
                filteredReceipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.reference}</TableCell>
                    <TableCell>{r.supplier_name || "—"}</TableCell>
                    <TableCell>{r.warehouse_name}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'done' ? 'default' : r.status === 'ready' ? 'secondary' : r.status === 'cancelled' ? 'destructive' : 'outline'}>
                        {r.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.items.length}</TableCell>
                    <TableCell className="text-right space-x-2">
                       {r.status === 'draft' && (
                         <Button size="sm" variant="outline" onClick={() => validateMutation.mutate(r.id)}>Validate</Button>
                       )}
                       {r.status === 'ready' && (
                         <Button size="sm" variant="default" onClick={() => confirmMutation.mutate(r.id)}>
                           <CheckCircle2 className="h-4 w-4 mr-1"/> Confirm
                         </Button>
                       )}
                       {(r.status === 'draft' || r.status === 'ready') && (
                         <Button size="icon" variant="ghost" onClick={() => {
                           if(confirm("Cancel this receipt?")) cancelMutation.mutate(r.id);
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
