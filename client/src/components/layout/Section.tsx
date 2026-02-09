import React from "react";
import { cn } from "@/lib/utils";

/**
 * Section - Semantic section wrapper with consistent spacing
 *
 * Features:
 * - Semantic HTML (section element)
 * - Consistent vertical rhythm (8px scale)
 * - Responsive padding
 * - Optional background variants
 * - RTL support
 */

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  background?: "default" | "muted" | "primary" | "gradient";
  spacing?: "sm" | "md" | "lg";
  container?: boolean;
  dir?: "ltr" | "rtl";
  "aria-labelledby"?: string;
}

const backgroundVariants = {
  default: "bg-background",
  muted: "bg-muted/30",
  primary: "green-section-bg",
  gradient: "green-section-bg",
};

const spacingVariants = {
  sm: "py-8 md:py-12",
  md: "py-10 md:py-12 lg:py-16",
  lg: "py-12 md:py-16 lg:py-20",
};

export const Section: React.FC<SectionProps> = ({
  id,
  children,
  className,
  background = "default",
  spacing = "md",
  container = true,
  dir,
  "aria-labelledby": ariaLabelledby,
}) => {
  return (
    <section
      id={id}
      dir={dir}
      aria-labelledby={ariaLabelledby}
      className={cn(
        backgroundVariants[background],
        spacingVariants[spacing],
        "overflow-visible relative",
        className,
      )}
    >
      {container ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

/**
 * SectionHeader - Full-width green banner with white title text
 */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  titleId?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  centered = true,
  className,
  titleId,
}) => {
  return (
    <div className={cn("mb-8 md:mb-12", className)}>
      <div className="green-section-bg -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5 md:py-6">
        <div className="max-w-7xl mx-auto">
          <h2
            id={titleId}
            className={cn(
              "text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground",
              centered && "text-center",
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "text-base sm:text-lg text-primary-foreground/80 mt-2 max-w-2xl leading-relaxed",
                centered && "text-center mx-auto",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
