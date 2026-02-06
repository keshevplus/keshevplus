import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import logo from '@/assets/logo.png';
import doctorHero from '@/assets/doctor-hero.png';
import { useLanguage } from '@/hooks/useLanguage';
import MobileNavigation from './MobileNavigation';
import { AccessibleButton } from './ui/accessible-button';
import { cn } from '@/lib/utils';

const MedicalHero: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  const typingTexts = language === 'he' 
    ? ['\u05d1\u05d9\u05dc\u05d3\u05d9\u05dd', '\u05d1\u05d1\u05e0\u05d9 \u05e0\u05d5\u05e2\u05e8', '\u05d1\u05de\u05d1\u05d5\u05d2\u05e8\u05d9\u05dd']
    : ['in Children', 'in Teens', 'in Adults'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % typingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [typingTexts.length]);

  return (
    <>
      <MobileNavigation />
      
      <main id="main-content">
        <section 
          id="home" 
          className="relative min-h-screen bg-background overflow-hidden" 
          dir={isRTL ? 'rtl' : 'ltr'}
          aria-label={language === 'he' ? '\u05d1\u05e8\u05d5\u05db\u05d9\u05dd \u05d4\u05d1\u05d0\u05d9\u05dd \u05dc\u05e7\u05e9\u05d1 \u05e4\u05dc\u05d5\u05e1' : 'Welcome to Keshev Plus'}
        >
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 lg:pt-28 pb-8 sm:pb-12 md:pb-16">
            <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
              
              <div className="w-full lg:w-1/2 order-2 lg:order-1 text-center lg:text-start">
                
                <motion.div
                  className="flex justify-center lg:justify-start mb-4 sm:mb-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <img
                    src={logo}
                    alt={language === 'he' ? '\u05e7\u05e9\u05d1 \u05e4\u05dc\u05d5\u05e1' : 'Keshev Plus'}
                    className="w-40 sm:w-52 md:w-64 lg:w-72 xl:w-80 h-auto drop-shadow-md"
                  />
                </motion.div>
                
                <motion.h1 
                  className="font-bold text-primary mb-3 sm:mb-4 leading-tight"
                  style={{ fontSize: 'clamp(1.25rem, 3vw + 0.25rem, 2.5rem)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {language === 'he' ? '\u05d1\u05e8\u05d5\u05db\u05d9\u05dd \u05d4\u05d1\u05d0\u05d9\u05dd \u05dc\u05de\u05e8\u05e4\u05d0\u05d4' : 'Welcome to the Clinic'}
                </motion.h1>

                <motion.p 
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-3 sm:mb-4 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {language === 'he' ? '\u05d0\u05d1\u05d7\u05d5\u05df \u05d5\u05d8\u05d9\u05e4\u05d5\u05dc \u05d1\u05d4\u05e4\u05e8\u05e2\u05d5\u05ea \u05e7\u05e9\u05d1 \u05d5\u05e8\u05d9\u05db\u05d5\u05d6 ' : 'Diagnosis and Treatment of ADHD '}
                  <span 
                    className="inline-block min-w-[80px] sm:min-w-[100px] font-bold text-primary"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {typingTexts[currentTextIndex]}
                  </span>
                </motion.p>

                <motion.p 
                  className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-4 sm:mb-6 leading-relaxed max-w-xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {language === 'he' 
                    ? '\u05d1"\u05e7\u05e9\u05d1 \u05e4\u05dc\u05d5\u05e1" \u05ea\u05e7\u05d1\u05dc\u05d5 \u05d0\u05d1\u05d7\u05d5\u05df \u05de\u05d3\u05d5\u05d9\u05e7 \u05d5\u05ea\u05d5\u05db\u05e0\u05d9\u05ea \u05d8\u05d9\u05e4\u05d5\u05dc \u05d0\u05d9\u05e9\u05d9\u05ea'
                    : 'At "Keshev Plus" you will receive accurate diagnosis and a personalized treatment plan'}
                </motion.p>

                <motion.p 
                  className="text-xs sm:text-sm md:text-base text-muted-foreground/70 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {language === 'he' 
                    ? '\u05e6\u05e2\u05d3 \u05d0\u05d7\u05d3 \u05e7\u05d8\u05df \u05d9\u05db\u05d5\u05dc \u05dc\u05e9\u05e0\u05d5\u05ea \u05d0\u05ea \u05db\u05dc \u05d4\u05ea\u05de\u05d5\u05e0\u05d4'
                    : 'One small step can change everything'}
                </motion.p>

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
                    data-testid="button-start-diagnosis"
                  >
                    {language === 'he' ? '\u05d4\u05ea\u05d7\u05d9\u05dc\u05d5 \u05d0\u05d1\u05d7\u05d5\u05df \u05e2\u05db\u05e9\u05d9\u05d5' : 'Start Diagnosis Now'}
                  </AccessibleButton>
                  
                  <AccessibleButton 
                    variant="secondary"
                    size="lg"
                    fullWidth
                    className="sm:w-auto"
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                    data-testid="button-read-more"
                  >
                    {language === 'he' ? '\u05e7\u05e8\u05d0\u05d5 \u05e2\u05d5\u05d3 \u05e2\u05dc\u05d9\u05e0\u05d5' : 'Read More About Us'}
                  </AccessibleButton>
                </motion.div>

                <motion.a
                  href="tel:055-27-399-27"
                  className={cn(
                    "mt-4 sm:mt-6 inline-flex items-center justify-center gap-2",
                    "text-primary font-medium text-sm",
                    "min-h-[44px]",
                    "lg:hidden"
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  aria-label={language === 'he' ? '\u05d4\u05ea\u05e7\u05e9\u05e8\u05d5 \u05e2\u05db\u05e9\u05d9\u05d5: 055-27-399-27' : 'Call now: 055-27-399-27'}
                  data-testid="link-phone-hero"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>{language === 'he' ? '\u05d0\u05d5 \u05d4\u05ea\u05e7\u05e9\u05e8\u05d5 \u05e2\u05db\u05e9\u05d9\u05d5: 055-27-399-27' : 'Or call now: 055-27-399-27'}</span>
                </motion.a>
              </div>

              <motion.div 
                className="w-full lg:w-1/2 order-1 lg:order-2 flex justify-center lg:justify-end"
                initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <img
                  src={doctorHero}
                  alt={language === 'he' ? '\u05e8\u05d5\u05e4\u05d0\u05d4 \u05de\u05d5\u05de\u05d7\u05d9\u05ea \u05d1\u05d0\u05d1\u05d7\u05d5\u05df ADHD' : 'Expert ADHD specialist doctor'}
                  className="w-48 sm:w-64 md:w-80 lg:w-full max-w-sm lg:max-w-md h-auto object-contain drop-shadow-xl"
                  loading="eager"
                />
              </motion.div>
            </div>
          </div>

          <section 
            className="relative z-10 bg-gradient-to-r from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 py-8 sm:py-12 md:py-16"
            dir={isRTL ? 'rtl' : 'ltr'}
            aria-labelledby="cta-heading"
          >
            <div className="container mx-auto px-4 sm:px-6 text-center">
              <motion.h2 
                id="cta-heading"
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {language === 'he' ? '\u05de\u05d5\u05db\u05e0\u05d9\u05dd \u05dc\u05d4\u05ea\u05d7\u05d9\u05dc?' : 'Ready to Start?'}
              </motion.h2>
              
              <motion.p 
                className="text-base sm:text-lg text-primary-foreground/90 mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                {language === 'he' 
                  ? '\u05e6\u05e8\u05d5 \u05e7\u05e9\u05e8 \u05e2\u05db\u05e9\u05d9\u05d5 \u05dc\u05e7\u05d1\u05d9\u05e2\u05ea \u05e4\u05d2\u05d9\u05e9\u05ea \u05d9\u05d9\u05e2\u05d5\u05e5 \u05e8\u05d0\u05e9\u05d5\u05e0\u05d9\u05ea'
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
                  data-testid="button-contact-cta"
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  {language === 'he' ? '\u05e6\u05e8\u05d5 \u05e7\u05e9\u05e8 \u05e2\u05db\u05e9\u05d9\u05d5' : 'Contact Us Now'}
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
