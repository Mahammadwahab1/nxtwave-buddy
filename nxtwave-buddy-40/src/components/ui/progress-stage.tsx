import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";

export interface ProgressStageProps {
  stage: number;
  title: string;
  description: string;
  status: "completed" | "current" | "locked";
  isLast?: boolean;
}

const ProgressStage: React.FC<ProgressStageProps> = ({
  stage,
  title,
  description,
  status,
  isLast = false
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case "completed":
        return "bg-success text-white";
      case "current":
        return "gradient-primary text-white glow-primary";
      case "locked":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <Check size={16} />;
      case "current":
        return <span className="text-sm font-bold">{stage}</span>;
      case "locked":
        return <Lock size={16} />;
      default:
        return <span className="text-sm font-bold">{stage}</span>;
    }
  };

  return (
    <div className="flex items-start space-x-4">
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-smooth",
            getStatusStyles()
          )}
        >
          {getStatusIcon()}
        </div>
        {!isLast && (
          <div className={cn(
            "w-0.5 h-12 mt-2 transition-smooth",
            status === "completed" ? "bg-success" : "bg-border"
          )} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "text-sm font-semibold transition-smooth",
          status === "current" ? "text-primary" : 
          status === "completed" ? "text-success" : "text-muted-foreground"
        )}>
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

export { ProgressStage };