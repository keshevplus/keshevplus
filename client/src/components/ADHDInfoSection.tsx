import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Zap, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const ADHDInfoSection = () => {
  const { language } = useLanguage();

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
    <section id="adhd" className="py-20 bg-muted/30" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
            {language === 'he' ? 'מה זה ADHD?' : 'What is ADHD?'}
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full mb-8" />
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {language === 'he' 
              ? 'ADHD היא הפרעה נוירו-התפתחותית הפוגעת ביכולת הריכוז, הקשב והשליטה בדחפים. ההפרעה מתחילה בגיל הילדות ויכולה להמשיך עד לבגרות.'
              : 'ADHD is a neurodevelopmental disorder affecting concentration, attention and impulse control. The disorder begins in childhood and can continue into adulthood.'
            }
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {symptoms.map((symptom, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full text-center hover-lift shadow-elegant border-0 bg-background">
                <CardContent className="p-6">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <symptom.icon className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2">{symptom.title}</h3>
                  <p className="text-muted-foreground text-sm">{symptom.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gradient-primary rounded-3xl p-8 lg:p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-6">
            {language === 'he' ? 'זכרו - ADHD ניתן לטיפול!' : 'Remember - ADHD is treatable!'}
          </h3>
          <p className="text-primary-foreground/90 text-lg leading-relaxed max-w-3xl mx-auto">
            {language === 'he'
              ? 'עם האבחון הנכון והטיפול המתאים, ניתן לשפר משמעותית את איכות החיים ולהגיע להישגים גבוהים בכל תחומי החיים.'
              : 'With proper diagnosis and appropriate treatment, quality of life can be significantly improved and high achievements can be reached in all areas of life.'
            }
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ADHDInfoSection;