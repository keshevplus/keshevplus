import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Pill, Monitor, ClipboardList, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';
import { cn } from '@/lib/utils';

const services = [
  { id: '1', icon: Brain, titleKey: 'services.service1_title', descKey: 'services.service1_desc', color: 'from-emerald-500 to-teal-600' },
  { id: '2', icon: Pill, titleKey: 'services.service2_title', descKey: 'services.service2_desc', color: 'from-blue-500 to-indigo-600' },
  { id: '3', icon: Monitor, titleKey: 'services.service3_title', descKey: 'services.service3_desc', color: 'from-purple-500 to-violet-600' },
  { id: '4', icon: ClipboardList, titleKey: 'services.service4_title', descKey: 'services.service4_desc', color: 'from-orange-500 to-amber-600' },
  { id: '5', icon: Users, titleKey: 'services.service5_title', descKey: 'services.service5_desc', color: 'from-teal-500 to-cyan-600' },
];

const processSteps = [
  { id: '1', step: 1, titleKey: 'services.step1_title', descKey: 'services.step1_desc' },
  { id: '2', step: 2, titleKey: 'services.step2_title', descKey: 'services.step2_desc' },
  { id: '3', step: 3, titleKey: 'services.step3_title', descKey: 'services.step3_desc' },
  { id: '4', step: 4, titleKey: 'services.step4_title', descKey: 'services.step4_desc' },
];

const ServicesSection: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <Section 
      id="services" 
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="services-heading"
    >
      <SectionHeader 
        title={t('services.title')} 
        subtitle={t('services.subtitle')}
        titleId="services-heading"
      />

      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        role="list"
        aria-label={t('services.list_label')}
        data-testid="list-services"
      >
        {services.map((service, index) => {
          const IconComponent = service.icon;
          
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
                  
                  <CardTitle className="text-lg sm:text-xl font-bold" data-testid={`text-service-title-${service.id}`}>
                    {t(service.titleKey)}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-center text-base text-muted-foreground leading-relaxed" data-testid={`text-service-desc-${service.id}`}>
                    {t(service.descKey)}
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
          {processSteps.map((step, index) => (
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
              
              <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-foreground" data-testid={`text-step-title-${step.id}`}>
                {t(step.titleKey)}
              </h4>
              
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-step-desc-${step.id}`}>
                {t(step.descKey)}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
};

export default ServicesSection;
