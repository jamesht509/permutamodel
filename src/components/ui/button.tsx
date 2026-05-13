import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium font-display transition-[transform,background-color,border-color,color,box-shadow] duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:shadow-focus-coral disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-coral text-primary-foreground hover:bg-coral/90 active:bg-coral/95 shadow-glow-cta",
        secondary:
          "border border-lavender/60 text-lavender bg-transparent hover:bg-lavender/10 hover:border-lavender",
        ghost: "text-ink hover:bg-elevated hover:text-ink",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent text-ink hover:bg-elevated",
        link: "text-coral underline-offset-4 hover:underline",
        // Back-compat: existing consumers using variant="default" get primary
        default:
          "bg-coral text-primary-foreground hover:bg-coral/90 active:bg-coral/95 shadow-glow-cta",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-md",
        md: "h-11 px-5 text-sm rounded-md",
        lg: "h-12 px-7 text-base rounded-lg",
        icon: "h-10 w-10 rounded-md",
        // Back-compat alias for shadcn default size
        default: "h-11 px-5 text-sm rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
