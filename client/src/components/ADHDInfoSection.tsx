import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';

const ADHDInfoSection = () => {
  const { language, t, isRTL } = useLanguage();

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
    </Section>
  );
};

export default ADHDInfoSection;