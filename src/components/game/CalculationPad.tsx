import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";

export function CalculationPad() {
  const [expr1, setExpr1] = useState("");
  const [expr2, setExpr2] = useState("");
  const [operation, setOperation] = useState<"*" | "+" | "-" | "/">("*");

  const calcResult = () => {
    const n1 = parseFloat(expr1);
    const n2 = parseFloat(expr2);
    if (isNaN(n1) || isNaN(n2)) return "--";
    switch (operation) {
      case "*": return (n1 * n2).toLocaleString(undefined, { maximumFractionDigits: 1 });
      case "+": return (n1 + n2).toLocaleString(undefined, { maximumFractionDigits: 1 });
      case "-": return (n1 - n2).toLocaleString(undefined, { maximumFractionDigits: 1 });
      case "/": return (n1 / n2).toLocaleString(undefined, { maximumFractionDigits: 1 });
    }
  };

  const triangleResult = () => {
    const n1 = parseFloat(expr1);
    const n2 = parseFloat(expr2);
    if (isNaN(n1) || isNaN(n2)) return "--";
    return ((n1 * n2) / 2).toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        ✨ Magic Math Pad
      </h3>
      
      <div className="space-y-3">
        <div className="flex gap-2 items-center text-sm">
          <input 
            type="number" 
            value={expr1} 
            onChange={(e) => setExpr1(e.target.value)}
            placeholder="Width"
            className="w-full bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary"
          />
          <select 
            value={operation}
            onChange={(e) => setOperation(e.target.value as any)}
            className="bg-background border border-border rounded px-1 py-1 outline-none text-muted-foreground focus:border-primary"
          >
            <option value="*">×</option>
            <option value="+">+</option>
            <option value="-">−</option>
            <option value="/">÷</option>
          </select>
          <input 
            type="number" 
            value={expr2} 
            onChange={(e) => setExpr2(e.target.value)}
            placeholder="Height"
            className="w-full bg-background border border-border rounded px-2 py-1 outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-muted/40 rounded p-2 text-center border border-transparent hover:border-border transition-colors">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Result (Rect)</div>
            <div className="text-sm font-bold text-shape-rect font-mono">
              {calcResult()}
            </div>
          </div>
          <div className="bg-muted/40 rounded p-2 text-center border border-transparent hover:border-border transition-colors">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">½ × w × h (Tri)</div>
            <div className="text-sm font-bold text-shape-triangle font-mono">
              {triangleResult()}
            </div>
          </div>
          <div className="bg-muted/40 rounded p-2 text-center border border-transparent hover:border-border transition-colors">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">¾ × w × h (Trap)</div>
            <div className="text-sm font-bold text-[hsl(35,90%,55%)] font-mono">
              {isNaN(parseFloat(expr1)) || isNaN(parseFloat(expr2)) ? "--" : (0.75 * parseFloat(expr1) * parseFloat(expr2)).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
