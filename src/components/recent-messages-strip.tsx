import * as React from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  isTranscript?: boolean;
}

interface RecentMessagesStripProps {
  messages: Message[];
  isSpeaking: boolean;
  isListening: boolean;
  partialTranscript?: string;
}

export const RecentMessagesStrip: React.FC<RecentMessagesStripProps> = ({
  messages,
  isSpeaking,
  isListening,
  partialTranscript,
}) => {
  const lastAgent = [...messages].reverse().find((m) => m.type === "agent");
  const lastUser = [...messages].reverse().find((m) => m.type === "user");

  return (
    <NeumorphicCard className="w-full min-h-[160px] max-h-[200px] overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Recent messages</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Latest bot message */}
        <div className={`p-3 rounded-lg transition-smooth ${isSpeaking ? "ring-2 ring-primary" : "neumorphic-inset"}`}>
          {isListening ? (
            <p className="text-sm text-muted-foreground">
              Listening... {partialTranscript ? <span className="opacity-80">{partialTranscript}</span> : null}
            </p>
          ) : (
            <p className="text-sm clamp-3">{lastAgent ? lastAgent.content : "—"}</p>
          )}
        </div>

        {/* Latest user message */}
        <div className="p-3 rounded-lg transition-smooth neumorphic-inset">
          <p className="text-sm clamp-3">{lastUser ? lastUser.content : "—"}</p>
        </div>
      </div>

      {/* ARIA live region for polite updates */}
      <div className="sr-only" aria-live="polite" role="status">
        {isSpeaking ? "Assistant is speaking." : isListening ? "Listening for your message." : lastAgent?.content}
      </div>
    </NeumorphicCard>
  );
};
