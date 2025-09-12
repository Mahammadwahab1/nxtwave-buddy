import * as React from "react";
import { AvatarAssistant } from "@/components/avatar-assistant";
import { ConversationPanel } from "@/components/conversation-panel";
import { ProgressTracker } from "@/components/progress-tracker";
import { Button } from "@/components/ui/button";
import { Settings, HelpCircle } from "lucide-react";
import { PopoverDemo } from "@/components/ui/popover-demo";
import { MicroCelebration } from "@/components/ui/micro-celebration";
import { toast } from "@/hooks/use-toast";
import CharacterBuddy from "@/components/ui/character-buddy";
import { fireCustomShapesConfetti } from "@/lib/confetti";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { CoApplicantPromo } from "@/components/coapplicant-promo";
import { getStagePrompt } from "@/lib/stage-prompts";
import { speakWithEleven } from "@/services/tts/elevenlabs";
import { ELEVEN_VOICE_ID, ELEVEN_MODEL_DEFAULT, USE_BROWSER_TTS, type ElevenModel } from "@/config/voice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { startWebSpeechListening } from "@/services/stt/web-speech";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  isTranscript?: boolean;
}

export const VoiceAgentDashboard: React.FC = () => {
  const [currentStage, setCurrentStage] = React.useState(1);
  const totalStages = 4; // for testing after stage list changes
  const prevStageRef = React.useRef(currentStage);
  const [celebrate, setCelebrate] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [partialTranscript, setPartialTranscript] = React.useState<string | undefined>(undefined);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [showCoApplicantPromo, setShowCoApplicantPromo] = React.useState(false);
  const sttStopRef = React.useRef<null | (() => void)>(null);
  const [voices, setVoices] = React.useState<{ id: string; name: string }[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string>(() =>
    localStorage.getItem('voice_id') || ELEVEN_VOICE_ID
  );
  const [selectedModel, setSelectedModel] = React.useState<ElevenModel>(() =>
    (localStorage.getItem('voice_model') as ElevenModel) || ELEVEN_MODEL_DEFAULT
  );
  const [hasUserInteracted, setHasUserInteracted] = React.useState(false);

  // Load available voices from server
  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/tts/voices');
        if (!r.ok) return;
        const data = await r.json();
        const list = (data.voices || []).map((v: any) => ({ id: v.id, name: v.name }));
        setVoices(list);
      } catch {}
    })();
  }, []);

  React.useEffect(() => { localStorage.setItem('voice_id', selectedVoiceId); }, [selectedVoiceId]);
  React.useEffect(() => { localStorage.setItem('voice_model', selectedModel); }, [selectedModel]);

  // Simple Web Speech API speaker for agent text
  const speak = React.useCallback((text: string) => {
    try {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 1;
      utter.pitch = 1;
      // restart any previous utterances for clarity
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {}
  }, []);

  const handleToggleListening = () => {
    setHasUserInteracted(true);
    if (isListening) {
      setIsListening(false);
      setPartialTranscript(undefined);
      if (sttStopRef.current) sttStopRef.current();
      return;
    }
    // Start Web Speech API (replaceable with cloud STT later)
    setIsListening(true);
    setPartialTranscript("");
    const ctrl = startWebSpeechListening({
      onPartial: (t) => setPartialTranscript(t),
      onFinal: (t) => {
        setIsListening(false);
        setPartialTranscript(undefined);
        if (t) handleSendMessage(t);
      },
    });
    sttStopRef.current = ctrl.stop;
  };

  const handleToggleMute = () => setIsMuted(!isMuted);

  const handleSendMessage = (content: string) => {
    setHasUserInteracted(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulated agent response (replace with Gemini/OpenAI). TTS via ElevenLabs with browser fallback.
    setTimeout(async () => {
      const agentText =
        "Thanks! I can help with program details, fees, and co‑applicant steps. What would you like to know next?";
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "agent",
        content: agentText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsProcessing(false);
      setIsSpeaking(true);
      try {
        if (!isMuted) {
          await speakWithEleven(agentText, { voiceId: selectedVoiceId, model: selectedModel });
        }
      } catch (e: any) {
        // Fall back to Web Speech API if available
        if (!isMuted) {
          speak(agentText);
        }
        toast({ title: 'TTS failed', description: (e?.message || 'Unknown error') });
      }
      setIsSpeaking(false);
      if (currentStage === 1) setCurrentStage(2);
    }, 800);
  };

  const handleUploadDocument = () => {
    console.log("Upload document clicked");
  };

  const handleTalkToHuman = () => {
    console.log("Talk to human clicked");
    const humanMessage: Message = {
      id: Date.now().toString(),
      type: "agent",
      content: "I'm connecting you with a human representative. Please hold on for a moment while I transfer your conversation.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, humanMessage]);
  };

  // Celebration toast on stage increment
  React.useEffect(() => {
    const prev = prevStageRef.current;
    let t: ReturnType<typeof setTimeout> | undefined;
    if (currentStage > prev) {
      setCelebrate(true);
      const titles = [
        "Welcome & Greeting",
        "Program Primer",
        "Fee Structure",
        "Co-applicant",
      ];
      const nextTitle = titles[currentStage - 1] ?? `Stage ${currentStage}`;
      toast({ title: `Stage ${prev} completed! 🎉`, description: `Unlocked: ${nextTitle}` });
      t = setTimeout(() => setCelebrate(false), 1200);
      try {
        void fireCustomShapesConfetti();
      } catch {}
      // Speak a short stage-specific intro and add it to messages
      const { intro } = getStagePrompt(currentStage);
      const agentMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        type: "agent",
        content: intro,
        timestamp: new Date(),
      };
      setTimeout(async () => {
        setMessages((prevMsgs) => [...prevMsgs, agentMessage]);
        setIsSpeaking(true);
        try {
          if (hasUserInteracted && !isMuted) {
            await speakWithEleven(agentMessage.content, { voiceId: selectedVoiceId, model: selectedModel });
          }
        } catch (e: any) {
          if (!isMuted && hasUserInteracted) speak(agentMessage.content);
          toast({ title: 'TTS failed', description: (e?.message || 'Unknown error') });
        }
        setIsSpeaking(false);
      }, 350);
    }
    prevStageRef.current = currentStage;
    return () => { if (t) clearTimeout(t); };
  }, [currentStage]);

  // Show a quick marketing popup when entering Co-applicant stage
  React.useEffect(() => {
    if (currentStage === 4) {
      setShowCoApplicantPromo(true);
      const t = setTimeout(() => setShowCoApplicantPromo(false), 1500);
      return () => clearTimeout(t);
    }
  }, [currentStage]);

  return (
    <div className="min-h-screen bg-background">
      <MicroCelebration active={celebrate} position="top-right" />
      <CoApplicantPromo open={showCoApplicantPromo} onOpenChange={setShowCoApplicantPromo} />
      {/* Header */}
      <header className="p-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="192" height="32" viewBox="0 0 192 48" aria-label="Brand">
              <g clipPath="url(#___SVG_ID__0__4___)">
                <path fill="#073C71" d="M56.81 46.458h5.183l1.27-3.142h6.859l1.295 3.142h5.284l-7.57-17.722h-4.75l-7.57 17.722zm7.901-6.938l2.007-5.003 1.981 5.003h-3.988zM85.846 46.81c3.937 0 6.198-1.684 7.874-3.972l-3.708-2.614c-1.067 1.282-2.16 2.136-4.014 2.136-2.49 0-4.242-2.06-4.242-4.7v-.05c0-2.565 1.753-4.651 4.242-4.651 1.702 0 2.87.804 3.887 2.061l3.708-2.84c-1.575-2.162-3.912-3.67-7.544-3.67-5.386 0-9.374 4.021-9.374 9.15v.05c0 5.253 4.09 9.1 9.17 9.1zM94.27 46.458h5.182l1.27-3.142h6.859l1.295 3.142h5.284l-7.57-17.722h-4.75l-7.57 17.722zm7.9-6.938l2.007-5.003 1.981 5.003h-3.988zM115.885 46.458h6.757c6.401 0 10.136-3.77 10.136-8.848v-.05c0-5.078-3.684-8.698-10.034-8.698h-6.859v17.596zm4.928-4.323v-8.95h2.007c2.947 0 4.902 1.635 4.902 4.45v.05c0 2.84-1.955 4.45-4.902 4.45h-2.007zM135.309 46.458h14.429v-4.147h-9.552v-2.79h8.536v-3.847h-8.536V33.01h9.425v-4.148h-14.302v17.596zM152.252 46.458h4.827V36.403l4.521 6.838h.102l4.547-6.888v10.105h4.903V28.862h-5.208l-4.242 6.812-4.242-6.812h-5.208v17.596zM179.437 46.458h4.954v-6.661l6.757-10.935h-5.513l-3.683 6.41-3.658-6.41h-5.614l6.757 11.01v6.586zM71.412 19.809l-1.827-1.827a7.24 7.24 0 01-1.548 1.107c-.51.27-1.137.406-1.883.406a3.78 3.78 0 01-1.547-.314 3.862 3.862 0 01-1.194-.885 4.196 4.196 0 01-.764-1.292 4.383 4.383 0 01-.28-1.569V15.4c0-.554.093-1.07.28-1.55.186-.492.447-.923.783-1.292a3.625 3.625 0 011.193-.867c.472-.21.982-.314 1.529-.314.66 0 1.25.13 1.772.388a6.818 6.818 0 011.566 1.07l1.827-2.085a7.67 7.67 0 00-.97-.812 5.954 5.954 0 00-1.137-.628 6.98 6.98 0 00-1.38-.406 8.576 8.576 0 00-1.66-.147c-1.006 0-1.926.178-2.759.535a6.306 6.306 0 00-2.144 1.44 6.532 6.532 0 00-1.399 2.121c-.335.8-.503 1.66-.503 2.583v.037c0 .923.168 1.79.503 2.602a6.53 6.53 0 001.399 2.122 6.639 6.639 0 002.125 1.402c.82.345 1.71.517 2.667.517a8.12 8.12 0 001.715-.166c.51-.098.976-.246 1.399-.443.435-.209.833-.455 1.193-.738.36-.283.709-.603 1.044-.96zM85.18 19.809l-1.828-1.827a7.227 7.227 0 01-1.548 1.107c-.51.27-1.137.406-1.883.406a3.78 3.78 0 01-1.548-.314 3.863 3.863 0 01-1.194-.885 4.198 4.198 0 01-.764-1.292 4.385 4.385 0 01-.28-1.569V15.4c0-.554.094-1.07.28-1.55.187-.492.448-.923.783-1.292a3.622 3.622 0 011.194-.867c.472-.21.982-.314 1.529-.314.659 0 1.25.13 1.771.388a6.824 6.824 0 011.567 1.07l1.827-2.085a7.648 7.648 0 00-.97-.812 5.956 5.956 0 00-1.137-.628 6.981 6.981 0 00-1.38-.406 8.573 8.573 0 00-1.66-.147c-1.007 0-1.926.178-2.76.535a6.305 6.305 0 00-2.144 1.44 6.526 6.526 0 00-1.398 2.121c-.336.8-.504 1.66-.504 2.583v.037c0 .923.168 1.79.504 2.602.335.812.802 1.52 1.398 2.122a6.635 6.635 0 002.126 1.402 6.82 6.82 0 002.666.517c.634 0 1.206-.055 1.716-.166a6 6 0 001.399-.443c.434-.209.832-.455 1.193-.738a9.42 9.42 0 001.044-.96zM98.573 18.35v-.036c0-.861-.218-1.532-.653-2.012-.435-.492-1.032-.879-1.79-1.162.236-.123.454-.27.653-.443.21-.172.391-.369.54-.59.162-.234.286-.492.373-.775.1-.283.15-.61.15-.978v-.037c0-1.021-.386-1.833-1.157-2.436-.758-.603-1.808-.904-3.15-.904h-6.061v12.916h6.21c.733 0 1.398-.073 1.994-.221.61-.148 1.126-.369 1.548-.664.435-.295.765-.665.989-1.107.236-.443.354-.96.354-1.55zm-3.58-5.516c0 .48-.187.83-.56 1.051-.373.21-.876.314-1.51.314h-2.648v-2.73h2.834c.61 0 1.076.116 1.399.35.323.221.485.547.485.978v.037zM95.72 18c0 .48-.18.837-.54 1.07-.361.222-.859.332-1.493.332h-3.412v-2.841h3.32c.745 0 1.285.129 1.621.387.336.246.504.585.504 1.015V18zM111.265 13.48v-.037c0-.665-.118-1.268-.354-1.809a3.815 3.815 0 00-.989-1.42c-.422-.394-.944-.696-1.566-.905-.609-.221-1.305-.332-2.088-.332h-5.333v12.916h2.871V18.02h2.182c.733 0 1.417-.093 2.051-.277a4.911 4.911 0 001.678-.867 3.986 3.986 0 001.138-1.421c.273-.566.41-1.224.41-1.975zm-2.909.055a1.87 1.87 0 01-.596 1.402c-.398.37-.958.554-1.679.554h-2.275v-3.95h2.219c.721 0 1.287.167 1.697.5.423.331.634.817.634 1.457v.037zM125.153 8.885l-7.161 8.211.467 2.011h6.377v2.787h2.741v-2.787h1.753v-2.306h-1.753V8.885h-2.424zm-.317 7.916h-3.468l3.468-4.023v4.023zM134.447 21.894V18.94h-3.021v2.953h3.021zM148.211 15.417a8.17 8.17 0 00-.41-2.62 6.426 6.426 0 00-1.175-2.122 5.102 5.102 0 00-1.827-1.402c-.709-.345-1.498-.517-2.369-.517-.87 0-1.665.172-2.386.517a5.54 5.54 0 00-1.828 1.42 6.668 6.668 0 00-1.193 2.14 8.143 8.143 0 00-.41 2.621c0 .947.136 1.827.41 2.639.273.8.659 1.5 1.156 2.103a5.545 5.545 0 001.827 1.42c.721.333 1.517.5 2.387.5.87 0 1.66-.173 2.368-.517a5.476 5.476 0 001.846-1.421 6.41 6.41 0 001.175-2.122 7.888 7.888 0 00.429-2.639zm-2.946.037c0 .59-.069 1.138-.205 1.642a4.086 4.086 0 01-.56 1.292 2.85 2.85 0 01-.895.867 2.343 2.343 0 01-1.175.295c-.435 0-.832-.104-1.193-.313a2.85 2.85 0 01-.895-.868 4.374 4.374 0 01-.578-1.31 6.25 6.25 0 01-.205-1.642c0-.59.062-1.138.186-1.642.137-.505.33-.935.578-1.292a2.66 2.66 0 01.895-.849 2.24 2.24 0 011.175-.313c.435 0 .827.104 1.175.313.36.21.665.499.913.868.249.369.442.805.579 1.31.136.504.205 1.052.205 1.642z"/>
                <path fill="url(#___SVG_ID__0__0___)" fillRule="evenodd" d="M41.998 6.656H24.844l1.338 3.654a1.738 1.738 0 01-.436 1.84l-6.862 6.59c-.32.316-.756.488-1.22.488h-.146l-9.246-.662V40.03c0 4.258 3.49 7.71 7.792 7.71h25.934c4.302 0 7.791-3.452 7.791-7.71V14.337c0-4.229-3.489-7.681-7.791-7.681zM15.366 32.462l-.96-1.294 23.986-17.233-2.616-.403.261-1.583 5.35.835-.872 5.293-1.6-.259.408-2.589-23.957 17.233zm26.224-3.02v12.14H17.11V35.11h7.356v-6.473h8.112v-5.265h9.042v6.07h-.03z"/>
                <path fill="url(#___SVG_ID__0__1___)" d="M15.337 12.87l-9.42-.69 1.745 4.775a.41.41 0 00.407.288l9.536.69c.145 0 .262-.028.349-.114l6.89-6.589c.117-.115.175-.316.117-.489l-1.745-4.776-6.803 6.531c-.145.144-.32.23-.494.316a1.297 1.297 0 01-.582.058z"/>
                <path fill="url(#___SVG_ID__0__2___)" d="M2.196 20.638l1.105 2.992c.087.23.349.345.581.259l2.588-.921a.446.446 0 00.262-.575L5.627 19.4a.456.456 0 00-.32-.288l-1.366-.317-2.879-7.854 14.362 1.036c.146 0 .262-.029.35-.115L26.24 1.793a.546.546 0 00.145-.287c.03-.26-.174-.46-.436-.49L11.412-.047c-.145 0-.261.029-.349.115L2.255 8.526l10.263-3.683a.453.453 0 01.582.259.445.445 0 01-.262.575L.742 10.05c-.465.173-.726.69-.552 1.151l2.907 7.883-.843 1.122c-.087.144-.116.288-.058.432z"/>
                <path fill="url(#___SVG_ID__0__3___)" d="M15.337 12.87l-9.42-.69 1.745 4.775a.41.41 0 00.407.288l9.536.69c.145 0 .262-.028.349-.114l6.89-6.589c.117-.115.175-.316.117-.489l-1.745-4.776-6.803 6.531c-.145.144-.32.23-.494.316a1.297 1.297 0 01-.582.058z"/>
              </g>
              <defs>
                <linearGradient id="___SVG_ID__0__0___" x1="8.25" x2="49.784" y1="27.194" y2="27.194" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#396AFC"/>
                  <stop offset="1" stopColor="#2948FF"/>
                </linearGradient>
                <linearGradient id="___SVG_ID__0__1___" x1="5.928" x2="24.975" y1="11.966" y2="11.966" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#396AFC"/>
                  <stop offset="1" stopColor="#2948FF"/>
                </linearGradient>
                <linearGradient id="___SVG_ID__0__2___" x1="0.132" x2="26.39" y1="11.941" y2="11.941" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#396AFC"/>
                  <stop offset="1" stopColor="#2948FF"/>
                </linearGradient>
                <linearGradient id="___SVG_ID__0__3___" x1="5.928" x2="24.975" y1="11.966" y2="11.966" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#396AFC"/>
                  <stop offset="1" stopColor="#2948FF"/>
                </linearGradient>
                <clipPath id="___SVG_ID__0__4___">
                  <path fill="#fff" d="M0 0H192V48H0z" />
                </clipPath>
              </defs>
            </svg>
            <p className="text-sm text-muted-foreground">Powered by Maya AI</p>
          </div>
          <div className="flex space-x-2 items-center">
            <Button variant="secondary" size="sm"><HelpCircle size={16} className="mr-1" />Help</Button>
            <Button variant="secondary" size="sm"><Settings size={16} className="mr-1" />Settings</Button>
            <PopoverDemo />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Progress & Trust */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stage Tester (manual navigation) */}
            <NeumorphicCard className="space-y-3" hover>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Stage Tester</h3>
                <span className="text-xs text-muted-foreground">{currentStage}/{totalStages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentStage((s) => Math.max(1, s - 1))}
                  disabled={currentStage <= 1}
                >
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentStage((s) => Math.min(totalStages, s + 1))}
                  disabled={currentStage >= totalStages}
                >
                  Next
                </Button>
              </div>
            </NeumorphicCard>
            <ProgressTracker currentStage={currentStage} />
            {/* Voice Settings */}
            <NeumorphicCard className="space-y-3" hover>
              <h3 className="text-base font-semibold">Voice Settings</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs mb-1 text-muted-foreground">Voice</div>
                  <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {(voices.length ? voices : [{id: ELEVEN_VOICE_ID, name: 'Laila (default)'}]).map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="text-xs mb-1 text-muted-foreground">Model</div>
                  <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as ElevenModel)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eleven_turbo_v2">eleven_turbo_v2 (default)</SelectItem>
                      <SelectItem value="eleven_v3">eleven_v3</SelectItem>
                      <SelectItem value="eleven_ttv_v3">eleven_ttv_v3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </NeumorphicCard>
          </div>

          {/* Right Content - Stacked Avatar and Conversation (wider) */}
          <div className="lg:col-span-3">
            <div className="mx-auto w-full max-w-4xl md:max-w-5xl space-y-6">
              <AvatarAssistant
                isListening={isListening}
                isSpeaking={isSpeaking}
                isThinking={isProcessing}
                isMuted={isMuted}
                onToggleListening={handleToggleListening}
                onToggleMute={handleToggleMute}
                currentStage={currentStage}
              />
              <div id="conversation" className="scroll-mt-24">
                <ConversationPanel
                  messages={messages}
                  isProcessing={isProcessing}
                  onSendMessage={handleSendMessage}
                  onUploadDocument={handleUploadDocument}
                  onTalkToHuman={handleTalkToHuman}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Bottom-left interactive buddy */}
      <CharacterBuddy
        mood={celebrate ? "celebrate" : isSpeaking ? "speak" : isListening ? "listen" : "idle"}
        message={messages.length ? messages[messages.length - 1].content : undefined}
        onClick={handleToggleListening}
      />
    </div>
  );
};
