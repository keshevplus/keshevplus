import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import logo from '@/assets/logo.png';
import doctorHero from '@/assets/doctor-hero.png';
import { useLanguage } from '@/hooks/useLanguage';
import MobileNavigation from './MobileNavigation';
import { AccessibleButton } from './ui/accessible-button';
import { cn } from '@/lib/utils';

/**
 * MedicalHero - Mobile-first, accessible hero section
 * 
 * UX Improvements:
 * - Clear visual hierarchy
 * - Large, readable text with proper line-height
 * - Touch-friendly CTAs (min 44px)
 * - Progressive disclosure of information
 * - Calm, trustworthy aesthetic
 * - Reduced cognitive load
 */

const MedicalHero: React.FC = () => {
  const { t, language } = useLanguage();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  const typingTexts = language === 'he' 
    ? ['בילדים', 'בבני נוער', 'במבוגרים']
    : ['in Children', 'in Teens', 'in Adults'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % typingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [typingTexts.length]);

  const isRTL = language === 'he';

  return (
    <>
      <MobileNavigation />
      
      <main id="main-content">
        <section 
          id="home" 
          className="relative min-h-screen bg-white overflow-hidden" 
          dir={isRTL ? 'rtl' : 'ltr'}
          aria-label={isRTL ? 'ברוכים הבאים לקשב פלוס' : 'Welcome to Keshev Plus'}
        >
          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-20 md:pt-24 lg:pt-28 pb-12 md:pb-16">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              
              {/* Text Content */}
              <div className="w-full lg:w-1/2 order-2 lg:order-1 text-center lg:text-start">
                
                {/* Logo - Centered and larger */}
                <motion.div
                  className="flex justify-center lg:justify-start mb-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <img
                    src={logo}
                    alt={isRTL ? 'קשב פלוס' : 'Keshev Plus'}
                    className="w-48 sm:w-56 md:w-64 lg:w-80 xl:w-96 h-auto drop-shadow-md"
                  />
                </motion.div>
                
                {/* Welcome Text - Without duplicate clinic name */}
                <motion.h1 
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-800 mb-4 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {isRTL ? 'ברוכים הבאים למרפאה' : 'Welcome to the Clinic'}
                </motion.h1>

                {/* Typing Animation Text */}
                <motion.p 
                  className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-4 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {isRTL ? 'אבחון וטיפול בהפרעות קשב וריכוז ' : 'Diagnosis and Treatment of ADHD '}
                  <span 
                    className="inline-block min-w-[100px] font-bold text-green-800"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {typingTexts[currentTextIndex]}
                  </span>
                </motion.p>

                {/* Value Proposition */}
                <motion.p 
                  className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 leading-relaxed max-w-xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {isRTL 
                    ? 'ב"קשב פלוס" תקבלו אבחון מדויק ותוכנית טיפול אישית'
                    : 'At "Keshev Plus" you will receive accurate diagnosis and a personalized treatment plan'}
                </motion.p>

                {/* Reassurance Text */}
                <motion.p 
                  className="text-sm sm:text-base text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {isRTL 
                    ? 'צעד אחד קטן יכול לשנות את כל התמונה'
                    : 'One small step can change everything'}
                </motion.p>

                {/* CTA Buttons - Stacked on mobile, side-by-side on desktop */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <AccessibleButton 
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="sm:w-auto"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {isRTL ? 'התחילו אבחון עכשיו' : 'Start Diagnosis Now'}
                  </AccessibleButton>
                  
                  <AccessibleButton 
                    variant="secondary"
                    size="lg"
                    fullWidth
                    className="sm:w-auto"
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {isRTL ? 'קראו עוד עלינו' : 'Read More About Us'}
                  </AccessibleButton>
                </motion.div>

                {/* Quick Contact - Mobile only */}
                <motion.a
                  href="tel:055-27-399-27"
                  className={cn(
                    "mt-6 inline-flex items-center justify-center gap-2",
                    "text-green-800 font-medium text-sm",
                    "lg:hidden"
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  aria-label={isRTL ? 'התקשרו עכשיו: 055-27-399-27' : 'Call now: 055-27-399-27'}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>{isRTL ? 'או התקשרו עכשיו: 055-27-399-27' : 'Or call now: 055-27-399-27'}</span>
                </motion.a>
              </div>

              {/* Doctor Image */}
              <motion.div 
                className="w-full lg:w-1/2 order-1 lg:order-2 flex justify-center lg:justify-end"
                initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <img
                  src={doctorHero}
                  alt={isRTL ? 'רופאה מומחית באבחון ADHD' : 'Expert ADHD specialist doctor'}
                  className="w-64 sm:w-80 md:w-96 lg:w-full max-w-md h-auto object-contain drop-shadow-xl"
                  loading="eager"
                />
              </motion.div>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <section 
            className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 py-12 md:py-16"
            dir={isRTL ? 'rtl' : 'ltr'}
            aria-labelledby="cta-heading"
          >
            <div className="container mx-auto px-4 sm:px-6 text-center">
              <motion.h2 
                id="cta-heading"
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {isRTL ? 'מוכנים להתחיל?' : 'Ready to Start?'}
              </motion.h2>
              
              <motion.p 
                className="text-base sm:text-lg text-white/90 mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                {isRTL 
                  ? 'צרו קשר עכשיו לקביעת פגישת ייעוץ ראשונית'
                  : 'Contact us now to schedule an initial consultation'}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <AccessibleButton 
                  variant="secondary"
                  size="lg"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  {isRTL ? 'צרו קשר עכשיו' : 'Contact Us Now'}
                </AccessibleButton>
              </motion.div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
};

export default MedicalHero;
