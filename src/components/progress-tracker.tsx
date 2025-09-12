import * as React from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { ProgressStage } from "@/components/ui/progress-stage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";

interface Stage {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "locked";
}

interface ProgressTrackerProps {
  currentStage: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStage
}) => {
  const [hovered, setHovered] = React.useState(false);
  const tips = [
    {
      title: "Welcome to your progress",
      description:
        "Track how far you are in the enrollment journey. Each step unlocks the next.",
    },
    {
      title: "Stages",
      description:
        "Complete stages in order. Maya will guide you with the information needed at each step.",
    },
    {
      title: "Need help?",
      description:
        "If you’re unsure, use the Help button on top or talk to a human assistant.",
    },
  ];
  const [currentTip, setCurrentTip] = React.useState(0);
  const isFirstTip = currentTip === 0;
  const isLastTip = currentTip === tips.length - 1;
  const handlePrev = () => { if (!isFirstTip) setCurrentTip((v) => v - 1); };
  const handleNext = () => { if (!isLastTip) setCurrentTip((v) => v + 1); };
  const stages: Stage[] = [
    {
      id: "greeting",
      title: "Welcome & Greeting",
      description: "Introduction and initial questions",
      status: currentStage > 1 ? "completed" : currentStage === 1 ? "current" : "locked"
    },
    {
      id: "program",
      title: "Program Primer",
      description: "Understanding course details",
      status: currentStage > 2 ? "completed" : currentStage === 2 ? "current" : "locked"
    },
    {
      id: "fees",
      title: "Fee Structure",
      description: "Course fees and payment options",
      status: currentStage > 3 ? "completed" : currentStage === 3 ? "current" : "locked"
    },
    {
      id: "coapplicant",
      title: "Co-applicant",
      description: "Loan requirements and KYC",
      status: currentStage > 4 ? "completed" : currentStage === 4 ? "current" : "locked"
    }
  ];

  const completionPercentage = Math.round(((currentStage - 1) / (stages.length - 1)) * 100);

  return (
    <NeumorphicCard
      className={cn("space-y-6", hovered && "glow-primary")}
      hover
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Enrollment Progress</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">{completionPercentage}%</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Progress tips">
                  <Info size={14} className="mr-1" /> Tips
                </Button>
              </PopoverTrigger>
              <PopoverContent className="max-w-[280px] py-3 shadow-none" side="left" align="end" showArrow>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium">{tips[currentTip].title}</p>
                    <p className="text-xs text-muted-foreground">{tips[currentTip].description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{currentTip + 1}/{tips.length}</span>
                    <div className="flex gap-0.5">
                      <Button size="icon" variant="ghost" className="size-6" onClick={handlePrev} disabled={isFirstTip} aria-label="Previous tip">
                        <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-6" onClick={handleNext} disabled={isLastTip} aria-label="Next tip">
                        <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="w-full bg-border rounded-full h-2 neumorphic-inset">
          <div 
            className="h-2 rounded-full gradient-primary transition-smooth"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {stages.map((stage, index) => (
          <ProgressStage
            key={stage.id}
            stage={index + 1}
            title={stage.title}
            description={stage.description}
            status={stage.status}
            isLast={index === stages.length - 1}
          />
        ))}
      </div>

      <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
        Complete each stage to unlock the next step
      </div>
    </NeumorphicCard>
  );
};
