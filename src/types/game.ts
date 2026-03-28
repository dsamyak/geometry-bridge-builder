export type ShapeType = 'circle' | 'rectangle' | 'triangle';

export interface PlacedShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  rotation: number;
  area: number;
}

export interface Level {
  id: number;
  name: string;
  gapStart: number;
  gapEnd: number;
  budget: number;
  groundHeight: number;
}

export const LEVELS: Level[] = [
  { id: 1, name: "Simple Crossing", gapStart: 300, gapEnd: 500, budget: 15000, groundHeight: 350 },
  { id: 2, name: "Wide Canyon", gapStart: 250, gapEnd: 550, budget: 20000, groundHeight: 350 },
  { id: 3, name: "Deep Ravine", gapStart: 280, gapEnd: 520, budget: 12000, groundHeight: 350 },
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

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
