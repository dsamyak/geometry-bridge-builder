import React, { useRef, useCallback, useState } from "react";
import { PlacedShape, ShapeType, calculateArea, calculatePerimeter, calculateSupportStrength, generateId, StructuralAnalysis } from "@/types/game";
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
  vehicleY: number;
  showAnnotations: boolean;
  showForces: boolean;
  analysis: StructuralAnalysis | null;
  hoveredShapeId: string | null;
  onHoverShape: (id: string | null) => void;
  activeTool: "shape" | "ruler";
  onUpdateShape: (id: string, partial: Partial<PlacedShape>) => void;
}

function ShapeAnnotations({ shape, isHovered }: { shape: PlacedShape; isHovered: boolean }) {
  const labelColor = shape.type === "circle" ? "hsl(280,70%,70%)" : shape.type === "rectangle" ? "hsl(192,100%,70%)" : "hsl(145,70%,70%)";
  const dimColor = "hsl(210,20%,60%)";
  const fontSize = 8;

  if (shape.type === "circle") {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.width / 2;
    const r = shape.width / 2;
    return (
      <g>
        {/* Radius line */}
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={labelColor} strokeWidth={1} strokeDasharray="3 2" />
        <circle cx={cx} cy={cy} r={2} fill={labelColor} />
        {/* Radius label */}
        <text x={cx + r / 2} y={cy - 4} textAnchor="middle" fill={labelColor} fontSize={fontSize} fontFamily="JetBrains Mono">
          r={r.toFixed(0)}
        </text>
        {/* Diameter line */}
        <line x1={shape.x} y1={cy} x2={shape.x + shape.width} y2={cy} stroke={dimColor} strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
        {/* Area label */}
        {isHovered && (
          <text x={cx} y={cy + r + 14} textAnchor="middle" fill={labelColor} fontSize={fontSize} fontFamily="JetBrains Mono" fontWeight="bold">
            A = {shape.area.toFixed(0)}
          </text>
        )}
      </g>
    );
  }

  if (shape.type === "rectangle") {
    const midX = shape.x + shape.width / 2;
    const midY = shape.y + shape.height / 2;
    return (
      <g>
        {/* Width dimension */}
        <line x1={shape.x} y1={shape.y - 6} x2={shape.x + shape.width} y2={shape.y - 6} stroke={dimColor} strokeWidth={0.8} />
        <line x1={shape.x} y1={shape.y - 10} x2={shape.x} y2={shape.y - 2} stroke={dimColor} strokeWidth={0.6} />
        <line x1={shape.x + shape.width} y1={shape.y - 10} x2={shape.x + shape.width} y2={shape.y - 2} stroke={dimColor} strokeWidth={0.6} />
        <text x={midX} y={shape.y - 9} textAnchor="middle" fill={dimColor} fontSize={fontSize} fontFamily="JetBrains Mono">
          l={shape.width}
        </text>
        {/* Height dimension */}
        <line x1={shape.x + shape.width + 6} y1={shape.y} x2={shape.x + shape.width + 6} y2={shape.y + shape.height} stroke={dimColor} strokeWidth={0.8} />
        <line x1={shape.x + shape.width + 2} y1={shape.y} x2={shape.x + shape.width + 10} y2={shape.y} stroke={dimColor} strokeWidth={0.6} />
        <line x1={shape.x + shape.width + 2} y1={shape.y + shape.height} x2={shape.x + shape.width + 10} y2={shape.y + shape.height} stroke={dimColor} strokeWidth={0.6} />
        <text x={shape.x + shape.width + 12} y={midY + 3} textAnchor="start" fill={dimColor} fontSize={fontSize} fontFamily="JetBrains Mono">
          w={shape.height}
        </text>
        {/* Right angle markers */}
        <polyline points={`${shape.x + 8},${shape.y} ${shape.x + 8},${shape.y + 8} ${shape.x},${shape.y + 8}`} fill="none" stroke={dimColor} strokeWidth={0.6} />
        {/* Area label */}
        {isHovered && (
          <text x={midX} y={midY + 3} textAnchor="middle" fill={labelColor} fontSize={fontSize + 1} fontFamily="JetBrains Mono" fontWeight="bold">
            A = {shape.area.toFixed(0)}
          </text>
        )}
      </g>
    );
  }

  if (shape.type === "triangle") {
    const topX = shape.x + shape.width / 2;
    const topY = shape.y;
    const botL = shape.x;
    const botR = shape.x + shape.width;
    const botY = shape.y + shape.height;
    const sideLen = Math.sqrt((shape.width / 2) ** 2 + shape.height ** 2);
    // Interior angle at top
    const halfAngle = Math.atan2(shape.height, shape.width / 2) * (180 / Math.PI);

    return (
      <g>
        {/* Base dimension */}
        <line x1={botL} y1={botY + 8} x2={botR} y2={botY + 8} stroke={dimColor} strokeWidth={0.8} />
        <line x1={botL} y1={botY + 4} x2={botL} y2={botY + 12} stroke={dimColor} strokeWidth={0.6} />
        <line x1={botR} y1={botY + 4} x2={botR} y2={botY + 12} stroke={dimColor} strokeWidth={0.6} />
        <text x={(botL + botR) / 2} y={botY + 16} textAnchor="middle" fill={dimColor} fontSize={fontSize} fontFamily="JetBrains Mono">
          b={shape.width}
        </text>
        {/* Height dimension (dashed) */}
        <line x1={topX} y1={topY} x2={topX} y2={botY} stroke={dimColor} strokeWidth={0.8} strokeDasharray="3 2" />
        <text x={topX + 8} y={(topY + botY) / 2} textAnchor="start" fill={dimColor} fontSize={fontSize} fontFamily="JetBrains Mono">
          h={shape.height}
        </text>
        {/* Side length */}
        <text x={(topX + botR) / 2 + 6} y={(topY + botY) / 2 - 4} textAnchor="start" fill={dimColor} fontSize={fontSize - 1} fontFamily="JetBrains Mono" opacity={0.7}>
          s={sideLen.toFixed(0)}
        </text>
        {/* Angle arc at bottom-left */}
        <path
          d={`M ${botL + 15} ${botY} A 15 15 0 0 0 ${botL + 15 * Math.cos(Math.atan2(shape.height, shape.width / 2))} ${botY - 15 * Math.sin(Math.atan2(shape.height, shape.width / 2))}`}
          fill="none" stroke={labelColor} strokeWidth={0.8}
        />
        <text x={botL + 20} y={botY - 5} fill={labelColor} fontSize={fontSize - 1} fontFamily="JetBrains Mono">
          {halfAngle.toFixed(0)}°
        </text>
        {/* Area label */}
        {isHovered && (
          <text x={(botL + botR) / 2} y={botY - 8} textAnchor="middle" fill={labelColor} fontSize={fontSize + 1} fontFamily="JetBrains Mono" fontWeight="bold">
            A = ½×{shape.width}×{shape.height} = {shape.area.toFixed(0)}
          </text>
        )}
      </g>
    );
  }

  if (shape.type === "trapezoid") {
    const topW = shape.width / 2;
    const topX1 = shape.x + shape.width / 4;
    const topX2 = shape.x + shape.width * 0.75;
    const botY = shape.y + shape.height;
    return (
      <g>
        {/* Top dimension */}
        <line x1={topX1} y1={shape.y - 6} x2={topX2} y2={shape.y - 6} stroke={dimColor} strokeWidth={0.8} />
        <line x1={topX1} y1={shape.y - 10} x2={topX1} y2={shape.y - 2} stroke={dimColor} strokeWidth={0.6} />
        <line x1={topX2} y1={shape.y - 10} x2={topX2} y2={shape.y - 2} stroke={dimColor} strokeWidth={0.6} />
        <text x={(topX1 + topX2) / 2} y={shape.y - 9} textAnchor="middle" fill={dimColor} fontSize={fontSize} fontFamily="JetBrains Mono">
          a={topW}
        </text>
        {/* Bottom dimension */}
        <line x1={shape.x} y1={botY + 6} x2={shape.x + shape.width} y2={botY + 6} stroke={dimColor} strokeWidth={0.8} />
        <line x1={shape.x} y1={botY + 2} x2={shape.x} y2={botY + 10} stroke={dimColor} strokeWidth={0.6} />
        <line x1={shape.x + shape.width} y1={botY + 2} x2={shape.x + shape.width} y2={botY + 10} stroke={dimColor} strokeWidth={0.6} />
        <text x={shape.x + shape.width / 2} y={botY + 14} textAnchor="middle" fill={dimColor} fontSize={fontSize} fontFamily="JetBrains Mono">
          b={shape.width}
        </text>
        {/* Height dimension */}
        <line x1={topX2 + 8} y1={shape.y} x2={topX2 + 8} y2={botY} stroke={dimColor} strokeWidth={0.8} />
        <line x1={topX2 + 4} y1={shape.y} x2={topX2 + 12} y2={shape.y} stroke={dimColor} strokeWidth={0.6} />
        <line x1={topX2 + 4} y1={botY} x2={topX2 + 12} y2={botY} stroke={dimColor} strokeWidth={0.6} />
        <text x={topX2 + 14} y={(shape.y + botY) / 2 + 3} textAnchor="start" fill={dimColor} fontSize={fontSize} fontFamily="JetBrains Mono">
          h={shape.height}
        </text>
        {/* Area label */}
        {isHovered && (
          <text x={shape.x + shape.width / 2} y={(shape.y + botY) / 2 + 3} textAnchor="middle" fill={labelColor} fontSize={fontSize + 1} fontFamily="JetBrains Mono" fontWeight="bold">
            A = {shape.area.toFixed(0)}
          </text>
        )}
      </g>
    );
  }

  if (shape.type === "parallelogram") {
    return (
      <g>
        {isHovered && (
          <text x={shape.x + shape.width / 2} y={shape.y + shape.height / 2 + 4} textAnchor="middle" fill={labelColor} fontSize={fontSize + 1} fontFamily="JetBrains Mono" fontWeight="bold">
            A = {shape.area.toFixed(0)}
          </text>
        )}
      </g>
    );
  }

  if (shape.type === "hexagon") {
    return (
      <g>
        {isHovered && (
          <text x={shape.x + shape.width / 2} y={shape.y + shape.height / 2 + 4} textAnchor="middle" fill={labelColor} fontSize={fontSize + 1} fontFamily="JetBrains Mono" fontWeight="bold">
            A = {shape.area.toFixed(0)}
          </text>
        )}
      </g>
    );
  }

  return null;
}

