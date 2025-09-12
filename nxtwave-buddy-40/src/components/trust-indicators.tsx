import * as React from "react";
import { Shield, Award, Users, CheckCircle } from "lucide-react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import trustPartnersImage from "@/assets/trust-partners.jpg";

export const TrustIndicators: React.FC = () => {
  const trustStats = [
    { icon: Users, label: "Students Enrolled", value: "50,000+" },
    { icon: Award, label: "Success Rate", value: "95%" },
    { icon: Shield, label: "Secure Process", value: "Bank Grade" },
    { icon: CheckCircle, label: "Loan Approval", value: "Fast Track" }
  ];

  const testimonials = [
    {
      text: "Maya helped me understand the entire process. Now I'm confidently pursuing my dream course!",
      author: "Priya S.",
      course: "Full Stack Development"
    },
    {
      text: "The loan process was so smooth with Maya's guidance. No confusion, just clear steps.",
      author: "Rahul K.",
      course: "Data Science"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Trust Stats */}
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

      {/* NBFC Partners */}
      <NeumorphicCard>
        <h3 className="text-sm font-semibold mb-3 text-center">Trusted By Leading Financial Partners</h3>
        <div className="relative">
          <img 
            src={trustPartnersImage} 
            alt="Trusted Financial Partners" 
            className="w-full h-24 object-cover rounded-lg opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent rounded-lg" />
        </div>
        <div className="flex items-center justify-center space-x-4 mt-3">
          <div className="flex items-center space-x-1">
            <Shield size={14} className="text-success" />
            <span className="text-xs text-muted-foreground">256-bit SSL</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle size={14} className="text-success" />
            <span className="text-xs text-muted-foreground">RBI Approved</span>
          </div>
        </div>
      </NeumorphicCard>

      {/* Testimonials */}
      <NeumorphicCard>
        <h3 className="text-sm font-semibold mb-3">Success Stories</h3>
        <div className="space-y-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="neumorphic-inset p-3 rounded-lg">
              <p className="text-xs text-foreground mb-2">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="text-xs text-muted-foreground">
                <strong>{testimonial.author}</strong> • {testimonial.course}
              </div>
            </div>
          ))}
        </div>
      </NeumorphicCard>
    </div>
  );
};