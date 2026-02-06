import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ClipboardList, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';
import { contentApi, useContent, type Service, type ProcessStep } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * ServicesSection - Mobile-first, accessible services display
 * 
 * UX Improvements:
 * - Data-driven content from API
 * - Responsive grid (1 col mobile, 3 col desktop)
 * - Touch-friendly cards with proper spacing
 * - Clear visual hierarchy
 * - Semantic HTML with proper headings
 */

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Brain,
  ClipboardList,
  Users,
};

const ServicesSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'he';
  
  // Fetch services from API
  const { data: services, loading } = useContent(
    () => contentApi.getServices(),
    []
  );
  
  // Fetch process steps from API
  const { data: processSteps } = useContent(
    () => contentApi.getProcessSteps(),
    []
  );

  // Loading skeleton
  if (loading) {
    return (
      <Section id="services" dir={isRTL ? 'rtl' : 'ltr'} aria-labelledby="services-heading">
        <SectionHeader 
          title={t('services.title')} 
          titleId="services-heading"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section 
      id="services" 
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="services-heading"
    >
      <SectionHeader 
        title={t('services.title')} 
        titleId="services-heading"
      />

      {/* Services Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        role="list"
        aria-label={isRTL ? 'רשימת השירותים שלנו' : 'Our services list'}
      >
        {services?.map((service, index) => {
          const IconComponent = iconMap[service.icon] || Brain;
          
          return (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-50px' }}
              role="listitem"
            >
              <Card className={cn(
                "h-full transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1",
                "border border-gray-100",
                "focus-within:ring-2 focus-within:ring-green-700 focus-within:ring-offset-2"
              )}>
                <CardHeader className="text-center pb-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4",
                      "rounded-2xl flex items-center justify-center",
                      "bg-gradient-to-br shadow-md",
                      service.color
                    )}
                    aria-hidden="true"
                  >
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-lg sm:text-xl font-bold">
                    {service.title[language]}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-center text-base text-gray-600 leading-relaxed">
                    {service.description[language]}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.article>
          );
        })}
      </div>

      {/* Process Steps */}
      <div className="mt-16 sm:mt-20" aria-labelledby="process-heading">
        <h3 
          id="process-heading"
          className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12 text-foreground"
        >
          {isRTL ? 'תהליך האבחון' : 'Diagnosis Process'}
        </h3>
        
        {/* Mobile: Vertical steps, Desktop: Horizontal */}
        <ol 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          aria-label={isRTL ? 'שלבי תהליך האבחון' : 'Diagnosis process steps'}
        >
          {processSteps?.map((step, index) => (
            <motion.li
              key={step.id}
              className="relative text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Step Number */}
              <div 
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4",
                  "bg-gradient-to-br from-green-600 to-green-800 rounded-full",
                  "flex items-center justify-center shadow-md"
                )}
                aria-hidden="true"
              >
                <span className="text-lg sm:text-xl font-bold text-white">
                  {step.step}
                </span>
              </div>
              
              {/* Step Title */}
              <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                {step.title[language]}
              </h4>
              
              {/* Step Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description[language]}
              </p>
              
              {/* Connector Line - Desktop only */}
              {index < (processSteps?.length || 0) - 1 && (
                <div 
                  className="hidden lg:block absolute top-6 sm:top-7 left-full w-full h-0.5 bg-gradient-to-r from-green-600 to-green-400 opacity-30"
                  style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
                  aria-hidden="true"
                />
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
};

export default ServicesSection;
