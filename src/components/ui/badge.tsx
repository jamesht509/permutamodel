import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:shadow-focus-coral [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Default: neutral elevated surface
        default: "border-transparent bg-elevated text-ink",
        success: "border-transparent bg-success/20 text-success",
        warning: "border-transparent bg-warning/20 text-warning",
        info: "border-transparent bg-lavender/20 text-lavender",
        coral: "border-transparent bg-coral text-primary-foreground",
        outline: "border-border text-ink bg-transparent",
        destructive: "border-transparent bg-destructive/20 text-destructive",
        // Back-compat with old shadcn variant name (was solid secondary)
        secondary: "border-transparent bg-lavender/20 text-lavender",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
