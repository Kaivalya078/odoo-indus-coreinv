import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryService, DeliveryCreate } from "@/services/deliveryService";
import { productService } from "@/services/productService";
import { warehouseService } from "@/services/warehouseService";
import { Loader2, Plus, Search, CheckCircle2, XCircle, Truck } from "lucide-react";
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

export default function Deliveries() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [customerName, setCustomerName] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [items, setItems] = useState<Array<{ product_id: string; location_id: string; quantity: number }>>([]);
  
  const queryClient = useQueryClient();

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["deliveries", statusFilter],
    queryFn: () => deliveryService.getDeliveries(statusFilter === "all" ? undefined : statusFilter),
  });

  const { data: warehouses = [] } = useQuery({ queryKey: ["warehouses"], queryFn: warehouseService.getWarehouses });
  const { data: locations = [] } = useQuery({ 
    queryKey: ["locations", selectedWarehouse], 
    queryFn: () => warehouseService.getLocations(selectedWarehouse),
    enabled: !!selectedWarehouse,
  });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => productService.getProducts() });

  const createMutation = useMutation({
    mutationFn: (data: DeliveryCreate) => deliveryService.createDelivery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Delivery created successfully");
      setIsAddOpen(false);
      setItems([]);
      setCustomerName("");
      setSelectedWarehouse("");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to create delivery"),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => deliveryService.validateDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Delivery validated. Ready for picking.");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to validate delivery"),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => deliveryService.confirmDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Delivery confirmed. Stock deducted.");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to confirm delivery"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => deliveryService.cancelDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Delivery cancelled");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to cancel delivery"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse || items.length === 0 || !customerName) {
      toast.error("Please fill all required fields and add at least one item.");
      return;
    }
    createMutation.mutate({
      customer_name: customerName,
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

  const filteredDeliveries = deliveries.filter(d => 
    d.reference.toLowerCase().includes(search.toLowerCase()) || 
    d.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Truck className="h-4 w-4 mr-2" /> Create Delivery</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Delivery</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Source Warehouse *</Label>
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
                    <Label>Items to Deliver</Label>
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
          <Input placeholder="Search deliveries..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <TableHead>Customer</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No deliveries found.</TableCell></TableRow>
              ) : (
                filteredDeliveries.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.reference}</TableCell>
                    <TableCell>{d.customer_name}</TableCell>
                    <TableCell>{d.warehouse_name}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'done' ? 'default' : d.status === 'ready' ? 'secondary' : d.status === 'cancelled' ? 'destructive' : 'outline'}>
                        {d.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.items.length}</TableCell>
                    <TableCell className="text-right space-x-2">
                       {d.status === 'draft' && (
                         <Button size="sm" variant="outline" onClick={() => validateMutation.mutate(d.id)}>Validate</Button>
                       )}
                       {d.status === 'ready' && (
                         <Button size="sm" variant="default" onClick={() => confirmMutation.mutate(d.id)}>
                           <CheckCircle2 className="h-4 w-4 mr-1"/> Confirm
                         </Button>
                       )}
                       {(d.status === 'draft' || d.status === 'ready') && (
                         <Button size="icon" variant="ghost" onClick={() => {
                           if(confirm("Cancel this delivery?")) cancelMutation.mutate(d.id);
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
