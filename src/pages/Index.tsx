import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PlacedShape, ShapeType, LEVELS, Level } from "@/types/game";
import { GameCanvas } from "@/components/game/GameCanvas";
import { ShapePalette } from "@/components/game/ShapePalette";
import { BudgetPanel } from "@/components/game/BudgetPanel";
import { SimulationControls } from "@/components/game/SimulationControls";
import { ResultOverlay } from "@/components/game/ResultOverlay";
import { LevelSelector } from "@/components/game/LevelSelector";
import { Ruler, Triangle } from "lucide-react";

type SimState = "idle" | "running" | "success" | "fail";

export default function Index() {
  const [level, setLevel] = useState<Level>(LEVELS[0]);
  const [shapes, setShapes] = useState<PlacedShape[]>([]);
  const [selectedShape, setSelectedShape] = useState<ShapeType | null>("rectangle");
  const [shapeSize, setShapeSize] = useState({ width: 60, height: 40 });
  const [simState, setSimState] = useState<SimState>("idle");
  const [vehicleX, setVehicleX] = useState(20);
  const animRef = useRef<number>();

  const totalUsed = shapes.reduce((sum, s) => sum + s.area, 0);
  const overBudget = totalUsed > level.budget;

  const addShape = useCallback((shape: PlacedShape) => {
    setShapes((prev) => [...prev, shape]);
  }, []);

  const removeShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearShapes = useCallback(() => setShapes([]), []);

  const checkBridgeCoverage = useCallback(() => {
    // Check if shapes collectively cover the gap
    const gapWidth = level.gapEnd - level.gapStart;
    const bridgeZone = new Array(Math.ceil(gapWidth)).fill(false);

    shapes.forEach((shape) => {
      const shapeLeft = shape.x;
      const shapeRight = shape.x + shape.width;
      for (let px = Math.max(shapeLeft, level.gapStart); px < Math.min(shapeRight, level.gapEnd); px++) {
        const idx = Math.floor(px - level.gapStart);
        if (idx >= 0 && idx < bridgeZone.length) {
          bridgeZone[idx] = true;
        }
      }
    });

    const covered = bridgeZone.filter(Boolean).length;
    const coverageRatio = covered / gapWidth;

    // Need triangles for structural strength bonus
    const hasTriangles = shapes.some((s) => s.type === "triangle");
    const strengthBonus = hasTriangles ? 0.15 : 0;

    return coverageRatio + strengthBonus >= 0.7;
  }, [shapes, level]);

  const runSimulation = useCallback(() => {
    setSimState("running");
    setVehicleX(20);

    const willSucceed = checkBridgeCoverage();
    const failPoint = level.gapStart + (level.gapEnd - level.gapStart) * (0.3 + Math.random() * 0.4);
    const endPoint = level.gapEnd + 120;

    let x = 20;
    const speed = 2;

    const animate = () => {
      x += speed;
      setVehicleX(x);

      if (!willSucceed && x >= failPoint) {
        setSimState("fail");
        return;
      }

      if (x >= endPoint) {
        setSimState("success");
        return;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
  }, [checkBridgeCoverage, level]);

  const resetSim = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setSimState("idle");
    setVehicleX(20);
  }, []);

  const changeLevel = useCallback((l: Level) => {
    resetSim();
    setShapes([]);
    setLevel(l);
  }, [resetSim]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/20 border border-primary rounded-lg flex items-center justify-center">
            <Triangle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground glow-text">
              Geometry Architect
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Ruler className="w-3 h-3" /> Design structures using mathematical shapes
            </p>
          </div>
        </div>
        <LevelSelector currentLevel={level} onSelect={changeLevel} />
      </motion.header>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Canvas area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <GameCanvas
            level={level}
            shapes={shapes}
            onAddShape={addShape}
            onRemoveShape={removeShape}
            selectedShape={selectedShape}
            shapeSize={shapeSize}
            simulationState={simState}
            vehicleX={vehicleX}
          />
          <ResultOverlay state={simState} />
        </motion.div>

        {/* Side panel */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <BudgetPanel budget={level.budget} used={totalUsed} />
          <ShapePalette
            selectedShape={selectedShape}
            onSelect={setSelectedShape}
            shapeSize={shapeSize}
            onSizeChange={setShapeSize}
          />
          <SimulationControls
            simulationState={simState}
            onTest={runSimulation}
            onReset={resetSim}
            onClear={clearShapes}
            shapeCount={shapes.length}
            overBudget={overBudget}
          />

          {/* Shape count */}
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground">Placed shapes: </span>
            <span className="text-sm font-bold text-foreground">{shapes.length}</span>
            {shapes.length > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                ({shapes.filter((s) => s.type === "triangle").length}△{" "}
                {shapes.filter((s) => s.type === "rectangle").length}▬{" "}
                {shapes.filter((s) => s.type === "circle").length}●)
              </span>
            )}
          </div>

          {/* Tips */}
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="text-primary font-bold">TIP:</span> Triangles provide structural strength bonus.
              Cover at least 70% of the gap. Click placed shapes to remove them.
            </p>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
