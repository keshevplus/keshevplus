import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Heart, Award, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage, useIsDemo } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';
import heroAbout from '@/assets/hero-about.jpg';

const values = [
  { icon: Heart, titleKey: 'about.value1_title', descKey: 'about.value1_desc' },
  { icon: Award, titleKey: 'about.value2_title', descKey: 'about.value2_desc' },
  { icon: Shield, titleKey: 'about.value3_title', descKey: 'about.value3_desc' },
];

const credentialKeys = ['about.credential1', 'about.credential2', 'about.credential3'];

const AboutSection: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const isDemo = useIsDemo();
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Section 
      id="about" 
      className="bg-muted/20 dark:bg-card"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="about-heading"
      header={<SectionHeader title={t('about.title')} subtitle={t('about.subtitle')} titleId="about-heading" />}
    >

      <div ref={ref} className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center mb-8 sm:mb-12 lg:mb-16">
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`order-1 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}
        >
          <div className="relative">
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl sm:rounded-2xl transform rotate-2" />
            <img
              src={heroAbout}
              alt={t('about.doctor_alt')}
              className="relative rounded-lg sm:rounded-xl shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto object-cover aspect-[4/5]"
              loading="lazy"
              width="400"
              height="500"
              decoding="async"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`order-2 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2" data-testid="text-doctor-name">
                {t('about.doctor_name')}
              </h3>
              <p className="text-lg text-primary/80 font-medium mb-4" data-testid="text-doctor-title">
                {t('about.doctor_title')}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6" data-testid="text-doctor-desc">
                {t('about.doctor_desc')}
              </p>
              
              {!isDemo && (
                <ul className="space-y-3">
                  {credentialKeys.map((key, index) => (
                    <motion.li
                      key={key}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground/80" data-testid={`text-credential-${index}`}>{t(key)}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {!isDemo && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed italic" data-testid="text-mission">
              "{t('about.mission')}"
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={value.titleKey}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-value-title-${index}`}>
                        {t(value.titleKey)}
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed" data-testid={`text-value-desc-${index}`}>
                        {t(value.descKey)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </Section>
  );
};

export default AboutSection;
