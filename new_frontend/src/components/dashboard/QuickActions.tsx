import { useState } from "react";
import { Plus, Receipt, Truck, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const actions = [
  { label: "Add Product", icon: Plus, color: "bg-accent text-accent-foreground" },
  { label: "Create Receipt", icon: Receipt, color: "bg-secondary text-secondary-foreground" },
  { label: "Create Delivery", icon: Truck, color: "bg-secondary text-secondary-foreground" },
  { label: "Transfer Stock", icon: ArrowRightLeft, color: "bg-secondary text-secondary-foreground" },
];

export function QuickActions() {
  const [openModal, setOpenModal] = useState<string | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            onClick={() => setOpenModal(action.label)}
            className="gap-2 rounded-lg border-border"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>

      <Dialog open={!!openModal} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{openModal}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This feature will be available when the backend is connected. This is a placeholder modal for <strong>{openModal}</strong>.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
