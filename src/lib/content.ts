/**
 * Content API Layer
 * 
 * Centralized content management for Keshev Plus.
 * In production, replace mock data with actual API calls to FastAPI backend.
 * All content is fetched dynamically - nothing hardcoded in components.
 */

import { useState, useEffect } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type Language = 'he' | 'en';

export interface LocalizedString {
  he: string;
  en: string;
}

export interface Service {
  id: string;
  icon: string;
  title: LocalizedString;
  description: LocalizedString;
  color: string;
}

export interface ProcessStep {
  id: string;
  step: number;
  title: LocalizedString;
  description: LocalizedString;
}

export interface ContactInfo {
  id: string;
  type: 'phone' | 'email' | 'address' | 'hours';
  value: string;
  label: LocalizedString;
}

export interface FAQItem {
  id: string;
  question: LocalizedString;
  answer: LocalizedString;
  category?: string;
}

export interface TeamMember {
  id: string;
  name: LocalizedString;
  title: LocalizedString;
  description: LocalizedString;
  image: string;
  credentials: LocalizedString[];
}

export interface AboutContent {
  title: LocalizedString;
  subtitle: LocalizedString;
  description: LocalizedString;
  mission: LocalizedString;
  values: Array<{
    icon: string;
    title: LocalizedString;
    description: LocalizedString;
  }>;
  teamMember: TeamMember;
}

// =============================================================================
// MOCK DATA - Exact content from keshevplus.co.il
// =============================================================================

const mockServices: Service[] = [
  {
    id: '1',
    icon: 'Brain',
    title: { 
      he: 'אבחון מקיף', 
      en: 'Comprehensive Diagnosis' 
    },
    description: { 
      he: 'אבחון מותאם אישית באמצעות כלים מתקדמים, ראיונות קליניים ומבחנים ממוחשבים', 
      en: 'Personalized diagnosis using advanced tools, clinical interviews, and computerized tests' 
    },
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: '2',
    icon: 'Pill',
    title: { 
      he: 'התאמת טיפול תרופתי', 
      en: 'Medication Adjustment' 
    },
    description: { 
      he: 'התאמת טיפול תרופתי אישי עם מעקב בטיחות מתמשך', 
      en: 'Personalized pharmacological treatment with ongoing safety monitoring' 
    },
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: '3',
    icon: 'Monitor',
    title: { 
      he: 'מבחן MOXO ממוחשב', 
      en: 'MOXO Computerized Test' 
    },
    description: { 
      he: 'הערכה אובייקטיבית של תפקודי הקשב והריכוז', 
      en: 'Objective assessment of attention and concentration functions' 
    },
    color: 'from-purple-500 to-violet-600'
  },
  {
    id: '4',
    icon: 'ClipboardList',
    title: { 
      he: 'ייעוץ ומעקב', 
      en: 'Consultation & Follow-up' 
    },
    description: { 
      he: 'תמיכה מקצועית מתמשכת ומעקב אחר הטיפול', 
      en: 'Continuous professional support and treatment monitoring' 
    },
    color: 'from-orange-500 to-amber-600'
  },
  {
    id: '5',
    icon: 'Users',
    title: { 
      he: 'הפניות לטיפולים משלימים', 
      en: 'Referrals to Complementary Treatments' 
    },
    description: { 
      he: 'הפניות לריפוי בעיסוק, טיפול רגשי ותמיכה פסיכולוגית', 
      en: 'Referrals to occupational therapy, emotional therapy, or psychological support' 
    },
    color: 'from-teal-500 to-cyan-600'
  }
];

const mockProcessSteps: ProcessStep[] = [
  { 
    id: '1', 
    step: 1, 
    title: { he: 'יצירת קשר', en: 'Contact' }, 
    description: { he: 'פנייה ראשונית טלפונית או באמצעות הטופס באתר', en: 'Initial contact by phone or through the website form' } 
  },
  { 
    id: '2', 
    step: 2, 
    title: { he: 'פגישת היכרות', en: 'Initial Consultation' }, 
    description: { he: 'שיחה ראשונית, איסוף היסטוריה רפואית ומילוי שאלונים', en: 'Initial interview, medical history collection, and questionnaire completion' } 
  },
  { 
    id: '3', 
    step: 3, 
    title: { he: 'אבחון מקיף', en: 'Comprehensive Assessment' }, 
    description: { he: 'ביצוע מבחנים ממוחשבים והערכה קלינית מעמיקה', en: 'Computerized testing and in-depth clinical evaluation' } 
  },
  { 
    id: '4', 
    step: 4, 
    title: { he: 'דוח ותוכנית טיפול', en: 'Report & Treatment Plan' }, 
    description: { he: 'קבלת דוח מפורט והמלצות לתוכנית טיפול אישית', en: 'Receive detailed report and personalized treatment recommendations' } 
  }
];

