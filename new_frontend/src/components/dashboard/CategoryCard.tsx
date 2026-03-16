import { motion } from "framer-motion";
import { Cpu, Armchair, Boxes, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = { Cpu, Armchair, Boxes };

interface CategoryCardProps {
  name: string;
  value: number;
  icon: string;
  index?: number;
}

export function CategoryCard({ name, value, icon, index = 0 }: CategoryCardProps) {
  const Icon = iconMap[icon] || Boxes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
      className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-shadow border border-border"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-highlight flex items-center justify-center">
          <Icon className="h-5 w-5 text-highlight-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-card-foreground">{name}</p>
          <p className="text-lg font-bold text-card-foreground">${value.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
}
