import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  floatingLabel?: string;
}

const baseInputClasses =
  "flex h-11 w-full rounded-md border border-input bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-tertiary file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground transition-[border-color,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:border-coral focus-visible:shadow-focus-coral disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, floatingLabel, id, placeholder, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const errorId = error ? `${inputId}-error` : undefined;

    if (!floatingLabel && !error) {
      return (
        <input
          type={type}
          id={inputId}
          ref={ref}
          placeholder={placeholder}
          className={cn(baseInputClasses, className)}
          {...props}
        />
      );
    }

    if (floatingLabel) {
      return (
        <div className="relative w-full">
          <input
            type={type}
            id={inputId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            placeholder=" "
            className={cn(
              baseInputClasses,
              "peer pt-4 pb-2 placeholder-transparent",
              error && "border-danger focus-visible:border-danger focus-visible:shadow-[0_0_0_3px_hsl(var(--danger)/0.3)]",
              className,
            )}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute left-3 top-1 text-[10px] font-medium uppercase tracking-wide text-ink-secondary transition-all duration-150",
              "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-ink-tertiary",
              "peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-coral",
              error && "text-danger peer-focus:text-danger",
            )}
          >
            {floatingLabel}
          </label>
          {error && (
            <p id={errorId} className="mt-1 text-xs text-danger">
              {error}
            </p>
          )}
        </div>
      );
    }

    // error without floatingLabel
    return (
      <div className="w-full">
        <input
          type={type}
          id={inputId}
          ref={ref}
          placeholder={placeholder}
          aria-invalid
          aria-describedby={errorId}
          className={cn(
            baseInputClasses,
            "border-danger focus-visible:border-danger focus-visible:shadow-[0_0_0_3px_hsl(var(--danger)/0.3)]",
            className,
          )}
          {...props}
        />
        <p id={errorId} className="mt-1 text-xs text-danger">
          {error}
        </p>
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
