import { StructuralAnalysis } from "@/types/game";
import { motion } from "framer-motion";

interface StructuralPanelProps {
  analysis: StructuralAnalysis;
}

function Meter({ label, value, max, color, unit }: { label: string; value: number; max: number; color: string; unit: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const isGood = pct >= 60;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={isGood ? "text-success" : "text-destructive"}>
          {(value).toFixed(1)} / {max.toFixed(0)} {unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

export function StructuralPanel({ analysis }: StructuralPanelProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">
        Structural Analysis
      </h3>

      <Meter
        label="Gap Coverage"
        value={analysis.coverageRatio * 100}
        max={100}
        color={analysis.coverageRatio >= 0.6 ? "bg-success" : "bg-destructive"}
        unit="%"
      />

      <Meter
        label="Load Capacity"
        value={analysis.strengthRatio * 100}
        max={200}
        color={analysis.strengthRatio >= 0.7 ? "bg-success" : "bg-destructive"}
        unit="%"
      />

      {analysis.hasTriangles && (
        <div className="flex items-center gap-2 mt-2 bg-shape-triangle/10 rounded p-2">
          <span className="text-shape-triangle text-xs">▲</span>
          <span className="text-[10px] text-shape-triangle">
            Triangle bonus: +{(analysis.triangleBonus * 100).toFixed(0)}% strength
          </span>
        </div>
      )}

      {analysis.weakPoints.length > 0 && (
        <div className="mt-2 bg-destructive/10 rounded p-2">
          <span className="text-[10px] text-destructive">
            ⚠ {analysis.weakPoints.length} weak point{analysis.weakPoints.length > 1 ? "s" : ""} detected — add more shapes!
          </span>
        </div>
      )}

      {/* Verdict */}
      <div className={`mt-3 text-center rounded p-2 border ${
        analysis.willHold ? "border-success/30 bg-success/10" : "border-destructive/30 bg-destructive/10"
      }`}>
        <span className={`text-xs font-display font-bold uppercase tracking-wider ${
          analysis.willHold ? "text-success" : "text-destructive"
        }`}>
          {analysis.willHold ? "✓ Structure looks stable" : "✗ Structure will fail"}
        </span>
      </div>
    </div>
  );
}
