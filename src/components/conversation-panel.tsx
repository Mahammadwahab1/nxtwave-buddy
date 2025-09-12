import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onTalkToHuman,
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const isMobile = useIsMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

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

  const Sidebar = (
    <div className="h-full flex flex-col">
      <h4 className="text-sm font-semibold mb-2">Actions</h4>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={onTalkToHuman}>Talk to Human</Button>
      </div>
      <Separator className="my-4" />
      <h4 className="text-sm font-semibold mb-2">Tips</h4>
      <ul className="text-xs text-muted-foreground space-y-1.5">
        <li>Use Enter to send</li>
        <li>Shift+Enter for new line</li>
        <li>Keep messages short and clear</li>
      </ul>
    </div>
  );

  return (
    <NeumorphicCard className="flex flex-col h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Conversation</h3>
        <div className="lg:hidden">
          <Drawer open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <Button size="sm" variant="outline">Sidebar</Button>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Chat Sidebar</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {Sidebar}
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="secondary">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Body: two-column fixed-height layout */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Main chat area */}
        <div className="col-span-12 lg:col-span-9 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg transition-smooth ${
                      message.type === "user"
                        ? "gradient-primary text-white"
                        : message.isTranscript
                        ? "bg-accent text-accent-foreground border border-border"
                        : "neumorphic-inset"
                    }`}
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
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Composer */}
          <div className="pt-3 flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or speak to Maya..."
              className="flex-1"
              disabled={isProcessing}
            />
            <Button onClick={handleSend} disabled={!inputValue.trim() || isProcessing} className="gradient-primary">
              <Send size={16} />
            </Button>
          </div>
        </div>

        {/* Sidebar (desktop) */}
        <div className="hidden lg:block col-span-3 border-l pl-4 min-h-0">
          <div className="h-full overflow-y-auto pr-1">
            {Sidebar}
          </div>
        </div>
      </div>
    </NeumorphicCard>
  );
};
