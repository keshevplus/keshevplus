import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

const ADHDInfoSection = () => {
  const { language, t, isRTL } = useLanguage();

  const { data: faqs, loading: faqsLoading } = useContent(
    () => contentApi.getFAQs(),
    []
  );

  const symptoms = language === 'he' ? [
    { icon: Brain, title: 'קשיי ריכוז', desc: 'קושי בשמירה על קשב למשימות' },
    { icon: Zap, title: 'היפראקטיביות', desc: 'תנועתיות מוגברת וחוסר מנוחה' },
    { icon: Target, title: 'אימפולסיביות', desc: 'פעילות ללא מחשבה מוקדמת' },
    { icon: Users, title: 'קשיים חברתיים', desc: 'קושי ביחסים בין אישיים' }
  ] : [
    { icon: Brain, title: 'Concentration Difficulties', desc: 'Difficulty maintaining attention to tasks' },
    { icon: Zap, title: 'Hyperactivity', desc: 'Increased movement and restlessness' },
    { icon: Target, title: 'Impulsivity', desc: 'Acting without prior thought' },
    { icon: Users, title: 'Social Difficulties', desc: 'Challenges in interpersonal relationships' }
  ];

  return (
    <Section 
      id="adhd" 
      background="muted" 
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="adhd-heading"
    >
      <SectionHeader 
        title={t('nav.adhd')}
        subtitle={language === 'he' 
          ? 'ADHD היא הפרעה נוירו-התפתחותית הפוגעת ביכולת הריכוז, הקשב והשליטה בדחפים. ההפרעה מתחילה בגיל הילדות ויכולה להמשיך עד לבגרות.'
          : 'ADHD is a neurodevelopmental disorder affecting concentration, attention and impulse control. The disorder begins in childhood and can continue into adulthood.'
        }
        titleId="adhd-heading"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
        {symptoms.map((symptom, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="h-full text-center shadow-md border-0 bg-background">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center"
                  aria-hidden="true"
                >
                  <symptom.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">{symptom.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{symptom.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bg-gradient-primary rounded-xl sm:rounded-2xl lg:rounded-3xl p-5 sm:p-8 lg:p-12 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-3 sm:mb-4 md:mb-6">
          {language === 'he' ? 'זכרו - ADHD ניתן לטיפול!' : 'Remember - ADHD is treatable!'}
        </h3>
        <p className="text-primary-foreground/90 text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl mx-auto">
          {language === 'he'
            ? 'עם האבחון הנכון והטיפול המתאים, ניתן לשפר משמעותית את איכות החיים ולהגיע להישגים גבוהים בכל תחומי החיים.'
            : 'With proper diagnosis and appropriate treatment, quality of life can be significantly improved and high achievements can be reached in all areas of life.'
          }
        </p>
      </motion.div>

      <div id="faq" className="mt-12 sm:mt-16 lg:mt-20">
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            {t('faq.title')}
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </motion.div>

        {faqsLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
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
        )}

        <motion.div
          className="text-center mt-10 sm:mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
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
            data-testid="link-contact-from-faq"
          >
            {t('faq.no_answer')}
          </a>
        </motion.div>
      </div>
    </Section>
  );
};

export default ADHDInfoSection;
