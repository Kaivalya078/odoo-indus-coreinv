import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{dateStr} | {timeStr}</p>
      </div>

      <div className="hidden md:flex items-center relative max-w-md flex-1 mx-8">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products, receipts, deliveries, warehouses..."
          className="pl-9 bg-secondary border-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="bg-foreground text-background hover:bg-foreground/90">
          Update
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
