import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { PlacedShape, ShapeType, LEVELS, Level, analyzeStructure } from "@/types/game";
import { GameCanvas } from "@/components/game/GameCanvas";
import { ShapePalette } from "@/components/game/ShapePalette";
import { BudgetPanel } from "@/components/game/BudgetPanel";
import { SimulationControls } from "@/components/game/SimulationControls";
import { ResultOverlay } from "@/components/game/ResultOverlay";
import { LevelSelector } from "@/components/game/LevelSelector";
import { FormulaBreakdown } from "@/components/game/FormulaBreakdown";
import { StructuralPanel } from "@/components/game/StructuralPanel";
import { CalculationPad } from "@/components/game/CalculationPad";
import { Ruler, Triangle, Eye, EyeOff, Zap, ZapOff } from "lucide-react";

type SimState = "idle" | "running" | "success" | "fail";

export default function Index() {
  const [level, setLevel] = useState<Level>(LEVELS[0]);
  const [shapes, setShapes] = useState<PlacedShape[]>([]);
  const [selectedShape, setSelectedShape] = useState<ShapeType | null>("rectangle");
  const [shapeSize, setShapeSize] = useState({ width: 60, height: 40 });
  const [simState, setSimState] = useState<SimState>("idle");
  const [vehicleX, setVehicleX] = useState(20);
  const [vehicleY, setVehicleY] = useState(level.groundHeight - 25);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showForces, setShowForces] = useState(true);
  const [activeTool, setActiveTool] = useState<"shape" | "ruler">("shape");
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const animRef = useRef<number>();

  const totalUsed = shapes.reduce((sum, s) => sum + s.area, 0);
  const overBudget = totalUsed > level.budget;

  const analysis = useMemo(() => {
    if (shapes.length === 0) return null;
    return analyzeStructure(shapes, level);
  }, [shapes, level]);

  const shapeBreakdown = useMemo(() => {
    const types: ShapeType[] = ["circle", "rectangle", "triangle"];
    return types.map((type) => {
      const ofType = shapes.filter((s) => s.type === type);
      return { type, count: ofType.length, totalArea: ofType.reduce((s, sh) => s + sh.area, 0) };
    });
  }, [shapes]);

  const hoveredShape = useMemo(() => {
    if (!hoveredShapeId) return null;
    return shapes.find((s) => s.id === hoveredShapeId) || null;
  }, [hoveredShapeId, shapes]);

  const addShape = useCallback((shape: PlacedShape) => {
    setShapes((prev) => [...prev, shape]);
  }, []);

  const removeShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    if (hoveredShapeId === id) setHoveredShapeId(null);
  }, [hoveredShapeId]);

  const clearShapes = useCallback(() => {
    setShapes([]);
    setHoveredShapeId(null);
  }, []);

  const runSimulation = useCallback(() => {
    if (!analysis) return;
    setSimState("running");
    setVehicleX(20);
    setVehicleY(level.groundHeight - 25);

    const willSucceed = analysis.willHold;
    const failPoint = level.gapStart + (level.gapEnd - level.gapStart) * (0.3 + Math.random() * 0.3);
    const endPoint = level.gapEnd + 140;

    let x = 20;
    let y = level.groundHeight - 25;
    const speed = 1.5;
    let falling = false;
    let fallSpeed = 0;

    const animate = () => {
      if (falling) {
        fallSpeed += 0.5;
        y += fallSpeed;
        setVehicleY(y);
        if (y > level.groundHeight + 100) {
          setSimState("fail");
          return;
        }
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      x += speed;
      setVehicleX(x);

      if (!willSucceed && x >= failPoint) {
        falling = true;
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      if (x >= endPoint) {
        setSimState("success");
        return;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
  }, [analysis, level]);

  const resetSim = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setSimState("idle");
    setVehicleX(20);
    setVehicleY(level.groundHeight - 25);
  }, [level]);

  const changeLevel = useCallback((l: Level) => {
    resetSim();
    setShapes([]);
    setHoveredShapeId(null);
    setLevel(l);
    setVehicleY(l.groundHeight - 25);
  }, [resetSim]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div className="min-h-screen bg-background p-3 md:p-5">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/20 border border-primary rounded-lg flex items-center justify-center">
              <Triangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground glow-text">
                Geometry Architect
              </h1>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Learn geometry through structural engineering
              </p>
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTool(activeTool === "shape" ? "ruler" : "shape")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider border transition-colors ${
                activeTool === "ruler" ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              <Ruler className="w-3 h-3" />
              Ruler
            </button>
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider border transition-colors ${
                showAnnotations ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {showAnnotations ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              Dimensions
            </button>
            <button
              onClick={() => setShowForces(!showForces)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] uppercase tracking-wider border transition-colors ${
                showForces ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground"
              }`}
            >
              {showForces ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
              Forces
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <LevelSelector currentLevel={level} onSelect={changeLevel} />
          <p className="text-[10px] text-muted-foreground hidden md:block max-w-xs text-right">
            {level.description}
          </p>
        </div>
      </motion.header>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Canvas + bottom info */}
        <div className="space-y-3">
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
              vehicleY={vehicleY}
              showAnnotations={showAnnotations}
              showForces={showForces}
              analysis={analysis}
              hoveredShapeId={hoveredShapeId}
              onHoverShape={setHoveredShapeId}
              activeTool={activeTool}
            />
            <ResultOverlay state={simState} />
          </motion.div>

          {/* Bottom panels: formula + structural */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormulaBreakdown shape={hoveredShape} />
            {analysis && <StructuralPanel analysis={analysis} />}
            <CalculationPad />
          </div>
        </div>

        {/* Side panel */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <BudgetPanel budget={level.budget} used={totalUsed} shapeBreakdown={shapeBreakdown} />
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

          {/* Geometry concepts reference */}
          <div className="bg-card border border-border rounded-lg p-3">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-display">
              Key Concepts
            </h4>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-start gap-2">
                <span className="text-shape-triangle mt-0.5">▲</span>
                <span className="text-muted-foreground">
                  <span className="text-foreground font-bold">Triangles</span> are rigid — they can't deform without changing side lengths. Cost = ½ × base × height.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-shape-rect mt-0.5">▬</span>
                <span className="text-muted-foreground">
                  <span className="text-foreground font-bold">Rectangles</span> can shear under load. Good coverage but less stable. Cost = length × width.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-shape-circle mt-0.5">●</span>
                <span className="text-muted-foreground">
                  <span className="text-foreground font-bold">Circles</span> have point contact — weakest for bridging but useful as rollers. Cost = π × r².
                </span>
              </div>
            </div>
          </div>

          {/* Shape count */}
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground">Placed: </span>
            <span className="text-sm font-bold text-foreground">{shapes.length}</span>
            {shapes.length > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                ({shapes.filter((s) => s.type === "triangle").length}△ {shapes.filter((s) => s.type === "rectangle").length}▬ {shapes.filter((s) => s.type === "circle").length}●)
              </span>
            )}
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
