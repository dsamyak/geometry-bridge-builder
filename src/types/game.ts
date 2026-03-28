export type ShapeType = 'circle' | 'rectangle' | 'triangle';

export interface PlacedShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  area: number;
  perimeter: number;
  // For physics
  supportStrength: number;
  grounded: boolean;
}

export interface Level {
  id: number;
  name: string;
  gapStart: number;
  gapEnd: number;
  budget: number;
  groundHeight: number;
  vehicleWeight: number;
  description: string;
}

export const LEVELS: Level[] = [
  {
    id: 1, name: "Simple Crossing", gapStart: 300, gapEnd: 500, budget: 18000,
    groundHeight: 340, vehicleWeight: 500,
    description: "Bridge a 200px gap. Learn how area determines material cost."
  },
  {
    id: 2, name: "Wide Canyon", gapStart: 220, gapEnd: 580, budget: 25000,
    groundHeight: 340, vehicleWeight: 600,
    description: "A wider gap needs more support. Use triangles for structural strength!"
  },
  {
    id: 3, name: "Engineer's Challenge", gapStart: 250, gapEnd: 550, budget: 14000,
    groundHeight: 340, vehicleWeight: 700,
    description: "Tight budget! Optimize area usage — triangles cost half of rectangles."
  },
  {
    id: 4, name: "Deep Chasm", gapStart: 180, gapEnd: 620, budget: 35000,
    groundHeight: 340, vehicleWeight: 800,
    description: "A massive 440px gap. Use the ruler to measure distances and plan multi-shape structures."
  },
  {
    id: 5, name: "Heavy Load", gapStart: 280, gapEnd: 520, budget: 16000,
    groundHeight: 340, vehicleWeight: 1200,
    description: "A short gap but a very heavy vehicle. Maximum structural strength is required."
  },
];

export function calculateArea(type: ShapeType, width: number, height: number): number {
  switch (type) {
    case 'circle':
      return Math.PI * Math.pow(Math.min(width, height) / 2, 2);
    case 'rectangle':
      return width * height;
    case 'triangle':
      return (width * height) / 2;
  }
}

export function calculatePerimeter(type: ShapeType, width: number, height: number): number {
  switch (type) {
    case 'circle':
      return 2 * Math.PI * (Math.min(width, height) / 2);
    case 'rectangle':
      return 2 * (width + height);
    case 'triangle': {
      const halfBase = width / 2;
      const side = Math.sqrt(halfBase * halfBase + height * height);
      return width + 2 * side;
    }
  }
}

export function calculateSupportStrength(type: ShapeType, width: number, height: number): number {
  // Triangles are strongest per unit area (rigid structure)
  // Rectangles are moderate (can shear)
  // Circles are weakest structurally (point contact)
  const area = calculateArea(type, width, height);
  switch (type) {
    case 'triangle':
      return area * 2.5; // Triangles are inherently rigid
    case 'rectangle':
      return area * 1.2;
    case 'circle':
      return area * 0.8;
  }
}

export function getFormulaSteps(type: ShapeType, width: number, height: number): { formula: string; substitution: string; result: string; explanation: string } {
  switch (type) {
    case 'circle': {
      const r = Math.min(width, height) / 2;
      return {
        formula: 'A = π × r²',
        substitution: `A = π × ${r.toFixed(1)}²`,
        result: `A = ${(Math.PI * r * r).toFixed(1)} sq units`,
        explanation: `Radius = diameter/2 = ${Math.min(width, height)}/2 = ${r.toFixed(1)}`,
      };
    }
    case 'rectangle':
      return {
        formula: 'A = l × w',
        substitution: `A = ${width} × ${height}`,
        result: `A = ${(width * height).toFixed(1)} sq units`,
        explanation: `Length = ${width}, Width = ${height}`,
      };
    case 'triangle': {
      return {
        formula: 'A = ½ × b × h',
        substitution: `A = ½ × ${width} × ${height}`,
        result: `A = ${((width * height) / 2).toFixed(1)} sq units`,
        explanation: `Base = ${width}, Height = ${height}`,
      };
    }
  }
}

export function getPerimeterSteps(type: ShapeType, width: number, height: number): { formula: string; substitution: string; result: string } {
  switch (type) {
    case 'circle': {
      const r = Math.min(width, height) / 2;
      return {
        formula: 'P = 2πr',
        substitution: `P = 2 × π × ${r.toFixed(1)}`,
        result: `P = ${(2 * Math.PI * r).toFixed(1)} units`,
      };
    }
    case 'rectangle':
      return {
        formula: 'P = 2(l + w)',
        substitution: `P = 2(${width} + ${height})`,
        result: `P = ${(2 * (width + height)).toFixed(1)} units`,
      };
    case 'triangle': {
      const halfBase = width / 2;
      const side = Math.sqrt(halfBase * halfBase + height * height);
      return {
        formula: 'P = b + 2s',
        substitution: `P = ${width} + 2 × ${side.toFixed(1)}`,
        result: `P = ${(width + 2 * side).toFixed(1)} units`,
      };
    }
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export interface StructuralAnalysis {
  coverageRatio: number;
  totalStrength: number;
  requiredStrength: number;
  strengthRatio: number;
  willHold: boolean;
  weakPoints: number[];
  supportPoints: { x: number; strength: number }[];
  hasTriangles: boolean;
  triangleBonus: number;
}

export function analyzeStructure(shapes: PlacedShape[], level: Level): StructuralAnalysis {
  const gapWidth = level.gapEnd - level.gapStart;
  const segments = 20;
  const segmentWidth = gapWidth / segments;
  const supportPoints: { x: number; strength: number }[] = [];
  const weakPoints: number[] = [];

  for (let i = 0; i < segments; i++) {
    const segX = level.gapStart + i * segmentWidth + segmentWidth / 2;
    let segStrength = 0;

    shapes.forEach((shape) => {
      const shapeLeft = shape.x;
      const shapeRight = shape.x + shape.width;
      if (segX >= shapeLeft && segX <= shapeRight) {
        segStrength += shape.supportStrength / shape.width;
      }
    });

    supportPoints.push({ x: segX, strength: segStrength });
    if (segStrength < level.vehicleWeight / segments * 0.5) {
      weakPoints.push(segX);
    }
  }

  const coveredSegments = supportPoints.filter((p) => p.strength > 0).length;
  const coverageRatio = coveredSegments / segments;
  const totalStrength = shapes.reduce((s, sh) => s + sh.supportStrength, 0);
  const requiredStrength = level.vehicleWeight;
  const hasTriangles = shapes.some((s) => s.type === "triangle");
  const triangleBonus = hasTriangles ? 0.2 : 0;
  const strengthRatio = totalStrength / requiredStrength + triangleBonus;

  const willHold = coverageRatio >= 0.6 && strengthRatio >= 0.7;

  return {
    coverageRatio,
    totalStrength,
    requiredStrength,
    strengthRatio: Math.min(strengthRatio, 2),
    willHold,
    weakPoints,
    supportPoints,
    hasTriangles,
    triangleBonus,
  };
}
