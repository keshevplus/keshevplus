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

/**
 * FAQSection - Accessible FAQ with progressive disclosure
 * 
 * UX Improvements:
 * - Progressive disclosure reduces cognitive load
 * - Large touch targets for accordion triggers
 * - Semantic HTML with proper ARIA
 * - Data-driven content from API
 * - Mobile-optimized typography and spacing
 */

const FAQSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'he';
  
  // Fetch FAQs from API
  const { data: faqs, loading } = useContent(
    () => contentApi.getFAQs(),
    []
  );

  // Loading skeleton
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
            <div key={i} className="h-16 bg-white rounded-lg animate-pulse" />
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
        subtitle={isRTL 
          ? 'מצאו תשובות לשאלות הנפוצות ביותר על אבחון וטיפול ב-ADHD'
          : 'Find answers to the most common questions about ADHD diagnosis and treatment'
        }
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
                "bg-white rounded-lg border border-gray-100",
                "shadow-sm hover:shadow-md transition-shadow",
                "overflow-hidden"
              )}
            >
              <AccordionTrigger
                className={cn(
                  "px-4 sm:px-6 py-4 sm:py-5",
                  "text-left hover:no-underline",
                  "min-h-[56px] sm:min-h-[64px]",
                  // Ensure touch target is large enough
                  "[&>svg]:w-5 [&>svg]:h-5 [&>svg]:shrink-0",
                  "[&>svg]:ml-4 [&>svg]:text-green-700",
                  isRTL && "[&>svg]:ml-0 [&>svg]:mr-4"
                )}
              >
                <span className="text-base sm:text-lg font-medium text-foreground leading-snug pr-4">
                  {faq.question[language]}
                </span>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {faq.answer[language]}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      {/* Additional Help CTA */}
      <motion.div
        className="text-center mt-10 sm:mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <p className="text-base text-muted-foreground">
          {isRTL 
            ? 'לא מצאתם תשובה לשאלה שלכם?' 
            : "Didn't find the answer you're looking for?"}
        </p>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={cn(
            "inline-flex items-center justify-center mt-2 text-green-700 font-medium",
            "underline underline-offset-4",
            "hover:text-green-800 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2",
            "min-h-[44px]"
          )}
        >
          {isRTL ? 'צרו איתנו קשר' : 'Contact us'}
        </a>
      </motion.div>
    </Section>
  );
};

export default FAQSection;
