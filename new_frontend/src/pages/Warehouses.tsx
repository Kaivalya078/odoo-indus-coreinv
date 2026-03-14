import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseService, WarehouseCreate, LocationCreate } from "@/services/warehouseService";
import { Loader2, Plus, Building2, MapPin, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Warehouses() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: warehouses = [], isLoading: whLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: warehouseService.getWarehouses,
  });

  const { data: locations = [], isLoading: locLoading } = useQuery({
    queryKey: ["locations", selectedWarehouseId],
    queryFn: () => warehouseService.getLocations(selectedWarehouseId || undefined),
    enabled: !!selectedWarehouseId,
  });

  // Automatically select first warehouse if none selected
  if (!selectedWarehouseId && warehouses.length > 0) {
    setSelectedWarehouseId(warehouses[0].id);
  }

  const whCreateMutation = useMutation({
    mutationFn: (data: WarehouseCreate) => warehouseService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse created");
      setIsAddWarehouseOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to create warehouse"),
  });

  const locCreateMutation = useMutation({
    mutationFn: (data: LocationCreate) => warehouseService.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", selectedWarehouseId] });
      toast.success("Location added");
      setIsAddLocationOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to add location"),
  });

  const locDeleteMutation = useMutation({
    mutationFn: (id: string) => warehouseService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", selectedWarehouseId] });
      toast.success("Location deleted");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to delete location"),
  });

  const handleCreateWarehouse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    whCreateMutation.mutate({
      name: fd.get("name") as string,
      address: fd.get("address") as string,
    });
  };

  const handleCreateLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedWarehouseId) return;
    const fd = new FormData(e.currentTarget);
    locCreateMutation.mutate({
      name: fd.get("name") as string,
      zone: fd.get("zone") as string,
      warehouse_id: selectedWarehouseId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Warehouses & Locations</h1>
        
        <Dialog open={isAddWarehouseOpen} onOpenChange={setIsAddWarehouseOpen}>
          <DialogTrigger asChild>
            <Button><Building2 className="h-4 w-4 mr-2" /> New Warehouse</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Warehouse</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWarehouse} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input name="address" />
              </div>
              <Button type="submit" disabled={whCreateMutation.isPending}>
                {whCreateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Warehouse
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Warehouses List */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold px-1">Warehouses</h2>
          {whLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-2">
              {warehouses.map(w => (
                <Card 
                  key={w.id} 
                  className={`cursor-pointer transition-colors hover:border-primary/50 ${selectedWarehouseId === w.id ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setSelectedWarehouseId(w.id)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {w.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground truncate">{w.address || "No address"}</p>
                  </CardHeader>
                </Card>
              ))}
              {warehouses.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No warehouses found.</p>}
            </div>
          )}
        </div>

        {/* Locations List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold">
              Locations {selectedWarehouseId && `in ${warehouses.find(w => w.id === selectedWarehouseId)?.name}`}
            </h2>
            <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={!selectedWarehouseId}>
                  <Plus className="h-4 w-4 mr-2" /> Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Location</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateLocation} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Location Name</Label>
                    <Input name="name" required placeholder="e.g. Aisle 1, Rack A" />
                  </div>
                  <div className="space-y-2">
                    <Label>Zone</Label>
                    <Input name="zone" placeholder="e.g. Zone A (Cold Storage)" />
                  </div>
                  <Button type="submit" disabled={locCreateMutation.isPending}>
                    {locCreateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Location
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg bg-card overflow-hidden">
            {!selectedWarehouseId ? (
              <div className="p-12 text-center text-muted-foreground">Select a warehouse to view its locations.</div>
            ) : locLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location Name</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No locations found in this warehouse.</TableCell></TableRow>
                  ) : (
                    locations.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {l.name}
                        </TableCell>
                        <TableCell>{l.zone || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => {
                            if(confirm("Delete this location?")) locDeleteMutation.mutate(l.id);
                          }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
