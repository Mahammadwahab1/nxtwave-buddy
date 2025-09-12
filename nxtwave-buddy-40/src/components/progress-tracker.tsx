import * as React from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { ProgressStage } from "@/components/ui/progress-stage";

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
      title: "Co-applicant & Documents",
      description: "Loan requirements and KYC",
      status: currentStage > 4 ? "completed" : currentStage === 4 ? "current" : "locked"
    },
    {
      id: "verification",
      title: "Verification",
      description: "Final verification and approval",
      status: currentStage > 5 ? "completed" : currentStage === 5 ? "current" : "locked"
    },
    {
      id: "completion",
      title: "Enrollment Complete",
      description: "Ready to start learning",
      status: currentStage > 6 ? "completed" : currentStage === 6 ? "current" : "locked"
    }
  ];

  const completionPercentage = Math.round(((currentStage - 1) / (stages.length - 1)) * 100);

  return (
    <NeumorphicCard className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Enrollment Progress</h3>
          <span className="text-sm font-medium text-primary">{completionPercentage}%</span>
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