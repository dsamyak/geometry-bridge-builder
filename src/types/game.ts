export type ShapeType = 'circle' | 'rectangle' | 'triangle' | 'trapezoid' | 'parallelogram' | 'hexagon';

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
    id: 1, name: "Easy Peasy Crossing", gapStart: 300, gapEnd: 500, budget: 18000,
    groundHeight: 340, vehicleWeight: 500,
    description: "Welcome student! Your first task is a small gap of 200px. Remember, the area of your shapes determines the material cost!"
  },
  {
    id: 2, name: "The Croc-Filled Canyon", gapStart: 220, gapEnd: 580, budget: 25000,
    groundHeight: 340, vehicleWeight: 600,
    description: "Watch out for the imaginary crocodiles! A wider gap needs a stronger bridge. Can triangles provide the structural strength you need?"
  },
  {
    id: 3, name: "Teacher's Tight Budget", gapStart: 250, gapEnd: 550, budget: 14000,
    groundHeight: 340, vehicleWeight: 700,
    description: "Oops! We spent all our geometry budget on pizza. You must optimize your area usage—triangles cost half the area of a rectangle!"
  },
  {
    id: 4, name: "The Giant's Chasm", gapStart: 180, gapEnd: 620, budget: 35000,
    groundHeight: 340, vehicleWeight: 800,
    description: "A gigantic 440px gap! Use your trusty ruler tool to measure out the distances before you start building your masterpiece."
  },
  {
    id: 5, name: "The Hippo Transport", gapStart: 280, gapEnd: 520, budget: 16000,
    groundHeight: 340, vehicleWeight: 1400,
    description: "Uh oh! We need to transport a very heavy hippo across this gap safely! Maximum structural strength is absolutely required!"
  },
  {
    id: 6, name: "Trapezoid Trial!", gapStart: 200, gapEnd: 600, budget: 22000,
    groundHeight: 340, vehicleWeight: 900,
    description: "New shape unlocked! Try using Trapezoids! They offer better structural strength than rectangles while covering more area than triangles."
  },
  {
    id: 7, name: "Playful Sandbox", gapStart: 100, gapEnd: 700, budget: 99999,
    groundHeight: 340, vehicleWeight: 800,
    description: "Go wild! You have a huge 600px gap and endless budget. Build the craziest and most colorful bridge you can imagine and let the car ride!"
  }
];

export function calculateArea(type: ShapeType, width: number, height: number): number {
  switch (type) {
    case 'circle':
      return Math.PI * Math.pow(Math.min(width, height) / 2, 2);
    case 'rectangle':
      return width * height;
    case 'triangle':
      return (width * height) / 2;
    case 'trapezoid':
      // Isosceles trapezoid with top base = 0.5 * bottom base (width)
      return (0.75 * width * height);
    case 'parallelogram':
      return width * height;
    case 'hexagon':
      // Regular hexagon inscribed in a circle of diameter min(width, height)
      // Side length `s` = radius = min(width, height) / 2
      const s = Math.min(width, height) / 2;
      return (3 * Math.sqrt(3) / 2) * s * s;
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
    case 'trapezoid': {
      // Top base is width/2, bottom is width.
      const side = Math.sqrt(height * height + Math.pow(width * 0.25, 2));
      return 1.5 * width + 2 * side;
    }
    case 'parallelogram': {
      // Assuming a standard skew (width/4 shift)
      const side = Math.sqrt(height * height + Math.pow(width * 0.25, 2));
      return 2 * (width + side);
    }
    case 'hexagon': {
      const s = Math.min(width, height) / 2;
      return 6 * s;
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
    case 'trapezoid':
      return area * 1.8; // Better than rectangle
    case 'parallelogram':
      return area * 1.2; // Similar to rectangle
    case 'hexagon':
      return area * 1.5; // Good honeycomb structure properties
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
    case 'trapezoid': {
      return {
        formula: 'A = ½(a + b)h',
        substitution: `A = ½(${Math.round(width/2)} + ${width}) × ${height}`,
        result: `A = ${(0.75 * width * height).toFixed(1)} sq units`,
        explanation: `Top = ${Math.round(width/2)}, Bottom = ${width}, Height = ${height}`,
      };
    }
    case 'parallelogram': {
      return {
        formula: 'A = b × h',
        substitution: `A = ${width} × ${height}`,
        result: `A = ${(width * height).toFixed(1)} sq units`,
        explanation: `Base = ${width}, Height = ${height}`,
      };
    }
    case 'hexagon': {
      const s = Math.min(width, height) / 2;
      return {
        formula: 'A = (3√3)/2 × s²',
        substitution: `A = (3√3)/2 × ${s.toFixed(1)}²`,
        result: `A = ${((3 * Math.sqrt(3) / 2) * s * s).toFixed(1)} sq units`,
        explanation: `Side (s) = ${s.toFixed(1)}`,
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
    case 'trapezoid': {
      const side = Math.sqrt(height * height + Math.pow(width * 0.25, 2));
      return {
        formula: 'P = a + b + 2s',
        substitution: `P = ${Math.round(width/2)} + ${width} + 2 × ${side.toFixed(1)}`,
        result: `P = ${(1.5 * width + 2 * side).toFixed(1)} units`,
      };
    }
    case 'parallelogram': {
      const side = Math.sqrt(height * height + Math.pow(width * 0.25, 2));
      return {
        formula: 'P = 2(b + s)',
        substitution: `P = 2(${width} + ${side.toFixed(1)})`,
        result: `P = ${(2 * (width + side)).toFixed(1)} units`,
      };
    }
    case 'hexagon': {
      const s = Math.min(width, height) / 2;
      return {
        formula: 'P = 6s',
        substitution: `P = 6 × ${s.toFixed(1)}`,
        result: `P = ${(6 * s).toFixed(1)} units`,
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
