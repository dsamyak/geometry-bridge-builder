import { motion } from "framer-motion";

interface BudgetPanelProps {
  budget: number;
  used: number;
}

export function BudgetPanel({ budget, used }: BudgetPanelProps) {
  const remaining = budget - used;
  const percentage = (used / budget) * 100;
  const isOver = remaining < 0;
  const isWarning = percentage > 75 && !isOver;

  return (
    <div className="bg-card border border-border rounded-lg p-4 glow-primary">
      <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">
        Material Budget
      </h3>

      <div className="flex justify-between text-xs mb-2">
        <span className="text-muted-foreground">Used</span>
        <span className={isOver ? "text-destructive" : "text-primary"}>
          {Math.round(used).toLocaleString()} / {budget.toLocaleString()} sq units
        </span>
      </div>

      <div className="h-3 bg-muted rounded-full overflow-hidden border border-border">
        <motion.div
          className={`h-full rounded-full ${
            isOver ? "bg-destructive" : isWarning ? "bg-accent" : "bg-primary"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ type: "spring", stiffness: 100 }}
        />
      </div>

      <div className="mt-2 text-right">
        <span className={`text-lg font-bold font-display ${
          isOver ? "text-destructive" : "text-primary glow-text"
        }`}>
          {Math.round(remaining).toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground ml-1">remaining</span>
      </div>
    </div>
  );
}
