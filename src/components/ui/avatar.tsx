import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStoryState = "none" | "self" | "unseen" | "seen";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "h-6 w-6",   // 24
  sm: "h-8 w-8",   // 32
  md: "h-12 w-12", // 48
  lg: "h-16 w-16", // 64
  xl: "h-24 w-24", // 96
};

// Pseudo-element ring sits outside the image mask via inset:-3px so
// it never bleeds into the photo content.
const STORY_RING_CLASSES: Record<AvatarStoryState, string> = {
  none: "",
  self:
    "before:content-[''] before:absolute before:inset-[-3px] before:rounded-full before:border-2 before:border-dashed before:border-lavender before:pointer-events-none",
  unseen:
    "before:content-[''] before:absolute before:inset-[-3px] before:rounded-full before:border-2 before:border-solid before:border-coral before:pointer-events-none",
  seen:
    "before:content-[''] before:absolute before:inset-[-3px] before:rounded-full before:border-2 before:border-solid before:border-border-strong before:pointer-events-none",
};

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: AvatarSize;
  storyState?: AvatarStoryState;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = "md", storyState = "none", ...props }, ref) => (
  <span
    className={cn(
      "relative inline-block shrink-0",
      SIZE_CLASSES[size],
      STORY_RING_CLASSES[storyState],
      className,
    )}
  >
    <AvatarPrimitive.Root
      ref={ref}
      className="relative flex h-full w-full overflow-hidden rounded-full"
      {...props}
    />
  </span>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-elevated text-ink-secondary font-display text-sm font-medium",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
