import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[transform,box-shadow,background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // editorial sticker: solid ink, paper text, hard offset shadow that presses on click
        default:
          "border-[1.5px] border-ink bg-ink text-[var(--paper)] shadow-hard-sm hover:-translate-x-px hover:-translate-y-px hover:[box-shadow:3px_3px_0_0_var(--ink)] active:translate-x-0 active:translate-y-0 active:shadow-none",
        ember:
          "border-[1.5px] border-ink bg-[var(--ember)] text-[oklch(0.99_0.014_85)] shadow-hard-sm hover:-translate-x-px hover:-translate-y-px hover:[box-shadow:3px_3px_0_0_var(--ink)] active:translate-x-0 active:translate-y-0 active:shadow-none",
        outline:
          "border-[1.5px] border-ink bg-transparent text-foreground hover:bg-[var(--accent)] hover:text-accent-foreground",
        secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-[var(--accent)]",
        ghost: "text-foreground hover:bg-[var(--accent)] hover:text-accent-foreground",
        destructive: "border-[1.5px] border-ink bg-destructive text-[var(--paper)] shadow-hard-sm active:shadow-none",
        link: "text-[var(--ember)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 text-sm [&_svg]:size-[18px]",
        sm: "h-8 px-3 text-xs [&_svg]:size-4",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        xl: "h-14 px-8 text-lg [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-[18px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
