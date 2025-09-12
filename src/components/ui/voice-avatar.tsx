import * as React from "react";
import { VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Minimal, cute cloud avatar as inline SVG
const CloudAvatar: React.FC<{ speaking?: boolean }> = ({ speaking }) => {
  const gradId = React.useId();
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e9edf3" />
        </radialGradient>
      </defs>
      {/* Background removed per request */}
      {/* Subtle ground shadow */}
      <ellipse cx="100" cy="140" rx="46" ry="10" fill="#98b7ff" opacity="0.15" />
      {/* Cloud body */}
      <g>
        <path
          d="M55 120c-11-2-19-11-19-22 0-12 9-22 21-24 3-20 21-35 43-35 17 0 32 9 39 23 2-1 5-2 8-2 13 0 24 11 24 24 0 2 0 4-1 6 11 3 19 13 19 24 0 14-12 26-27 26H82c-12 0-22-8-27-20Z"
          fill={`url(#${gradId})`}
          stroke="#dde2ea"
          strokeWidth="1"
        />
        {/* Eyes */}
        <g transform="translate(0,-8)">
          <g className="animate-cloud-blink" style={{ transformOrigin: "80px 100px" }}>
            <ellipse cx="80" cy="100" rx="7" ry="9" fill="#111" />
            <circle cx="82.5" cy="97" r="2" fill="#fff" />
          </g>
          <g className="animate-cloud-blink" style={{ transformOrigin: "120px 100px" }}>
            <ellipse cx="120" cy="100" rx="7" ry="9" fill="#111" />
            <circle cx="122.5" cy="97" r="2" fill="#fff" />
          </g>
        </g>
        {/* Smile */}
        <path d="M85 116q15 10 30 0" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
        {/* No inner speaking circle to avoid double-ring visuals */}
      </g>
    </svg>
  );
};

export type VoiceAvatarState = "idle" | "speaking" | "listening" | "thinking";

export interface VoiceAvatarProps {
  src?: string;
  name?: string;
  state?: VoiceAvatarState;
  muted?: boolean;
  size?: number; // pixels, circle diameter
  variant?: "circle" | "rounded";
}

export const VoiceAvatar: React.FC<VoiceAvatarProps> = ({
  src,
  name = "Assistant",
  state = "idle",
  muted = false,
  size = 128,
  variant = "circle",
}) => {
  const showMouth = state === "speaking" && !muted;
  const isListening = state === "listening";
  const isThinking = state === "thinking";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        variant === "rounded" ? "rounded-2xl" : "rounded-full"
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${name} avatar`}
    >
      {/* Single status ring (speaking or listening) */}
      {(showMouth || isListening) && (
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 animate-ring-pulse",
            showMouth ? "border-fuchsia-400/70" : "border-indigo-400/70"
          )}
        />
      )}

      {/* Base avatar */}
      <Avatar
        className={cn(
          "shadow-none bg-transparent border-0",
          variant === "rounded" ? "rounded-2xl" : "rounded-full",
          showMouth ? "animate-float" : ""
        )}
        style={{ width: size * 0.9, height: size * 0.9 }}
      >
        {src ? (
          <AvatarImage src={src} alt={`${name} avatar`} />
        ) : (
          <AvatarFallback className="p-0 bg-transparent">
            <CloudAvatar speaking={showMouth} />
          </AvatarFallback>
        )}
      </Avatar>

      {/* Removed bar mouth overlay; cloud has its own smile */}

      {/* Thinking spinner */}
      {isThinking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </div>
      )}

      {/* Muted indicator */}
      {muted && (
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
          <VolumeX className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};
