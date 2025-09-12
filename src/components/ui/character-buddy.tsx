import * as React from "react";
import { cn } from "@/lib/utils";
import TalkingAvatar from "@/components/ui/talking-avatar";

type BuddyMood = "idle" | "listen" | "speak" | "celebrate";

interface CharacterBuddyProps {
  mood?: BuddyMood;
  message?: string;
  onClick?: () => void;
  className?: string;
}

// Lightweight SVG avatar that reacts to cursor + props.
export const CharacterBuddy: React.FC<CharacterBuddyProps> = ({
  mood = "idle",
  message,
  onClick,
  className,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pupil, setPupil] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
      setPupil({ x: dx * 4, y: dy * 4 });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const moodClass =
    mood === "celebrate"
      ? "buddy-celebrate"
      : mood === "speak"
      ? "buddy-speak"
      : mood === "listen"
      ? "buddy-listen"
      : "";

  return (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-4 left-4 z-40 select-none",
        "[--buddy-skin:#fecaca] [--buddy-hair:#f59e0b] [--buddy-top:#38bdf8] [--buddy-bottom:#0ea5e9]",
        className,
      )}
      onClick={onClick}
      role="button"
      aria-label="Interactive buddy"
      title="Say hi!"
    >
      <div className={cn("buddy-container", moodClass)}>
        <TalkingAvatar size={120} isSpeaking={mood === "speak"} text={message} energy={0.7} />
        {message && (
          <div className="buddy-bubble">
            <div className="max-w-[220px] text-xs leading-snug">{message}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterBuddy;