function ForceVectors({ analysis, level }: { analysis: StructuralAnalysis; level: Level }) {
  const maxStrength = Math.max(...analysis.supportPoints.map((p) => p.strength), 1);
  return (
    <g>
      {/* Gravity arrows (downward) */}
      {[0.3, 0.5, 0.7].map((frac, i) => {
        const x = level.gapStart + (level.gapEnd - level.gapStart) * frac;
        return (
          <g key={`gravity-${i}`}>
            <line x1={x} y1={level.groundHeight - 140} x2={x} y2={level.groundHeight - 110} stroke="hsl(45, 100%, 55%)" strokeWidth={1.5} markerEnd="url(#arrowDown)" />
            <text x={x + 4} y={level.groundHeight - 125} fill="hsl(45, 100%, 55%)" fontSize={7} fontFamily="JetBrains Mono">
              {(level.vehicleWeight / 3).toFixed(0)}N
            </text>
          </g>
        );
      })}
      {/* Support strength bars */}
      {analysis.supportPoints.map((pt, i) => {
        const barHeight = (pt.strength / maxStrength) * 40;
        const isWeak = pt.strength < level.vehicleWeight / 20 * 0.5;
        return (
          <g key={`support-${i}`}>
            <rect
              x={pt.x - 3}
              y={level.groundHeight + 5}
              width={6}
              height={barHeight || 1}
              fill={isWeak ? "hsl(0, 75%, 55%)" : "hsl(145, 70%, 50%)"}
              opacity={0.6}
              rx={1}
            />
            {/* Upward reaction force */}
            {pt.strength > 0 && (
              <line
                x1={pt.x} y1={level.groundHeight}
                x2={pt.x} y2={level.groundHeight - Math.min(barHeight, 30)}
                stroke="hsl(145, 70%, 50%)"
                strokeWidth={1}
                opacity={0.4}
                markerEnd="url(#arrowUp)"
              />
            )}
          </g>
        );
      })}
      {/* Weak point warnings */}
      {analysis.weakPoints.slice(0, 5).map((wx, i) => (
        <g key={`weak-${i}`}>
          <text x={wx} y={level.groundHeight + 55} textAnchor="middle" fill="hsl(0, 75%, 55%)" fontSize={10}>
            ⚠
          </text>
        </g>
      ))}
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
  vehicleY,
  showAnnotations,
  showForces,
  analysis,
  hoveredShapeId,
  onHoverShape,
  activeTool,
  onUpdateShape,
}: GameCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasWidth = 800;
  const canvasHeight = 500;
  const [rulerStart, setRulerStart] = useState<{x: number, y: number} | null>(null);
  const [rulerEnd, setRulerEnd] = useState<{x: number, y: number} | null>(null);
  
  // Dragging state
  const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  const getCanvasCoords = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (simulationState !== "idle") return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (activeTool === "ruler") {
      setRulerStart(coords);
      setRulerEnd(coords);
      return;
    }

    // Check if we clicked on an existing shape (for dragging)
    // We traverse in reverse to pick the topmost shape
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      if (coords.x >= s.x && coords.x <= s.x + s.width && coords.y >= s.y && coords.y <= s.y + s.height) {
        setDraggingShapeId(s.id);
        setDragOffset({ x: coords.x - s.x, y: coords.y - s.y });
        onHoverShape(s.id); // Also set hover so it highlights
        return; // Don't place a new shape
      }
    }

    if (!selectedShape) return;
    const x = coords.x - shapeSize.width / 2;
    const y = coords.y - shapeSize.height / 2;

    if (y > level.groundHeight - 180 && y < level.groundHeight + 10) {
      const w = shapeSize.width;
      const h = selectedShape === "circle" ? shapeSize.width : shapeSize.height;
      const area = calculateArea(selectedShape, w, h);
      const perimeter = calculatePerimeter(selectedShape, w, h);
      const supportStrength = calculateSupportStrength(selectedShape, w, h);

      const touchesGround = (y + h) >= level.groundHeight - 5;
      const touchesShape = shapes.some((s) => {
        const sBottom = s.y + s.height;
        return Math.abs(y - sBottom) < 10 && x + w > s.x && x < s.x + s.width;
      });

      onAddShape({
        id: generateId(),
        type: selectedShape,
        x, y,
        width: w,
        height: h,
        rotation: 0,
        area,
        perimeter,
        supportStrength,
        grounded: touchesGround || touchesShape,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeTool === "ruler" && rulerStart) {
      const coords = getCanvasCoords(e);
      if (coords) setRulerEnd(coords);
      return;
    }

    if (draggingShapeId) {
      const coords = getCanvasCoords(e);
      if (coords) {
        const shape = shapes.find(s => s.id === draggingShapeId);
        if (shape) {
          let newX = coords.x - dragOffset.x;
          let newY = coords.y - dragOffset.y;
          // Constrain within vertical build bounds
          newY = Math.max(level.groundHeight - 180, Math.min(newY, level.groundHeight - 5));
          onUpdateShape(draggingShapeId, { x: newX, y: newY });
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (activeTool === "ruler") {
      setRulerStart(null);
      setRulerEnd(null);
    }
    if (draggingShapeId) {
      // Recompute grounded state
      const shape = shapes.find(s => s.id === draggingShapeId);
      if (shape) {
        const touchesGround = (shape.y + shape.height) >= level.groundHeight - 5;
        const touchesShape = shapes.some((s) => {
          if (s.id === shape.id) return false;
          const sBottom = s.y + s.height;
          return Math.abs(shape.y - sBottom) < 10 && shape.x + shape.width > s.x && shape.x < s.x + s.width;
        });
        onUpdateShape(draggingShapeId, { grounded: touchesGround || touchesShape });
      }
      setDraggingShapeId(null);
    }
  };

  const handleShapeClick = (e: React.MouseEvent, id: string) => {
    if (simulationState !== "idle") return;
    // Don't remove if we just dragged it
    if (draggingShapeId === id) return;
    e.stopPropagation();
    // Instead of deleting on simple click which conflicts with drag start,
    // we use Shift+Click or double click? Let's use Right Click (ContextMenu) to remove
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (simulationState !== "idle") return;
    e.stopPropagation();
    onRemoveShape(id);
  };

  const handleDoubleClickShape = (e: React.MouseEvent, id: string, currentRotation: number) => {
    e.stopPropagation();
    if (simulationState !== "idle") return;
    onUpdateShape(id, { rotation: (currentRotation + 45) % 360 });
  };

  const colorMap: Record<ShapeType, string> = {
    circle: "hsl(280, 70%, 60%)",
    rectangle: "hsl(192, 100%, 50%)",
    triangle: "hsl(145, 70%, 50%)",
    trapezoid: "hsl(35, 90%, 55%)",
    parallelogram: "hsl(12, 90%, 65%)",
    hexagon: "hsl(200, 90%, 65%)",
  };

  // Coverage indicator
  const gapWidth = level.gapEnd - level.gapStart;
  const coveragePixels = new Set<number>();
  shapes.forEach((shape) => {
    for (let px = Math.floor(Math.max(shape.x, level.gapStart)); px < Math.ceil(Math.min(shape.x + shape.width, level.gapEnd)); px++) {
      coveragePixels.add(px);
    }
  });
  const coveragePct = (coveragePixels.size / gapWidth * 100);

  return (
    <div className="relative w-full border-2 border-border rounded-lg overflow-hidden glow-primary">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-auto blueprint-grid bg-background"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: activeTool === "ruler" ? "crosshair" : (draggingShapeId ? "grabbing" : (selectedShape && simulationState === "idle" ? "crosshair" : "default")) }}
      >
        <defs>
          <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
            <path d="M 0 0 L 3 6 L 6 0" fill="hsl(45, 100%, 55%)" />
          </marker>
          <marker id="arrowUp" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto">
            <path d="M 0 6 L 3 0 L 6 6" fill="hsl(145, 70%, 50%)" />
          </marker>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(210, 30%, 20%)" />
            <stop offset="100%" stopColor="hsl(210, 30%, 12%)" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Coverage bar at top */}
        <rect x={level.gapStart} y={8} width={gapWidth} height={4} fill="hsl(210, 30%, 18%)" rx={2} />
        <rect x={level.gapStart} y={8} width={gapWidth * Math.min(coveragePct, 100) / 100} height={4}
          fill={coveragePct >= 60 ? "hsl(145, 70%, 50%)" : "hsl(0, 75%, 55%)"} rx={2} />
        <text x={level.gapEnd + 8} y={13} fill="hsl(210, 20%, 50%)" fontSize={8} fontFamily="JetBrains Mono">
          {coveragePct.toFixed(0)}% covered
        </text>

        {/* Ground */}
        <rect x={0} y={level.groundHeight} width={level.gapStart} height={canvasHeight - level.groundHeight}
          fill="url(#groundGrad)" stroke="hsl(192, 100%, 50%)" strokeWidth={2} strokeDasharray="4 2" />
        <rect x={level.gapEnd} y={level.groundHeight} width={canvasWidth - level.gapEnd}
          height={canvasHeight - level.groundHeight} fill="url(#groundGrad)" stroke="hsl(192, 100%, 50%)" strokeWidth={2} strokeDasharray="4 2" />

        {/* Cross-hatch in ground */}
        {[0, 1, 2, 3].map((i) => (
          <g key={`hatch-${i}`}>
            <line x1={20 + i * 60} y1={level.groundHeight + 10} x2={60 + i * 60} y2={level.groundHeight + 40}
              stroke="hsl(210, 20%, 25%)" strokeWidth={0.5} />
            <line x1={level.gapEnd + 20 + i * 60} y1={level.groundHeight + 10} x2={level.gapEnd + 60 + i * 60}
              y2={level.groundHeight + 40} stroke="hsl(210, 20%, 25%)" strokeWidth={0.5} />
          </g>
        ))}

        {/* Gap depth lines */}
        <line x1={level.gapStart} y1={level.groundHeight} x2={level.gapStart} y2={canvasHeight}
          stroke="hsl(0, 75%, 55%)" strokeWidth={1} strokeDasharray="6 3" opacity={0.4} />
        <line x1={level.gapEnd} y1={level.groundHeight} x2={level.gapEnd} y2={canvasHeight}
          stroke="hsl(0, 75%, 55%)" strokeWidth={1} strokeDasharray="6 3" opacity={0.4} />

        {/* Gap dimension */}
        <line x1={level.gapStart} y1={canvasHeight - 25} x2={level.gapEnd} y2={canvasHeight - 25}
          stroke="hsl(0, 60%, 50%)" strokeWidth={1} />
        <line x1={level.gapStart} y1={canvasHeight - 30} x2={level.gapStart} y2={canvasHeight - 20}
          stroke="hsl(0, 60%, 50%)" strokeWidth={1} />
        <line x1={level.gapEnd} y1={canvasHeight - 30} x2={level.gapEnd} y2={canvasHeight - 20}
          stroke="hsl(0, 60%, 50%)" strokeWidth={1} />
        <text x={(level.gapStart + level.gapEnd) / 2} y={canvasHeight - 12} textAnchor="middle"
          fill="hsl(0, 60%, 60%)" fontSize={10} fontFamily="JetBrains Mono">
          GAP = {level.gapEnd - level.gapStart} units
        </text>

        {/* Build zone */}
        {simulationState === "idle" && (
          <rect x={level.gapStart - 5} y={level.groundHeight - 180} width={gapWidth + 10} height={190}
            fill="none" stroke="hsl(192, 100%, 50%)" strokeWidth={0.5} strokeDasharray="8 4" opacity={0.2} />
        )}

        {/* Hint */}
        {simulationState === "idle" && shapes.length === 0 && (
          <g>
            <text x={(level.gapStart + level.gapEnd) / 2} y={level.groundHeight - 60} textAnchor="middle"
              fill="hsl(192, 100%, 50%)" fontSize={13} fontFamily="Space Grotesk" opacity={0.6}>
              Select a shape and click to place
            </text>
            <text x={(level.gapStart + level.gapEnd) / 2} y={level.groundHeight - 42} textAnchor="middle"
              fill="hsl(210, 20%, 45%)" fontSize={10} fontFamily="JetBrains Mono" opacity={0.5}>
              Each shape costs area in material budget
            </text>
          </g>
        )}

        {/* Ruler Line */}
        {activeTool === "ruler" && rulerStart && rulerEnd && (
          <g>
            <line 
              x1={rulerStart.x} y1={rulerStart.y} 
              x2={rulerEnd.x} y2={rulerEnd.y} 
              stroke="hsl(192, 100%, 60%)" 
              strokeWidth={2} 
              strokeDasharray="4 4" 
            />
            <circle cx={rulerStart.x} cy={rulerStart.y} r={4} fill="hsl(192, 100%, 60%)" />
            <circle cx={rulerEnd.x} cy={rulerEnd.y} r={4} fill="hsl(192, 100%, 60%)" />
            
            <rect 
              x={(rulerStart.x + rulerEnd.x) / 2 - 30} 
              y={(rulerStart.y + rulerEnd.y) / 2 - 20} 
              width={60} height={16} rx={4} 
              fill="hsl(210, 30%, 15%)" 
            />
            <text 
              x={(rulerStart.x + rulerEnd.x) / 2} 
              y={(rulerStart.y + rulerEnd.y) / 2 - 9} 
              textAnchor="middle" 
              fill="hsl(192, 100%, 60%)" 
              fontSize={10} 
              fontFamily="JetBrains Mono"
            >
              {Math.hypot(rulerEnd.x - rulerStart.x, rulerEnd.y - rulerStart.y).toFixed(1)} px
            </text>
          </g>
        )}

        {/* Placed shapes */}
        {shapes.map((shape) => {
          const color = colorMap[shape.type];
          const isHovered = hoveredShapeId === shape.id;
          const isDragging = draggingShapeId === shape.id;
          return (
            <g key={shape.id}
              onClick={(e) => handleShapeClick(e, shape.id)}
              onDoubleClick={(e) => handleDoubleClickShape(e, shape.id, shape.rotation || 0)}
              onContextMenu={(e) => handleContextMenu(e, shape.id)}
              onMouseEnter={() => onHoverShape(shape.id)}
              onMouseLeave={() => onHoverShape(null)}
              style={{ cursor: simulationState === "idle" ? (isDragging ? "grabbing" : "grab") : "default" }}
              transform={`rotate(${shape.rotation || 0} ${shape.x + shape.width / 2} ${shape.y + shape.height / 2})`}
            >
              {/* Shape */}
              {shape.type === "circle" && (
                <circle cx={shape.x + shape.width / 2} cy={shape.y + shape.width / 2} r={shape.width / 2}
                  fill={color} fillOpacity={isHovered ? 0.6 : 0.35} stroke={color}
                  strokeWidth={isHovered ? 3 : 2} filter={isHovered ? "url(#glow)" : undefined} />
              )}
              {shape.type === "rectangle" && (
                <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height}
                  fill={color} fillOpacity={isHovered ? 0.6 : 0.35} stroke={color}
                  strokeWidth={isHovered ? 3 : 2} filter={isHovered ? "url(#glow)" : undefined} />
              )}
              {shape.type === "triangle" && (
                <polygon
                  points={`${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}`}
                  fill={color} fillOpacity={isHovered ? 0.6 : 0.35} stroke={color}
                  strokeWidth={isHovered ? 3 : 2} filter={isHovered ? "url(#glow)" : undefined} />
              )}
              {shape.type === "trapezoid" && (
                <polygon
                  points={`${shape.x + Math.round(shape.width * 0.25)},${shape.y} ${shape.x + Math.round(shape.width * 0.75)},${shape.y} ${shape.x + shape.width},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}`}
                  fill={color} fillOpacity={isHovered ? 0.6 : 0.35} stroke={color}
                  strokeWidth={isHovered ? 3 : 2} filter={isHovered ? "url(#glow)" : undefined} />
              )}
              {shape.type === "parallelogram" && (
                <polygon
                  points={`${shape.x + Math.round(shape.width * 0.25)},${shape.y} ${shape.x + shape.width},${shape.y} ${shape.x + Math.round(shape.width * 0.75)},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}`}
                  fill={color} fillOpacity={isHovered ? 0.6 : 0.35} stroke={color}
                  strokeWidth={isHovered ? 3 : 2} filter={isHovered ? "url(#glow)" : undefined} />
              )}
              {shape.type === "hexagon" && (
                <polygon
                  points={`${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height * 0.25} ${shape.x + shape.width},${shape.y + shape.height * 0.75} ${shape.x + shape.width / 2},${shape.y + shape.height} ${shape.x},${shape.y + shape.height * 0.75} ${shape.x},${shape.y + shape.height * 0.25}`}
                  fill={color} fillOpacity={isHovered ? 0.6 : 0.35} stroke={color}
                  strokeWidth={isHovered ? 3 : 2} filter={isHovered ? "url(#glow)" : undefined} />
              )}
              {/* Annotations */}
              {showAnnotations && !isDragging && <ShapeAnnotations shape={shape} isHovered={isHovered} />}
            </g>
          );
        })}

        {/* Force vectors overlay */}
        {showForces && analysis && <ForceVectors analysis={analysis} level={level} />}

        {/* Vehicle */}
        {simulationState !== "idle" && (
          <g>
            <rect x={vehicleX} y={vehicleY - 12} width={40} height={15} rx={3}
              fill="hsl(45, 100%, 55%)" stroke="hsl(45, 100%, 40%)" strokeWidth={1.5} />
            <rect x={vehicleX + 8} y={vehicleY - 20} width={20} height={10} rx={2}
              fill="hsl(45, 90%, 50%)" stroke="hsl(45, 100%, 40%)" strokeWidth={1} />
            <circle cx={vehicleX + 10} cy={vehicleY + 5} r={5} fill="hsl(0, 0%, 20%)" stroke="hsl(0, 0%, 40%)" strokeWidth={1.5} />
            <circle cx={vehicleX + 32} cy={vehicleY + 5} r={5} fill="hsl(0, 0%, 20%)" stroke="hsl(0, 0%, 40%)" strokeWidth={1.5} />
            {/* Weight label */}
            <text x={vehicleX + 20} y={vehicleY - 24} textAnchor="middle" fill="hsl(45, 100%, 60%)" fontSize={8} fontFamily="JetBrains Mono">
              {level.vehicleWeight}N
            </text>
          </g>
        )}

        {/* Ground surface lines */}
        <line x1={0} y1={level.groundHeight} x2={level.gapStart} y2={level.groundHeight}
          stroke="hsl(192, 100%, 50%)" strokeWidth={2} />
        <line x1={level.gapEnd} y1={level.groundHeight} x2={canvasWidth} y2={level.groundHeight}
          stroke="hsl(192, 100%, 50%)" strokeWidth={2} />

        {/* Canvas info */}
        <text x={10} y={20} fill="hsl(210, 20%, 40%)" fontSize={9} fontFamily="JetBrains Mono">
          CANVAS {canvasWidth}×{canvasHeight} | LEVEL {level.id}
        </text>
      </svg>
    </div>
  );
}
