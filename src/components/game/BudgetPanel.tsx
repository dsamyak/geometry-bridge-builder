import { motion } from "framer-motion";

interface BudgetPanelProps {
  budget: number;
  used: number;
  shapeBreakdown: { type: string; count: number; totalArea: number }[];
}

export function BudgetPanel({ budget, used, shapeBreakdown }: BudgetPanelProps) {
  const remaining = budget - used;
  const percentage = (used / budget) * 100;
  const isOver = remaining < 0;
  const isWarning = percentage > 75 && !isOver;

  const colorMap: Record<string, string> = {
    circle: "bg-shape-circle",
    rectangle: "bg-shape-rect",
    triangle: "bg-shape-triangle",
  };

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

      {/* Stacked bar */}
      <div className="h-4 bg-muted rounded-full overflow-hidden border border-border flex">
        {shapeBreakdown.map((b) => {
          const pct = (b.totalArea / budget) * 100;
          return pct > 0 ? (
            <motion.div
              key={b.type}
              className={`h-full ${colorMap[b.type] || "bg-primary"}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 80 }}
              style={{ opacity: 0.8 }}
              title={`${b.type}: ${Math.round(b.totalArea)} sq units`}
            />
          ) : null;
        })}
      </div>

      {/* Legend */}
      {shapeBreakdown.some((b) => b.count > 0) && (
        <div className="flex gap-3 mt-2 text-[10px]">
          {shapeBreakdown.filter((b) => b.count > 0).map((b) => (
            <div key={b.type} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-sm ${colorMap[b.type]}`} />
              <span className="text-muted-foreground">{b.count}× {b.type}</span>
              <span className="text-foreground font-mono">{Math.round(b.totalArea)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 text-right">
        <span className={`text-lg font-bold font-display ${
          isOver ? "text-destructive" : "text-primary glow-text"
        }`}>
          {Math.round(remaining).toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground ml-1">remaining</span>
      </div>

      {isOver && (
        <div className="mt-2 text-[10px] text-destructive bg-destructive/10 rounded p-1.5 text-center">
          Over budget! Remove shapes or use smaller dimensions.
        </div>
      )}
    </div>
  );
}
