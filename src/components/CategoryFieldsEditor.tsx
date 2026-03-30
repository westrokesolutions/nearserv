import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface ServiceItem { title: string; description: string }
interface ProcessStep { step: number; title: string; description: string }
interface FaqItem { question: string; answer: string }

interface Props {
  services: ServiceItem[];
  steps: ProcessStep[];
  faqs: FaqItem[];
  priceInfo: string;
  onServicesChange: (s: ServiceItem[]) => void;
  onStepsChange: (s: ProcessStep[]) => void;
  onFaqsChange: (f: FaqItem[]) => void;
  onPriceInfoChange: (p: string) => void;
}

const CategoryFieldsEditor = ({ services, steps, faqs, priceInfo, onServicesChange, onStepsChange, onFaqsChange, onPriceInfoChange }: Props) => {
  return (
    <div className="space-y-6">
      {/* Services Included */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Services Included</Label>
        <p className="text-xs text-muted-foreground">List all services this category offers</p>
        {services.map((s, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Service title (e.g. AC Gas Refilling)"
                value={s.title}
                onChange={(e) => {
                  const updated = [...services];
                  updated[i] = { ...updated[i], title: e.target.value };
                  onServicesChange(updated);
                }}
              />
              <Input
                placeholder="Brief description (optional)"
                value={s.description}
                onChange={(e) => {
                  const updated = [...services];
                  updated[i] = { ...updated[i], description: e.target.value };
                  onServicesChange(updated);
                }}
                className="text-xs"
              />
            </div>
            <Button
              type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 mt-1"
              onClick={() => onServicesChange(services.filter((_, j) => j !== i))}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onServicesChange([...services, { title: "", description: "" }])}>
          <Plus className="w-3 h-3" /> Add Service
        </Button>
      </div>

      {/* Process Steps */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">How It Works (Process Steps)</Label>
        <p className="text-xs text-muted-foreground">Step-by-step process of how the service is delivered</p>
        {steps.map((s, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="w-6 h-8 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{i + 1}</span>
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Step title (e.g. Book a slot online)"
                value={s.title}
                onChange={(e) => {
                  const updated = [...steps];
                  updated[i] = { ...updated[i], step: i + 1, title: e.target.value };
                  onStepsChange(updated);
                }}
              />
              <Input
                placeholder="Step description (optional)"
                value={s.description}
                onChange={(e) => {
                  const updated = [...steps];
                  updated[i] = { ...updated[i], description: e.target.value };
                  onStepsChange(updated);
                }}
                className="text-xs"
              />
            </div>
            <Button
              type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 mt-1"
              onClick={() => onStepsChange(steps.filter((_, j) => j !== i).map((s, idx) => ({ ...s, step: idx + 1 })))}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onStepsChange([...steps, { step: steps.length + 1, title: "", description: "" }])}>
          <Plus className="w-3 h-3" /> Add Step
        </Button>
      </div>

      {/* FAQs */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">FAQs</Label>
        <p className="text-xs text-muted-foreground">Common questions customers ask about this service</p>
        {faqs.map((f, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Question (e.g. How long does AC servicing take?)"
                value={f.question}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[i] = { ...updated[i], question: e.target.value };
                  onFaqsChange(updated);
                }}
              />
              <Textarea
                placeholder="Answer"
                value={f.answer}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[i] = { ...updated[i], answer: e.target.value };
                  onFaqsChange(updated);
                }}
                rows={2}
                className="text-xs"
              />
            </div>
            <Button
              type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 mt-1"
              onClick={() => onFaqsChange(faqs.filter((_, j) => j !== i))}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onFaqsChange([...faqs, { question: "", answer: "" }])}>
          <Plus className="w-3 h-3" /> Add FAQ
        </Button>
      </div>

      {/* Pricing Info */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Pricing Info</Label>
        <p className="text-xs text-muted-foreground">General pricing details or rate ranges</p>
        <Textarea
          placeholder="e.g. AC servicing starts from ₹499&#10;Gas refilling: ₹1,500 - ₹2,500&#10;Deep cleaning: ₹799"
          value={priceInfo}
          onChange={(e) => onPriceInfoChange(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
};

export default CategoryFieldsEditor;
