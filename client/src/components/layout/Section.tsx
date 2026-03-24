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
  header?: React.ReactNode;
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
  sm: "pt-8 md:pt-12",
  md: "pt-10 md:pt-12 lg:pt-16",
  lg: "pt-12 md:pt-16 lg:pt-20",
};


export const Section: React.FC<SectionProps> = ({
  id,
  children,
  header,
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
        "overflow-x-hidden relative",
        className,
      )}
    >
      {/* Header renders outside the container so it naturally fills 100% section width */}
      {header}
      {container ? (
        <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl", header ? "pt-8 md:pt-10 lg:pt-12" : spacingVariants[spacing])}>
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
    <div className={cn("w-full green-section-bg px-4 sm:px-6 lg:px-8 py-5 md:py-6 text-center", className)}>
      <h2
        id={titleId}
        data-sticky-title={title}
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-primary-foreground/80 mt-2 max-w-2xl leading-relaxed mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};
