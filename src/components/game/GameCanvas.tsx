import { useRef, useCallback } from "react";
import { PlacedShape, ShapeType, calculateArea, generateId } from "@/types/game";
import type { Level } from "@/types/game";

interface GameCanvasProps {
  level: Level;
  shapes: PlacedShape[];
  onAddShape: (shape: PlacedShape) => void;
  onRemoveShape: (id: string) => void;
  selectedShape: ShapeType | null;
  shapeSize: { width: number; height: number };
  simulationState: "idle" | "running" | "success" | "fail";
  vehicleX: number;
}

function renderShape(shape: PlacedShape) {
  const colorMap = {
    circle: "hsl(280, 70%, 60%)",
    rectangle: "hsl(192, 100%, 50%)",
    triangle: "hsl(145, 70%, 50%)",
  };
  const color = colorMap[shape.type];
  const glowClass =
    shape.type === "circle"
      ? "shape-glow-circle"
      : shape.type === "rectangle"
      ? "shape-glow-rect"
      : "shape-glow-triangle";

  return (
    <g key={shape.id} className={glowClass} style={{ cursor: "pointer" }}>
      {shape.type === "circle" && (
        <circle
          cx={shape.x + shape.width / 2}
          cy={shape.y + shape.width / 2}
          r={shape.width / 2}
          fill={color}
          fillOpacity={0.4}
          stroke={color}
          strokeWidth={2}
        />
      )}
      {shape.type === "rectangle" && (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={color}
          fillOpacity={0.4}
          stroke={color}
          strokeWidth={2}
        />
      )}
      {shape.type === "triangle" && (
        <polygon
          points={`${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}`}
          fill={color}
          fillOpacity={0.4}
          stroke={color}
          strokeWidth={2}
        />
      )}
    </g>
  );
}

export function GameCanvas({
  level,
  shapes,
  onAddShape,
  onRemoveShape,
  selectedShape,
  shapeSize,
  simulationState,
  vehicleX,
}: GameCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasWidth = 800;
  const canvasHeight = 450;

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!selectedShape || simulationState !== "idle") return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      const x = (e.clientX - rect.left) * scaleX - shapeSize.width / 2;
      const y = (e.clientY - rect.top) * scaleY - shapeSize.height / 2;

      // Only allow placement in the gap area (bridge zone)
      if (y > level.groundHeight - 150 && y < level.groundHeight + 20) {
        const w = selectedShape === "circle" ? shapeSize.width : shapeSize.width;
        const h = selectedShape === "circle" ? shapeSize.width : shapeSize.height;
        const area = calculateArea(selectedShape, w, h);
        onAddShape({
          id: generateId(),
          type: selectedShape,
          x,
          y,
          width: w,
          height: h,
          rotation: 0,
          area,
        });
      }
    },
    [selectedShape, shapeSize, level, onAddShape, simulationState]
  );

  const handleShapeClick = (e: React.MouseEvent, id: string) => {
    if (simulationState !== "idle") return;
    e.stopPropagation();
    onRemoveShape(id);
  };

  // Vehicle
  const vehicleY = level.groundHeight - 25;

  return (
    <div className="relative w-full border-2 border-border rounded-lg overflow-hidden glow-primary">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-auto blueprint-grid bg-background"
        onClick={handleClick}
        style={{ cursor: selectedShape && simulationState === "idle" ? "crosshair" : "default" }}
      >
        {/* Ground - left side */}
        <rect
          x={0}
          y={level.groundHeight}
          width={level.gapStart}
          height={canvasHeight - level.groundHeight}
          fill="hsl(210, 30%, 18%)"
          stroke="hsl(192, 100%, 50%)"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
        {/* Ground - right side */}
        <rect
          x={level.gapEnd}
          y={level.groundHeight}
          width={canvasWidth - level.gapEnd}
          height={canvasHeight - level.groundHeight}
          fill="hsl(210, 30%, 18%)"
          stroke="hsl(192, 100%, 50%)"
          strokeWidth={2}
          strokeDasharray="4 2"
        />

        {/* Gap markers */}
        <line
          x1={level.gapStart}
          y1={level.groundHeight}
          x2={level.gapStart}
          y2={canvasHeight}
          stroke="hsl(0, 75%, 55%)"
          strokeWidth={1}
          strokeDasharray="6 3"
          opacity={0.5}
        />
        <line
          x1={level.gapEnd}
          y1={level.groundHeight}
          x2={level.gapEnd}
          y2={canvasHeight}
          stroke="hsl(0, 75%, 55%)"
          strokeWidth={1}
          strokeDasharray="6 3"
          opacity={0.5}
        />

        {/* Depth indicator */}
        <text x={(level.gapStart + level.gapEnd) / 2} y={canvasHeight - 15} textAnchor="middle" fill="hsl(0, 75%, 55%)" fontSize={11} fontFamily="JetBrains Mono" opacity={0.7}>
          ⚠ GAP: {level.gapEnd - level.gapStart}px
        </text>

        {/* Build zone hint */}
        {simulationState === "idle" && shapes.length === 0 && (
          <text x={(level.gapStart + level.gapEnd) / 2} y={level.groundHeight - 40} textAnchor="middle" fill="hsl(192, 100%, 50%)" fontSize={12} fontFamily="JetBrains Mono" opacity={0.5}>
            Click to place shapes here
          </text>
        )}

        {/* Placed shapes */}
        {shapes.map((shape) => (
          <g key={shape.id} onClick={(e) => handleShapeClick(e, shape.id)}>
            {renderShape(shape)}
          </g>
        ))}

        {/* Vehicle */}
        {simulationState !== "idle" && (
          <g>
            {/* Car body */}
            <rect
              x={vehicleX}
              y={vehicleY - 12}
              width={40}
              height={15}
              rx={3}
              fill="hsl(45, 100%, 55%)"
              stroke="hsl(45, 100%, 40%)"
              strokeWidth={1.5}
            />
            <rect
              x={vehicleX + 8}
              y={vehicleY - 20}
              width={20}
              height={10}
              rx={2}
              fill="hsl(45, 90%, 50%)"
              stroke="hsl(45, 100%, 40%)"
              strokeWidth={1}
            />
            {/* Wheels */}
            <circle cx={vehicleX + 10} cy={vehicleY + 5} r={5} fill="hsl(0, 0%, 20%)" stroke="hsl(0, 0%, 40%)" strokeWidth={1.5} />
            <circle cx={vehicleX + 32} cy={vehicleY + 5} r={5} fill="hsl(0, 0%, 20%)" stroke="hsl(0, 0%, 40%)" strokeWidth={1.5} />
          </g>
        )}

        {/* Ground surface line */}
        <line x1={0} y1={level.groundHeight} x2={level.gapStart} y2={level.groundHeight} stroke="hsl(192, 100%, 50%)" strokeWidth={2} />
        <line x1={level.gapEnd} y1={level.groundHeight} x2={canvasWidth} y2={level.groundHeight} stroke="hsl(192, 100%, 50%)" strokeWidth={2} />

        {/* Dimension markers */}
        <text x={10} y={20} fill="hsl(210, 20%, 50%)" fontSize={10} fontFamily="JetBrains Mono">
          {canvasWidth} × {canvasHeight}
        </text>
      </svg>
    </div>
  );
}
