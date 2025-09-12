import * as React from "react";
import { Shield, Award, Users, CheckCircle } from "lucide-react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";

export const TrustIndicators: React.FC = () => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = root.querySelectorAll('[data-lov-id]');
    targets.forEach((el) => {
      const id = el.getAttribute('data-lov-id') || '';
      if (id.includes('trust-indicators.tsx:15:6')) {
        el.removeAttribute('data-lov-id');
        el.removeAttribute('data-lov-name');
        el.removeAttribute('data-component-path');
        el.removeAttribute('data-component-line');
        el.removeAttribute('data-component-file');
        el.removeAttribute('data-component-name');
        el.removeAttribute('data-component-content');
      }
    });
  }, []);
  const trustStats = [
    { icon: Users, label: "Students Enrolled", value: "50,000+" },
    { icon: Award, label: "Success Rate", value: "95%" },
    { icon: Shield, label: "Secure Process", value: "Bank Grade" },
    { icon: CheckCircle, label: "Loan Approval", value: "Fast Track" },
  ];

  return (
    <div className="space-y-6" ref={rootRef}>
      <NeumorphicCard>
        <h3 className="text-lg font-semibold mb-4">Why Trust NxtWave?</h3>
        <div className="grid grid-cols-2 gap-4">
          {trustStats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto gradient-trust rounded-full flex items-center justify-center">
                <stat.icon size={20} className="text-white" />
              </div>
              <div className="text-lg font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </NeumorphicCard>
      {/* Partner banner & testimonials removed per request */}
    </div>
  );
};
