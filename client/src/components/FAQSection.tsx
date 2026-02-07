import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { contentApi, useContent } from '@/lib/content';
import { cn } from '@/lib/utils';

const FAQSection: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  
  const { data: faqs, loading } = useContent(
    () => contentApi.getFAQs(),
    []
  );

  if (loading) {
    return (
      <Section 
        id="faq" 
        background="muted"
        dir={isRTL ? 'rtl' : 'ltr'}
        aria-labelledby="faq-heading"
      >
        <SectionHeader 
          title={t('nav.faq')} 
          titleId="faq-heading"
        />
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      </Section>
    );
  }

  return (
    <Section 
      id="faq" 
      background="muted"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="faq-heading"
    >
      <SectionHeader 
        title={t('nav.faq')} 
        subtitle={t('faq.subtitle')}
        titleId="faq-heading"
      />

      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
          {faqs?.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className={cn(
                "bg-card rounded-lg border border-border",
                "shadow-sm hover:shadow-md transition-shadow",
                "overflow-hidden"
              )}
            >
              <AccordionTrigger
                className={cn(
                  "px-4 sm:px-6 py-4 sm:py-5",
                  "text-left hover:no-underline",
                  "min-h-[56px] sm:min-h-[64px]",
                  "[&>svg]:w-5 [&>svg]:h-5 [&>svg]:shrink-0",
                  "[&>svg]:ml-4 [&>svg]:text-primary",
                  isRTL && "[&>svg]:ml-0 [&>svg]:mr-4"
                )}
              >
                <span className="text-base sm:text-lg font-medium text-foreground leading-snug pr-4">
                  {faq.question[language]}
                </span>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {faq.answer[language]}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      <motion.div
        className="text-center mt-10 sm:mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <p className="text-base text-muted-foreground">
          {t('faq.no_answer_question')}
        </p>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={cn(
            "inline-flex items-center justify-center mt-2 text-primary font-medium",
            "underline underline-offset-4",
            "hover:text-primary/80 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "min-h-[44px]"
          )}
        >
          {t('faq.contact_us')}
        </a>
      </motion.div>
    </Section>
  );
};

export default FAQSection;
