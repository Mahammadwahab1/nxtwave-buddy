import * as React from "react";
import promoImage from "@/assets/trust-partners.jpg";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// A lightweight, auto-dismiss popup used at Co-applicant stage
export const CoApplicantPromo: React.FC<Props> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dark overlay (provided by DialogContent, but we add a light blur) */}
      <DialogOverlay className="backdrop-blur-[2px]" />
      <DialogContent className="p-0 border-0 shadow-2xl sm:rounded-xl overflow-hidden bg-transparent w-[min(92vw,760px)] [&>button]:hidden">
        <div className="relative">
          <img
            src={promoImage}
            alt="NxtWave trusted 0% interest loans"
            className="w-full h-auto block"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

