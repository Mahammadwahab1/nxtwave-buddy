import * as React from "react";
import { AvatarAssistant } from "@/components/avatar-assistant";
import { ConversationPanel } from "@/components/conversation-panel";
import { ProgressTracker } from "@/components/progress-tracker";
import { TrustIndicators } from "@/components/trust-indicators";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { Button } from "@/components/ui/button";
import { Settings, HelpCircle } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  isTranscript?: boolean;
}

export const VoiceAgentDashboard: React.FC = () => {
  const [currentStage, setCurrentStage] = React.useState(1);
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      type: "agent",
      content: "Hello! I'm Maya, your NxtWave enrollment assistant. I'm here to guide you through your enrollment journey step by step. Let's start by getting to know you better. What's your name?",
      timestamp: new Date(),
    }
  ]);

  const handleToggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate listening
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage("Hi Maya, I'm interested in the Full Stack Development course");
      }, 3000);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate agent response
    setTimeout(() => {
      setIsSpeaking(true);
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: "Great to meet you! Full Stack Development is an excellent choice. Before we proceed with the enrollment details, let me explain our comprehensive course structure and the amazing career opportunities it offers. This will help you make an informed decision about your investment in your future.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsProcessing(false);

      // Simulate speaking duration
      setTimeout(() => {
        setIsSpeaking(false);
        if (currentStage === 1) {
          setCurrentStage(2);
        }
      }, 3000);
    }, 2000);
  };

  const handleUploadDocument = () => {
    console.log("Upload document clicked");
    // Handle document upload
  };

  const handleTalkToHuman = () => {
    console.log("Talk to human clicked");
    const humanMessage: Message = {
      id: Date.now().toString(),
      type: "agent",
      content: "I'm connecting you with a human representative. Please hold on for a moment while I transfer your conversation.",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, humanMessage]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              NxtWave Enrollment Assistant
            </h1>
            <p className="text-sm text-muted-foreground">Powered by Maya AI</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              <HelpCircle size={16} className="mr-1" />
              Help
            </Button>
            <Button variant="secondary" size="sm">
              <Settings size={16} className="mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Progress & Trust */}
          <div className="lg:col-span-1 space-y-6">
            <ProgressTracker currentStage={currentStage} />
            <TrustIndicators />
          </div>

          {/* Center - Avatar Assistant */}
          <div className="lg:col-span-1">
            <AvatarAssistant
              isListening={isListening}
              isSpeaking={isSpeaking}
              isMuted={isMuted}
              onToggleListening={handleToggleListening}
              onToggleMute={handleToggleMute}
            />
          </div>

          {/* Right - Conversation Panel */}
          <div className="lg:col-span-2">
            <ConversationPanel
              messages={messages}
              isProcessing={isProcessing}
              onSendMessage={handleSendMessage}
              onUploadDocument={handleUploadDocument}
              onTalkToHuman={handleTalkToHuman}
            />
          </div>
        </div>

        {/* Current Stage Info */}
        <div className="mt-6">
          <NeumorphicCard>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Current Stage: {currentStage === 1 ? "Welcome & Greeting" : currentStage === 2 ? "Program Primer" : "Fee Structure"}</h3>
              <p className="text-sm text-muted-foreground">
                {currentStage === 1 && "Let's get to know each other and understand your learning goals."}
                {currentStage === 2 && "Understanding the Full Stack Development course details and structure."}
                {currentStage === 3 && "Exploring fee structure and payment options available to you."}
              </p>
            </div>
          </NeumorphicCard>
        </div>
      </main>
    </div>
  );
};