const mockContactInfo: ContactInfo[] = [
  { 
    id: '1', 
    type: 'phone', 
    value: '055-27-399-27', 
    label: { he: 'טלפון', en: 'Phone' } 
  },
  { 
    id: '2', 
    type: 'email', 
    value: 'dr@keshevplus.co.il', 
    label: { he: 'דוא"ל', en: 'Email' } 
  },
  { 
    id: '3', 
    type: 'address', 
    value: 'יגאל אלון 94, תל אביב (מגדלי אלון 1, קומה 12, משרד 1202)', 
    label: { he: 'כתובת', en: 'Address' } 
  },
  { 
    id: '4', 
    type: 'hours', 
    value: 'א\'-ה\' 09:00-19:00', 
    label: { he: 'שעות פעילות', en: 'Business Hours' } 
  }
];

const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: { he: 'מהו ADHD?', en: 'What is ADHD?' },
    answer: { 
      he: 'ADHD (הפרעת קשב וריכוז) היא הפרעה נוירו-התפתחותית המשפיעה על יכולת הריכוז, השליטה בדחפים וויסות הפעילות. היא נפוצה בילדים ומבוגרים כאחד ומשפיעה על תפקוד יומיומי, לימודים ועבודה.', 
      en: 'ADHD (Attention Deficit Hyperactivity Disorder) is a neurodevelopmental disorder affecting concentration, impulse control, and activity regulation. It is common in both children and adults and affects daily functioning, studies, and work.' 
    },
    category: 'general'
  },
  {
    id: '2',
    question: { he: 'כמה זמן לוקח תהליך האבחון?', en: 'How long does the diagnosis process take?' },
    answer: { 
      he: 'תהליך האבחון המלא כולל מספר פגישות ואורך בממוצע 2-4 שבועות. התהליך כולל ריאיון קליני מעמיק, מבחנים ממוחשבים (MOXO), שאלונים ובדיקת מסמכים רפואיים רלוונטיים.', 
      en: 'The full diagnosis process includes several sessions and takes an average of 2-4 weeks. It includes an in-depth clinical interview, computerized tests (MOXO), questionnaires, and review of relevant medical documents.' 
    },
    category: 'process'
  },
  {
    id: '3',
    question: { he: 'האם האבחון מתאים לכל הגילאים?', en: 'Is the diagnosis suitable for all ages?' },
    answer: { 
      he: 'כן, אנו מספקים אבחון מקצועי לילדים מגיל 6, בני נוער ומבוגרים. לכל קבוצת גיל יש פרוטוקול אבחון מותאם המתחשב במאפיינים הייחודיים של אותו גיל.', 
      en: 'Yes, we provide professional diagnosis for children from age 6, teenagers, and adults. Each age group has a tailored assessment protocol that considers the unique characteristics of that age.' 
    },
    category: 'general'
  },
  {
    id: '4',
    question: { he: 'מה כלול בתוכנית הטיפול?', en: 'What is included in the treatment plan?' },
    answer: { 
      he: 'תוכנית הטיפול מותאמת אישית וכוללת: המלצות לטיפול תרופתי (במידת הצורך), הדרכת הורים, כלים מעשיים להתמודדות יומיומית, הפניות לטיפולים משלימים ומעקב מתמשך.', 
      en: 'The treatment plan is personalized and includes: medication recommendations (if needed), parent guidance, practical daily coping tools, referrals to complementary treatments, and ongoing follow-up.' 
    },
    category: 'treatment'
  },
  {
    id: '5',
    question: { he: 'האם יש צורך בהפניה מרופא?', en: 'Is a doctor\'s referral required?' },
    answer: { 
      he: 'לא, אין צורך בהפניה. ניתן לפנות ישירות למרפאה לקביעת תור לאבחון. עם זאת, אם יש מסמכים רפואיים קודמים, מומלץ להביא אותם לפגישה הראשונה.', 
      en: 'No, a referral is not required. You can contact the clinic directly to schedule a diagnosis appointment. However, if you have previous medical documents, it is recommended to bring them to the first meeting.' 
    },
    category: 'process'
  },
  {
    id: '6',
    question: { he: 'מה ההבדל בין ADD ל-ADHD?', en: 'What is the difference between ADD and ADHD?' },
    answer: { 
      he: 'ADD הוא המונח הישן להפרעת קשב ללא היפראקטיביות. כיום משתמשים במונח ADHD עם שלושה תת-סוגים: חוסר קשב בעיקר, היפראקטיביות-אימפולסיביות בעיקר, או משולב.', 
      en: 'ADD is the old term for attention deficit without hyperactivity. Today, the term ADHD is used with three subtypes: predominantly inattentive, predominantly hyperactive-impulsive, or combined.' 
    },
    category: 'general'
  }
];

