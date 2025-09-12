import * as React from "react";

interface MicroCelebrationProps {
  active: boolean;
  position?: "top-right" | "top-center" | "top-left";
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"]; // success, blue, amber, red, purple

export const MicroCelebration: React.FC<MicroCelebrationProps> = ({
  active,
  position = "top-right",
}) => {
  const [pieces, setPieces] = React.useState<Array<{ id: number; color: string; x: number; delay: number }>>([]);

  React.useEffect(() => {
    if (!active) return;
    const next = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: Math.floor(Math.random() * 80) - 40, // -40..40
      delay: Math.random() * 150, // 0..150ms
    }));
    setPieces(next);
  }, [active]);

  if (!active) return null;

  const posClass =
    position === "top-right"
      ? "top-16 right-6"
      : position === "top-center"
      ? "top-16 left-1/2 -translate-x-1/2"
      : "top-16 left-6";

  return (
    <div className={`fixed z-50 pointer-events-none ${posClass}`} aria-hidden>
      <div className="relative w-48 h-32">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute block confetti-piece"
            style={{
              left: `calc(50% + ${p.x}px)`,
              top: "60%",
              width: `${6 + Math.random() * 5}px`,
              height: `${8 + Math.random() * 6}px`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

