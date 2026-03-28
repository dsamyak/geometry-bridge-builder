import { PlacedShape, getFormulaSteps, getPerimeterSteps } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";

interface FormulaBreakdownProps {
  shape: PlacedShape | null;
}

export function FormulaBreakdown({ shape }: FormulaBreakdownProps) {
  if (!shape) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-2">
          Formula Breakdown
        </h3>
        <p className="text-xs text-muted-foreground italic">
          Hover over a placed shape to see its geometry calculations
        </p>
      </div>
    );
  }

  const areaSteps = getFormulaSteps(shape.type, shape.width, shape.height);
  const perimSteps = getPerimeterSteps(shape.type, shape.width, shape.height);
  const colorClass = shape.type === "circle" ? "text-shape-circle" : shape.type === "rectangle" ? "text-shape-rect" : "text-shape-triangle";
  const typeLabel = shape.type.charAt(0).toUpperCase() + shape.type.slice(1);
  const strengthLabel = shape.type === "triangle" ? "HIGH (rigid)" : shape.type === "rectangle" ? "MEDIUM" : "LOW (point contact)";
  const strengthColor = shape.type === "triangle" ? "text-shape-triangle" : shape.type === "rectangle" ? "text-shape-rect" : "text-destructive";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={shape.id}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-card border border-border rounded-lg p-4"
      >
        <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">
          <span className={colorClass}>■</span> {typeLabel} Analysis
        </h3>

        {/* Dimensions */}
        <div className="text-xs text-muted-foreground mb-3 bg-muted/50 rounded p-2">
          {areaSteps.explanation}
        </div>

        {/* Area calculation */}
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Area (Cost)</div>
          <div className="space-y-1 bg-muted/30 rounded p-2 font-mono text-xs">
            <div className="text-muted-foreground">{areaSteps.formula}</div>
            <div className={colorClass}>{areaSteps.substitution}</div>
            <div className="text-foreground font-bold">{areaSteps.result}</div>
          </div>
        </div>

        {/* Perimeter calculation */}
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Perimeter</div>
          <div className="space-y-1 bg-muted/30 rounded p-2 font-mono text-xs">
            <div className="text-muted-foreground">{perimSteps.formula}</div>
            <div className={colorClass}>{perimSteps.substitution}</div>
            <div className="text-foreground font-bold">{perimSteps.result}</div>
          </div>
        </div>

        {/* Structural strength */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Structural Strength</div>
          <div className="bg-muted/30 rounded p-2">
            <div className={`text-xs font-bold ${strengthColor}`}>{strengthLabel}</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {shape.type === "triangle" && "Triangles cannot deform without changing side lengths — inherently rigid!"}
              {shape.type === "rectangle" && "Rectangles can shear into parallelograms under load."}
              {shape.type === "circle" && "Circles only contact surfaces at single points — unstable for bridging."}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${shape.type === "triangle" ? "bg-shape-triangle" : shape.type === "rectangle" ? "bg-shape-rect" : "bg-destructive"}`}
                  style={{ width: `${shape.type === "triangle" ? 100 : shape.type === "rectangle" ? 55 : 30}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {shape.supportStrength.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
