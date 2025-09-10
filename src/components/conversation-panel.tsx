import * as React from "react";
import { Send, Upload, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  isTranscript?: boolean;
}

interface ConversationPanelProps {
  messages: Message[];
  isProcessing?: boolean;
  onSendMessage?: (message: string) => void;
  onUploadDocument?: () => void;
  onTalkToHuman?: () => void;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  isProcessing = false,
  onSendMessage,
  onUploadDocument,
  onTalkToHuman
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <NeumorphicCard className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Conversation</h3>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={onUploadDocument}>
            <Upload size={16} className="mr-1" />
            Upload
          </Button>
          <Button variant="secondary" size="sm" onClick={onTalkToHuman}>
            <Phone size={16} className="mr-1" />
            Human
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 mb-4">
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[80%] p-3 rounded-lg transition-smooth
                  ${message.type === "user"
                    ? "gradient-primary text-white"
                    : message.isTranscript
                    ? "bg-accent text-accent-foreground border border-border"
                    : "neumorphic-inset"
                  }
                `}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                  {message.isTranscript && " (transcript)"}
                </span>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="neumorphic-inset p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message or speak to Maya..."
          className="flex-1"
          disabled={isProcessing}
        />
        <Button 
          onClick={handleSend}
          disabled={!inputValue.trim() || isProcessing}
          className="gradient-primary"
        >
          <Send size={16} />
        </Button>
      </div>
    </NeumorphicCard>
  );
};