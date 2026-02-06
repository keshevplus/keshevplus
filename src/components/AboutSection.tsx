import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Heart, Award, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { contentApi, useContent, type AboutContent } from '@/lib/content';
import { Section } from '@/components/layout/Section';
import heroAbout from '@/assets/hero-about.jpg';

/**
 * AboutSection - Professional medical about section
 * Displays Dr. Irene Kochav-Reifman's profile and clinic values
 */

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Award,
  Shield,
};

const AboutSection: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  
  // All hooks must be called before any conditional returns
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const { data: content, loading } = useContent<AboutContent>(
    () => contentApi.getAboutContent(),
    []
  );

  if (loading || !content) {
    return (
      <Section id="about" className="bg-gray-50">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </Section>
    );
  }

  return (
    <Section 
      id="about" 
      className="bg-gradient-to-b from-white to-gray-50"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 mb-4">
          {content.title[language]}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          {content.subtitle[language]}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
        {/* Doctor Profile Image */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`order-1 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-green-200 to-green-100 rounded-2xl transform rotate-2" />
            <img
              src={heroAbout}
              alt={content.teamMember.name[language]}
              className="relative rounded-xl shadow-xl w-full max-w-md mx-auto object-cover aspect-[4/5]"
              loading="lazy"
            />
          </div>
        </motion.div>

        {/* Doctor Profile Content */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`order-2 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
                {content.teamMember.name[language]}
              </h3>
              <p className="text-lg text-green-600 font-medium mb-4">
                {content.teamMember.title[language]}
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                {content.teamMember.description[language]}
              </p>
              
              {/* Credentials */}
              <ul className="space-y-3">
                {content.teamMember.credentials.map((credential, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{credential[language]}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mb-12"
      >
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed italic">
          "{content.mission[language]}"
        </p>
      </motion.div>

      {/* Values Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.values.map((value, index) => {
          const IconComponent = iconMap[value.icon] || Heart;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <IconComponent className="w-7 h-7 text-green-700" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {value.title[language]}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description[language]}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
};

export default AboutSection;
