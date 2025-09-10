import * as React from "react";
import { cn } from "@/lib/utils";

export interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "inset";
  hover?: boolean;
}

const NeumorphicCard = React.forwardRef<HTMLDivElement, NeumorphicCardProps>(
  ({ className, variant = "default", hover = false, ...props }, ref) => {
    const variants = {
      default: "neumorphic",
      elevated: "neumorphic-float",
      inset: "neumorphic-inset"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-6",
          variants[variant],
          hover && "hover:scale-[1.02] transition-bounce cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);

NeumorphicCard.displayName = "NeumorphicCard";

export { NeumorphicCard };