import React from 'react';
import { cn } from '@/lib/utils';

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
  background?: 'default' | 'muted' | 'primary' | 'gradient';
  spacing?: 'sm' | 'md' | 'lg';
  container?: boolean;
  dir?: 'ltr' | 'rtl';
  'aria-labelledby'?: string;
}

const backgroundVariants = {
  default: 'bg-background',
  muted: 'bg-muted/30',
  primary: 'bg-green-800 text-white',
  gradient: 'bg-gradient-to-br from-green-800 to-green-950 text-white',
};

const spacingVariants = {
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16 lg:py-20',
  lg: 'py-16 md:py-20 lg:py-24',
};

export const Section: React.FC<SectionProps> = ({
  id,
  children,
  className,
  background = 'default',
  spacing = 'md',
  container = true,
  dir,
  'aria-labelledby': ariaLabelledby,
}) => {
  return (
    <section
      id={id}
      dir={dir}
      aria-labelledby={ariaLabelledby}
      className={cn(
        backgroundVariants[background],
        spacingVariants[spacing],
        className
      )}
    >
      {container ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

/**
 * SectionHeader - Consistent section header with title and subtitle
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
    <header className={cn('mb-8 md:mb-12', centered && 'text-center', className)}>
      <h2
        id={titleId}
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      <div 
        className={cn(
          "h-1 w-16 bg-gradient-to-r from-green-600 to-green-800 rounded-full mt-4",
          centered && "mx-auto"
        )}
        aria-hidden="true"
      />
    </header>
  );
};
