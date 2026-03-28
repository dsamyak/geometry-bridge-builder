import { motion } from "framer-motion";
import { Play, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimulationControlsProps {
  simulationState: "idle" | "running" | "success" | "fail";
  onTest: () => void;
  onReset: () => void;
  onClear: () => void;
  shapeCount: number;
  overBudget: boolean;
}

export function SimulationControls({
  simulationState,
  onTest,
  onReset,
  onClear,
  shapeCount,
  overBudget,
}: SimulationControlsProps) {
  return (
    <div className="flex gap-2">
      {simulationState === "idle" ? (
        <>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
            <Button
              onClick={onTest}
              disabled={shapeCount === 0 || overBudget}
              className="w-full bg-success text-success-foreground hover:bg-success/90 font-display uppercase tracking-wider text-sm"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Test Bridge
            </Button>
          </motion.div>
          <Button
            onClick={onClear}
            variant="outline"
            size="lg"
            disabled={shapeCount === 0}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
          <Button
            onClick={onReset}
            className="w-full font-display uppercase tracking-wider text-sm"
            variant="outline"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {simulationState === "running" ? "Stop" : "Try Again"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
