"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/lib/store/settingsStore";
import { Button } from "@/components/ui/button";
import { Flame, Clock, Sparkles, ArrowRight, Check } from "@/components/icons";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Inferno",
    icon: Flame,
    color: "text-[var(--ember)]",
    description: "A fast-paced, burning variant of Connect Four. It’s not just about what you place—it’s about what survives.",
  },
  {
    id: "rules",
    title: "Discs Burn",
    icon: Flame,
    color: "text-orange-500",
    description: "In Inferno Mode, every disc you drop has a lifespan of exactly 10 of your turns. Once its time is up, it burns away, and everything above it falls. The classic strategies won't save you here.",
  },
  {
    id: "time",
    title: "Time is Fire",
    icon: Clock,
    color: "text-[var(--gold)]",
    description: "Play Blitz matches where the clock is your biggest enemy. Play fast, think faster, or run out of time.",
  },
  {
    id: "coach",
    title: "AI Coach",
    icon: Sparkles,
    color: "text-purple-500",
    description: "After the match, consult the AI Coach. It analyzes your moves and points out where you blundered and where you played brilliantly.",
  }
];

export function OnboardingModal() {
  const { hasSeenOnboarding, setHasSeenOnboarding } = useSettings();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    // Only show if we haven't seen it, wait a brief moment for the board to render
    if (!hasSeenOnboarding) {
      const t = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(t);
    }
  }, [hasSeenOnboarding]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setOpen(false);
      setHasSeenOnboarding(true);
    }
  };

  const onOpenChange = (val: boolean) => {
    if (!val) {
      setHasSeenOnboarding(true);
    }
    setOpen(val);
  };

  const curr = STEPS[step];
  const Icon = curr.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-[2px] border-ink bg-[var(--paper)] p-0 shadow-[8px_8px_0_0_var(--ink)] sm:rounded-xl overflow-hidden text-foreground">
        <DialogTitle className="sr-only">{curr.title}</DialogTitle>
        <div className="flex h-1 bg-[var(--line-soft)]">
          <div 
            className="h-full bg-[var(--ember)] transition-all duration-300 ease-out" 
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} 
          />
        </div>
        
        <div className="p-6 sm:p-8">
          <div className={`mb-6 inline-flex size-14 items-center justify-center rounded-2xl border-[1.5px] border-ink bg-white shadow-[4px_4px_0_0_var(--ink)] ${curr.color}`}>
            <Icon className="size-7" />
          </div>
          
          <h2 className="mb-3 font-display text-2xl font-extrabold tracking-tight text-ink">
            {curr.title}
          </h2>
          
          <p className="min-h-[80px] text-[15px] leading-relaxed text-[var(--ink-soft)] font-medium">
            {curr.description}
          </p>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`size-2 rounded-full transition-colors ${i === step ? 'bg-ink' : 'bg-[var(--ink-soft)] opacity-20'}`} 
                />
              ))}
            </div>
            
            <Button onClick={handleNext} variant="default" className="gap-2">
              {step === STEPS.length - 1 ? (
                <>Start Playing <Check className="size-4" /></>
              ) : (
                <>Next <ArrowRight className="size-4" /></>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
