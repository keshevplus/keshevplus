import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * AccessibleButton - Enhanced button with accessibility features
 * 
 * Features:
 * - Minimum 44px touch target
 * - Focus visible indicators
 * - Loading state with screen reader announcement
 * - Disabled state handling
 */

const accessibleButtonVariants = cva(
  [
    // Base styles
    "inline-flex items-center justify-center gap-2",
    "font-medium text-base",
    "transition-all duration-200 ease-out",
    // Minimum touch target (44px)
    "min-h-[44px] min-w-[44px] px-6",
    // Focus styles (keyboard accessible)
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Disabled styles
    "disabled:pointer-events-none disabled:opacity-50",
    // Active state
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-green-700 text-white",
          "hover:bg-green-800",
          "shadow-md hover:shadow-lg",
        ].join(" "),
        secondary: [
          "bg-orange-500 text-white",
          "hover:bg-orange-600",
          "shadow-md hover:shadow-lg",
        ].join(" "),
        outline: [
          "border-2 border-green-700 text-green-700 bg-transparent",
          "hover:bg-green-50",
        ].join(" "),
        ghost: [
          "text-foreground bg-transparent",
          "hover:bg-muted",
        ].join(" "),
        link: [
          "text-green-700 underline-offset-4",
          "hover:underline",
          "min-h-0 px-0",
        ].join(" "),
      },
      size: {
        sm: "min-h-[40px] px-4 text-sm rounded-lg",
        md: "min-h-[44px] px-6 text-base rounded-lg",
        lg: "min-h-[52px] px-8 text-lg rounded-xl",
        icon: "min-h-[44px] min-w-[44px] p-0 rounded-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof accessibleButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    asChild = false, 
    loading = false,
    loadingText = "Loading...",
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(accessibleButtonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span 
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">{loadingText}</span>
            <span aria-hidden="true">{loadingText}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

export { AccessibleButton, accessibleButtonVariants };
