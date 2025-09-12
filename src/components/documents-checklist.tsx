import * as React from "react";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Item {
  id: string;
  label: string;
}

const defaultItems: Item[] = [
  { id: "aadhar", label: "Aadhaar Card (Applicant / Co-applicant)" },
  { id: "pan", label: "PAN Card (Applicant / Co-applicant)" },
  { id: "address", label: "Address Proof (Utility bill / Aadhaar)" },
  { id: "bank", label: "Last 6 months Bank Statements" },
  { id: "income", label: "Income Proof (if applicable)" },
  { id: "photo", label: "Passport-size Photograph" },
  { id: "kyc", label: "Signed KYC Form" },
];

export const DocumentsChecklist: React.FC<{
  title?: string;
  items?: Item[];
}> = ({ title = "Documents Checklist", items = defaultItems }) => {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const allDone = items.length > 0 && items.every((i) => checked[i.id]);
  const toggle = (id: string) => setChecked((s) => ({ ...s, [id]: !s[id] }));

  return (
    <NeumorphicCard className="space-y-4" hover>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs px-2 py-1 rounded-full border neumorphic-inset">
          {items.filter((i) => checked[i.id]).length}/{items.length} done
        </span>
      </div>

      <div className="space-y-3">
        {items.map((i) => (
          <label key={i.id} className="flex items-start gap-3 text-sm">
            <Checkbox checked={!!checked[i.id]} onCheckedChange={() => toggle(i.id)} />
            <span className="leading-5">{i.label}</span>
          </label>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-between">
        <Button variant="secondary" size="sm" disabled={!allDone}>
          Mark Ready
        </Button>
        <span className="text-xs text-muted-foreground">Complete all to proceed smoothly</span>
      </div>
    </NeumorphicCard>
  );
};