const mockAboutContent: AboutContent = {
  title: { he: 'אודותינו', en: 'About Us' },
  subtitle: { he: 'מומחים באבחון וטיפול בהפרעות קשב וריכוז', en: 'Specialists in ADHD Diagnosis and Treatment' },
  description: { 
    he: 'מרפאת "קשב פלוס" מתמחה באבחון וטיפול בהפרעות קשב וריכוז (ADHD) בכל הגילאים. אנו מאמינים בגישה מקצועית, אישית ומכבדת לכל מטופל.', 
    en: 'Keshev Plus clinic specializes in diagnosis and treatment of ADHD at all ages. We believe in a professional, personalized, and respectful approach for every patient.' 
  },
  mission: {
    he: 'המשימה שלנו היא לספק אבחון מדויק ותוכניות טיפול מותאמות אישית, המאפשרים למטופלים שלנו להגיע למיצוי הפוטנציאל האישי שלהם.',
    en: 'Our mission is to provide accurate diagnosis and personalized treatment plans, enabling our patients to reach their full personal potential.'
  },
  values: [
    {
      icon: 'Heart',
      title: { he: 'יחס אישי', en: 'Personal Approach' },
      description: { he: 'כל מטופל מקבל יחס אישי ומותאם לצרכיו הייחודיים', en: 'Every patient receives personalized attention tailored to their unique needs' }
    },
    {
      icon: 'Award',
      title: { he: 'מקצועיות', en: 'Professionalism' },
      description: { he: 'צוות מומחים עם ניסיון רב ועדכון מתמיד', en: 'Expert team with extensive experience and continuous updates' }
    },
    {
      icon: 'Shield',
      title: { he: 'דיסקרטיות', en: 'Discretion' },
      description: { he: 'שמירה על פרטיות מלאה וסביבה בטוחה', en: 'Complete privacy protection and safe environment' }
    }
  ],
  teamMember: {
    id: '1',
    name: { he: 'ד"ר איירין כוכב-רייפמן', en: 'Dr. Irene Kochav-Reifman' },
    title: { he: 'רופאה מומחית', en: 'Specialist Physician' },
    description: { 
      he: 'בעלת ניסיון עשיר באבחון של ילדים, מתבגרים ובוגרים. ליוותה מטופלים רבים במסע להגשמה אישית ותפקוד מיטבי.', 
      en: 'Extensive experience in diagnosing children, adolescents, and adults. Has accompanied many patients on their journey to personal fulfillment and optimal functioning.' 
    },
    image: '/src/assets/hero-about.jpg',
    credentials: [
      { he: 'מומחית באבחון וטיפול ב-ADHD', en: 'ADHD Diagnosis and Treatment Specialist' },
      { he: 'ניסיון של למעלה מ-15 שנה', en: 'Over 15 years of experience' },
      { he: 'התמחות בילדים, נוער ומבוגרים', en: 'Specialization in children, teens, and adults' }
    ]
  }
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

export const contentApi = {
  async getServices(): Promise<Service[]> {
    // TODO: Replace with: GET /api/services
    return mockServices;
  },

  async getProcessSteps(): Promise<ProcessStep[]> {
    // TODO: Replace with: GET /api/process-steps
    return mockProcessSteps;
  },

  async getContactInfo(): Promise<ContactInfo[]> {
    // TODO: Replace with: GET /api/contact-info
    return mockContactInfo;
  },

  async getFAQs(): Promise<FAQItem[]> {
    // TODO: Replace with: GET /api/faqs
    return mockFAQs;
  },

  async getAboutContent(): Promise<AboutContent> {
    // TODO: Replace with: GET /api/about
    return mockAboutContent;
  },

  async submitContactForm(data: {
    name: string;
    phone: string;
    email?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    // TODO: Replace with: POST /api/contact
    try {
      console.log('Submitting contact form:', data);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Form submitted successfully' };
    } catch (error) {
      console.error('Contact form error:', error);
      return { success: false, message: 'Failed to submit form' };
    }
  }
};

// =============================================================================
// HOOKS
// =============================================================================

export function useContent<T>(
  fetcher: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetcher();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error };
}
