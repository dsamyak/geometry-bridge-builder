import { LEVELS, Level } from "@/types/game";

interface LevelSelectorProps {
  currentLevel: Level;
  onSelect: (level: Level) => void;
}

export function LevelSelector({ currentLevel, onSelect }: LevelSelectorProps) {
  return (
    <div className="flex gap-2">
      {LEVELS.map((level) => (
        <button
          key={level.id}
          onClick={() => onSelect(level)}
          className={`px-3 py-1.5 rounded text-xs font-display uppercase tracking-wider transition-colors border ${
            currentLevel.id === level.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-muted-foreground"
          }`}
        >
          L{level.id}: {level.name}
        </button>
      ))}
    </div>
  );
}
