import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ClipboardList, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';
import { contentApi, useContent, type Service, type ProcessStep } from '@/lib/content';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Brain,
  ClipboardList,
  Users,
};

const ServicesSection: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  
  const { data: services, loading } = useContent(
    () => contentApi.getServices(),
    []
  );
  
  const { data: processSteps } = useContent(
    () => contentApi.getProcessSteps(),
    []
  );

  if (loading) {
    return (
      <Section id="services" dir={isRTL ? 'rtl' : 'ltr'} aria-labelledby="services-heading">
        <SectionHeader 
          title={t('services.title')} 
          titleId="services-heading"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        role="list"
        aria-label={language === 'he' ? '\u05e8\u05e9\u05d9\u05de\u05ea \u05d4\u05e9\u05d9\u05e8\u05d5\u05ea\u05d9\u05dd \u05e9\u05dc\u05e0\u05d5' : 'Our services list'}
        data-testid="list-services"
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
              data-testid={`card-service-${service.id}`}
            >
              <Card className={cn(
                "h-full transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1",
                "border border-border",
                "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              )}>
                <CardHeader className="text-center pb-4">
                  <div
                    className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4",
                      "rounded-2xl flex items-center justify-center",
                      "bg-gradient-to-br shadow-md",
                      service.color
                    )}
                    aria-hidden="true"
                  >
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  
                  <CardTitle className="text-lg sm:text-xl font-bold">
                    {service.title[language]}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-center text-base text-muted-foreground leading-relaxed">
                    {service.description[language]}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-16 sm:mt-20" aria-labelledby="process-heading">
        <h3 
          id="process-heading"
          className="text-xl sm:text-2xl font-bold text-center mb-8 sm:mb-12 text-foreground"
        >
          {t('nav.process')}
        </h3>
        
        <ol 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          aria-label={t('services.process_steps')}
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
              <div 
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4",
                  "bg-gradient-to-br from-primary to-primary/80 rounded-full",
                  "flex items-center justify-center shadow-md"
                )}
                aria-hidden="true"
              >
                <span className="text-lg sm:text-xl font-bold text-primary-foreground">
                  {step.step}
                </span>
              </div>
              
              <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-foreground">
                {step.title[language]}
              </h4>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description[language]}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
};

export default ServicesSection;
