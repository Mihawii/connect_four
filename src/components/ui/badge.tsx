import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium font-mono uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-ink bg-ink text-[var(--paper)]",
        ember: "border-ink bg-[var(--ember)] text-[oklch(0.99_0.014_85)]",
        gold: "border-ink bg-[var(--gold)] text-[var(--ink)]",
        outline: "border-ink text-foreground",
        secondary: "border-border bg-secondary text-secondary-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
