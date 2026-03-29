import { ShapeType } from "@/types/game";
import { motion } from "framer-motion";

interface ShapePaletteProps {
  selectedShape: ShapeType | null;
  onSelect: (shape: ShapeType) => void;
  shapeSize: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
}

const shapes: { type: ShapeType; label: string; formula: string; colorClass: string }[] = [
  { type: "circle", label: "Circle", formula: "A = πr²", colorClass: "shape-circle" },
  { type: "rectangle", label: "Rectangle", formula: "A = l × w", colorClass: "shape-rect" },
  { type: "triangle", label: "Triangle", formula: "A = ½bh", colorClass: "shape-triangle" },
  { type: "trapezoid", label: "Trapezoid", formula: "A = ½(a+b)h", colorClass: "shape-trapezoid" },
  { type: "parallelogram", label: "Parallelogram", formula: "A = bh", colorClass: "shape-parallelogram" },
  { type: "hexagon", label: "Hexagon", formula: "A = (3√3/2)s²", colorClass: "shape-hexagon" },
];

function ShapeIcon({ type, size = 32 }: { type: ShapeType; size?: number }) {
  const half = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {type === "circle" && (
        <circle cx={half} cy={half} r={half - 3} fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={2} />
      )}
      {type === "rectangle" && (
        <rect x={3} y={6} width={size - 6} height={size - 12} fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={2} />
      )}
      {type === "triangle" && (
        <polygon points={`${half},3 ${size - 3},${size - 3} 3,${size - 3}`} fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={2} />
      )}
      {type === "trapezoid" && (
        <polygon points={`${half - 4},6 ${half + 4},6 ${size - 3},${size - 6} 3,${size - 6}`} fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={2} />
      )}
      {type === "parallelogram" && (
        <polygon points={`${half + 4},6 ${size - 3},6 ${half - 4},${size - 6} 3,${size - 6}`} fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={2} />
      )}
      {type === "hexagon" && (
        <polygon points={`${half},3 ${size - 4},8 ${size - 4},${size - 8} ${half},${size - 3} 4,${size - 8} 4,8`} fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={2} />
      )}
    </svg>
  );
}

export function ShapePalette({ selectedShape, onSelect, shapeSize, onSizeChange }: ShapePaletteProps) {
  const area =
    selectedShape === "circle"
      ? Math.PI * Math.pow(Math.min(shapeSize.width, shapeSize.height) / 2, 2)
      : selectedShape === "triangle"
      ? (shapeSize.width * shapeSize.height) / 2
      : selectedShape === "trapezoid"
      ? (0.75 * shapeSize.width * shapeSize.height)
      : selectedShape === "hexagon"
      ? ((3 * Math.sqrt(3) / 2) * Math.pow(Math.min(shapeSize.width, shapeSize.height) / 2, 2))
      : shapeSize.width * shapeSize.height;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">
        Shape Palette
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {shapes.map(({ type, label, colorClass }) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors ${
              selectedShape === type
                ? `border-current ${colorClass === "shape-circle" ? "text-shape-circle border-shape-circle bg-shape-circle/10" : colorClass === "shape-rect" ? "text-shape-rect border-shape-rect bg-shape-rect/10" : colorClass === "shape-triangle" ? "text-shape-triangle border-shape-triangle bg-shape-triangle/10" : colorClass === "shape-parallelogram" ? "text-shape-parallelogram border-shape-parallelogram bg-shape-parallelogram/10" : colorClass === "shape-hexagon" ? "text-shape-hexagon border-shape-hexagon bg-shape-hexagon/10" : "text-[hsl(35,90%,55%)] border-[hsl(35,90%,55%)] bg-[hsl(35,90%,55%)]/10"}`
                : "border-border text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            <ShapeIcon type={type} />
            <span className="text-[10px] uppercase tracking-wider">{label}</span>
          </motion.button>
        ))}
      </div>

      {selectedShape && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 border-t border-border pt-3"
        >
          <div className="text-center">
            <span className="text-xs text-muted-foreground">Formula: </span>
            <span className="text-sm text-primary font-bold">
              {shapes.find((s) => s.type === selectedShape)?.formula}
            </span>
          </div>

          <div className="space-y-2">
            <label className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {selectedShape === "circle" ? "Diameter" : selectedShape === "hexagon" ? "Size (Bounding)" : "Width"}
              </span>
              <span className="text-foreground">{shapeSize.width}px</span>
            </label>
            <input
              type="range"
              min={20}
              max={120}
              value={shapeSize.width}
              onChange={(e) => onSizeChange({ ...shapeSize, width: +e.target.value })}
              className="w-full accent-primary h-1"
            />
          </div>

          {(selectedShape !== "circle" && selectedShape !== "hexagon") && (
            <div className="space-y-2">
              <label className="flex justify-between text-xs">
                <span className="text-muted-foreground">Height</span>
                <span className="text-foreground">{shapeSize.height}px</span>
              </label>
              <input
                type="range"
                min={20}
                max={120}
                value={shapeSize.height}
                onChange={(e) => onSizeChange({ ...shapeSize, height: +e.target.value })}
                className="w-full accent-primary h-1"
              />
            </div>
          )}

          <div className="bg-muted rounded p-2 text-center">
            <span className="text-xs text-muted-foreground">Cost: </span>
            <span className="text-sm font-bold text-accent">{Math.round(area)} sq units</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
