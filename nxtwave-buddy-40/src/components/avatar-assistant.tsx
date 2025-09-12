import * as React from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import avatarImage from "@/assets/avatar-assistant.jpg";

interface AvatarAssistantProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
  onToggleListening?: () => void;
  onToggleMute?: () => void;
}

export const AvatarAssistant: React.FC<AvatarAssistantProps> = ({
  isListening = false,
  isSpeaking = false,
  isMuted = false,
  onToggleListening,
  onToggleMute
}) => {
  return (
    <NeumorphicCard className="text-center space-y-6" variant="elevated">
      <div className="relative">
        <div className={`
          w-32 h-32 mx-auto rounded-full overflow-hidden 
          ${isSpeaking ? 'animate-pulse-soft glow-primary' : 'animate-float'}
          transition-smooth
        `}>
          <img 
            src={avatarImage} 
            alt="AI Assistant" 
            className="w-full h-full object-cover"
          />
        </div>
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Maya</h3>
        <p className="text-sm text-muted-foreground">Your NxtWave Enrollment Assistant</p>
        <div className="text-xs text-primary font-medium">
          {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready to help"}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          variant={isListening ? "default" : "secondary"}
          size="sm"
          onClick={onToggleListening}
          className={isListening ? "gradient-primary glow-primary" : ""}
        >
          {isListening ? <Mic size={16} /> : <MicOff size={16} />}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleMute}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </Button>
      </div>
    </NeumorphicCard>
  );
};