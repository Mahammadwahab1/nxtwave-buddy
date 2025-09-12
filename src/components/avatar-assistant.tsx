import * as React from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverButton } from "@/components/ui/hover-button";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { cn } from "@/lib/utils";
import { VoiceAvatar, VoiceAvatarState } from "@/components/ui/voice-avatar";

interface AvatarAssistantProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  isMuted?: boolean;
  onToggleListening?: () => void;
  onToggleMute?: () => void;
  currentStage?: number;
}

export const AvatarAssistant: React.FC<AvatarAssistantProps> = ({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  isMuted = false,
  onToggleListening,
  onToggleMute,
  currentStage = 1,
}) => {
  // Stage -> gradient + label mapping
  const stageMeta = React.useMemo(() => {
    const map: Record<number, { title: string; desc: string; gradient: string }>= {
      1: { title: "Welcome & Greeting", desc: "Introduction and initial questions", gradient: "bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-500" },
      2: { title: "Program Primer", desc: "Understanding course details", gradient: "bg-gradient-to-r from-emerald-500 to-cyan-500" },
      3: { title: "Fee Structure", desc: "Course fees and payment options", gradient: "bg-gradient-to-r from-amber-400 to-rose-500" },
      4: { title: "Co-applicant", desc: "Loan requirements and KYC", gradient: "bg-gradient-to-r from-sky-500 to-emerald-500" },
    };
    return map[currentStage] ?? { title: "", desc: "", gradient: "bg-gradient-to-r from-indigo-500 to-purple-500" };
  }, [currentStage]);

  // Show a quick stage badge when stage changes
  const prevRef = React.useRef(currentStage);
  const [showBadge, setShowBadge] = React.useState(false);
  React.useEffect(() => {
    if (prevRef.current !== currentStage) {
      setShowBadge(true);
      const t = setTimeout(() => setShowBadge(false), 2000);
      prevRef.current = currentStage;
      return () => clearTimeout(t);
    }
  }, [currentStage]);
  return (
    <div className={cn("rounded-xl p-[1px]", stageMeta.gradient)}>
      <NeumorphicCard className="text-center space-y-6 bg-background/80 rounded-[0.75rem]" variant="elevated">
      <div className="relative flex justify-center">
        {showBadge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] md:text-xs px-3 py-1 rounded-full bg-black/60 text-white shadow">
            {stageMeta.title}: {stageMeta.desc}
          </div>
        )}
        <VoiceAvatar
          name="Maya"
          size={160}
          muted={isMuted}
          state={(isSpeaking ? "speaking" : isListening ? "listening" : isThinking ? "thinking" : "idle") as VoiceAvatarState}
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Maya</h3>
        <p className="text-sm text-muted-foreground">Your NxtWave Enrollment Assistant</p>
        <div className="text-xs text-primary font-medium">
          {isMuted ? "Muted" : isSpeaking ? "Speaking..." : isListening ? "Listening..." : isThinking ? "Thinking..." : "Ready to help"}
        </div>
      </div>

      {/* Co-applicant visual (shown during stage 4) */}
      {currentStage === 4 && <CoApplicantConnections />}

      <div className="flex justify-center space-x-4">
        <HoverButton
          onClick={onToggleListening}
          className={cn(
            "h-9 px-3 py-2 rounded-2xl",
            isListening && "gradient-primary text-white"
          )}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <Mic size={16} /> : <MicOff size={16} />}
        </HoverButton>
        <HoverButton
          onClick={onToggleMute}
          className="h-9 px-3 py-2 rounded-2xl"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </HoverButton>
      </div>
    </NeumorphicCard>
    </div>
  );
};

// Lightweight beam between two refs inside a container
const AnimatedBeam: React.FC<{
  containerRef: React.RefObject<HTMLDivElement>;
  fromRef: React.RefObject<HTMLDivElement>;
  toRef: React.RefObject<HTMLDivElement>;
  duration?: number;
  colorClass?: string;
}> = ({ containerRef, fromRef, toRef, duration = 3, colorClass = "from-primary/70 to-primary/20" }) => {
  const [style, setStyle] = React.useState<React.CSSProperties>({ display: "none" });

  React.useEffect(() => {
    const update = () => {
      const c = containerRef.current;
      const a = fromRef.current;
      const b = toRef.current;
      if (!c || !a || !b) return;
      const cr = c.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();

      const ax = ar.left - cr.left + ar.width / 2;
      const ay = ar.top - cr.top + ar.height / 2;
      const bx = br.left - cr.left + br.width / 2;
      const by = br.top - cr.top + br.height / 2;

      const dx = bx - ax;
      const dy = by - ay;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const midX = (ax + bx) / 2;
      const midY = (ay + by) / 2;

      setStyle({
        position: "absolute",
        left: midX - dist / 2,
        top: midY - 1,
        width: dist,
        height: 2,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "center",
        display: "block",
      });
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [containerRef, fromRef, toRef]);

  return (
    <div style={style} className={cn(
      "pointer-events-none select-none",
      "bg-gradient-to-r",
      colorClass,
      "[mask-image:linear-gradient(90deg,transparent,black,transparent)] animate-pulse",
    )} aria-hidden />
  );
};

// Inline circle used for the co-applicant graph
const Circle = React.forwardRef<HTMLDivElement, { className?: string; label?: string; sub?: string }>(
  ({ className, label, sub }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      <div className="text-center leading-tight">
        <div className="text-[11px] font-semibold">{label}</div>
        {sub ? <div className="text-[10px] text-muted-foreground">{sub}</div> : null}
      </div>
    </div>
  )
);
Circle.displayName = "Circle";

// Co-applicant graph specific to Stage 4
const CoApplicantConnections: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const youRef = React.useRef<HTMLDivElement>(null);
  const fatherRef = React.useRef<HTMLDivElement>(null);
  const motherRef = React.useRef<HTMLDivElement>(null);
  const siblingRef = React.useRef<HTMLDivElement>(null);

  // Example scores; replace with real data if available
  const applicants = [
    { key: "father", ref: fatherRef, label: "Father", score: 740 },
    { key: "mother", ref: motherRef, label: "Mother", score: 690 },
    { key: "sibling", ref: siblingRef, label: "Sibling", score: 725 },
  ] as const;

  const eligible = (s: number) => s >= 700;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto mt-2 flex w-full max-w-[540px] items-center justify-center overflow-hidden"
    >
      <div className="flex w-full flex-col items-stretch justify-between gap-4">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={youRef} className="border-primary text-primary bg-primary/5" label="You" sub="Applicant" />
          <div className="flex gap-4">
            {applicants.map((a) => (
              <Circle
                key={a.key}
                ref={a.ref}
                className={cn(
                  eligible(a.score)
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "border-border text-foreground/70 bg-muted",
                )}
                label={a.label}
                sub={`CIBIL ${a.score}`}
              />
            ))}
          </div>
        </div>
      </div>

      {applicants.map((a) => (
        eligible(a.score) ? (
          <AnimatedBeam
            key={a.key}
            duration={3}
            containerRef={containerRef}
            fromRef={youRef}
            toRef={a.ref}
            colorClass="from-emerald-500/80 to-emerald-500/10"
          />
        ) : null
      ))}
    </div>
  );
};
