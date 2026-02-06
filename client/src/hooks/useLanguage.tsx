import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: 'he' | 'en';
  setLanguage: (lang: 'he' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  he: {
    // Navigation
    'nav.about': 'אודותינו',
    'nav.services': 'שירותים',
    'nav.adhd': 'מה זה ADHD?',
    'nav.process': 'תהליך האבחון',
    'nav.faq': 'שאלות נפוצות',
    'nav.contact': 'יצירת קשר',
    
    // Hero Section
    'hero.title': 'ברוכים הבאים למרפאת',
    'hero.clinic': '"קשב פלוס"',
    'hero.subtitle': 'בילדים • בבני נוער • במבוגרים',
    'hero.description': 'ב"קשב פלוס" תקבלו אבחון מדויק\nותוכנית טיפול אישית',
    'hero.step': 'הצעד הראשון מתחיל כאן',
    'hero.consultation': 'קבעו פגישת ייעוץ - בואו לגלות את הדרך להצלחה',
    'hero.read_more': 'קראו עוד עלינו',
    'hero.start_diagnosis': 'התחל/י את האבחון עכשיו',
    'hero.ready_title': 'מוכנים להתחיל?',
    'hero.ready_text': 'פנה/י אלינו היום כדי לקבוע את האבחון שלך ולקחת את הצעד הראשון\nלקראת חיים טובים יותר.',
    'hero.contact_now': 'צרו קשר עכשיו',
    
    // About Section
    'about.title': 'אודותינו',
    'about.subtitle': 'מומחים באבחון וטיפול ב-ADHD',
    'about.text': 'אנו מתמחים באבחון וטיפול ב-ADHD בכל הגילאים. הצוות שלנו מורכב מרופאים ופסיכולוגים מומחים עם ניסיון רב בתחום.',
    
    // Services Section
    'services.title': 'השירותים שלנו',
    'services.diagnosis': 'אבחון ADHD',
    'services.diagnosis_desc': 'אבחון מקצועי ומדויק לילדים, בני נוער ומבוגרים',
    'services.treatment': 'תוכנית טיפול',
    'services.treatment_desc': 'תוכנית טיפול אישית המותאמת לצרכים הייחודיים',
    'services.counseling': 'ייעוץ למשפחות',
    'services.counseling_desc': 'הדרכה ותמיכה למשפחות והקרובים',
    
    // Contact Section
    'contact.title': 'צרו קשר',
    'contact.phone': '055-27-399-27',
    'contact.email': 'info@keshevplus.co.il',
    'contact.address': 'תל אביב, ישראל',
    
    // Footer
    'footer.rights': '© 2025 כל הזכויות שמורות לקשב פלוס'
  },
  en: {
    // Navigation
    'nav.about': 'About Us',
    'nav.services': 'Services',
    'nav.adhd': 'What is ADHD?',
    'nav.process': 'Diagnosis Process',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'Welcome to',
    'hero.clinic': '"Keshev Plus" Clinic',
    'hero.subtitle': 'Children • Teens • Adults',
    'hero.description': 'At "Keshev Plus" you will receive accurate diagnosis\nand personalized treatment plan',
    'hero.step': 'The first step starts here',
    'hero.consultation': 'Schedule a consultation - discover the path to success',
    'hero.read_more': 'Read More About Us',
    'hero.start_diagnosis': 'Start Diagnosis Now',
    'hero.ready_title': 'Ready to Begin?',
    'hero.ready_text': 'Contact us today to schedule your diagnosis and take the first step\ntowards a better life.',
    'hero.contact_now': 'Contact Us Now',
    
    // About Section
    'about.title': 'About Us',
    'about.subtitle': 'ADHD Diagnosis & Treatment Specialists',
    'about.text': 'We specialize in ADHD diagnosis and treatment for all ages. Our team consists of expert doctors and psychologists with extensive experience in the field.',
    
    // Services Section
    'services.title': 'Our Services',
    'services.diagnosis': 'ADHD Diagnosis',
    'services.diagnosis_desc': 'Professional and accurate diagnosis for children, teens and adults',
    'services.treatment': 'Treatment Plan',
    'services.treatment_desc': 'Personalized treatment plan tailored to unique needs',
    'services.counseling': 'Family Counseling',
    'services.counseling_desc': 'Guidance and support for families and loved ones',
    
    // Contact Section
    'contact.title': 'Contact Us',
    'contact.phone': '055-27-399-27',
    'contact.email': 'info@keshevplus.co.il',
    'contact.address': 'Tel Aviv, Israel',
    
    // Footer
    'footer.rights': '© 2025 All rights reserved to Keshev Plus'
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'he' | 'en'>('he');

  useEffect(() => {
    const saved = localStorage.getItem('language') as 'he' | 'en';
    if (saved) setLanguage(saved);
  }, []);

  const handleSetLanguage = (lang: 'he' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};