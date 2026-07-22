import type { HomeSectionType } from "@shared/schema";

export interface LegacyField {
  key: string;
  labelHe: string;
  labelEn: string;
  multiline?: boolean;
}

export interface LegacyImageSlot {
  slot: string;
  labelHe: string;
  labelEn: string;
}

export interface LegacySectionConfig {
  domId: string;
  fields: LegacyField[];
  images?: LegacyImageSlot[];
}

// The hero isn't a HomeSection - it's rendered unconditionally above the
// sections.map() loop on both keshevplus.com and keshev-web, so it can't be
// hidden, reordered, or removed like the entries below. Kept as its own
// standalone field list (same shared hero.* keys both sites read) rather
// than forcing it into the HomeSectionType/LEGACY_SECTION_TYPES union.
export const HERO_SECTION_CONFIG: LegacySectionConfig = {
  domId: "home",
  images: [{ slot: "hero.image", labelHe: "תמונת הרופאה", labelEn: "Doctor photo" }],
  fields: [
    { key: "hero.welcome_line1", labelHe: "שורת פתיחה 1", labelEn: "Welcome line 1" },
    { key: "hero.welcome_line2", labelHe: "שורת פתיחה 2", labelEn: "Welcome line 2" },
    { key: "hero.clinic_description", labelHe: "תיאור המרפאה", labelEn: "Clinic description", multiline: true },
    { key: "hero.accurate_diagnosis", labelHe: "שורת אבחון מדויק", labelEn: "Accurate diagnosis line" },
    { key: "hero.personal_plan", labelHe: "שורת תוכנית טיפול", labelEn: "Personal plan line" },
    { key: "hero.typing_children", labelHe: "קהל יעד 1 (ילדים)", labelEn: "Audience 1 (children)" },
    { key: "hero.typing_teens", labelHe: "קהל יעד 2 (נוער)", labelEn: "Audience 2 (teens)" },
    { key: "hero.typing_adults", labelHe: "קהל יעד 3 (מבוגרים)", labelEn: "Audience 3 (adults)" },
    { key: "hero.contact_us_now", labelHe: "טקסט כפתור ראשי", labelEn: "Primary button text" },
    { key: "hero.read_about_us", labelHe: "טקסט כפתור משני", labelEn: "Secondary button text" },
    { key: "hero.doctor_alt", labelHe: "טקסט חלופי לתמונת הרופאה", labelEn: "Doctor photo alt text" },
  ],
};

// Declarative maps of every editable visible string (and image) each
// built-in/legacy homepage section actually renders, so the admin Sections
// tab can offer direct inline editing instead of pointing to the
// Translations/Visual Editor tabs. Deliberately excludes screen-reader-only
// aria-label/title strings that have no visible on-page effect.
export const LEGACY_SECTION_CONFIG: Partial<Record<HomeSectionType, LegacySectionConfig>> = {
  "legacy:about": {
    domId: "about",
    images: [{ slot: "about.photo", labelHe: "תמונת הרופאה", labelEn: "Doctor photo" }],
    fields: [
      { key: "about.title", labelHe: "כותרת", labelEn: "Heading" },
      { key: "about.subtitle", labelHe: "כותרת משנה", labelEn: "Subtitle" },
      { key: "about.doctor_name", labelHe: "שם הרופאה", labelEn: "Doctor name" },
      { key: "about.doctor_title", labelHe: "תפקיד", labelEn: "Doctor title" },
      { key: "about.doctor_desc", labelHe: "תיאור", labelEn: "Doctor description", multiline: true },
      { key: "about.doctor_alt", labelHe: "טקסט חלופי לתמונה", labelEn: "Photo alt text" },
      { key: "about.mission", labelHe: "משימה", labelEn: "Mission statement", multiline: true },
      { key: "about.value1_title", labelHe: "ערך 1 - כותרת", labelEn: "Value 1 - title" },
      { key: "about.value1_desc", labelHe: "ערך 1 - תיאור", labelEn: "Value 1 - description", multiline: true },
      { key: "about.value2_title", labelHe: "ערך 2 - כותרת", labelEn: "Value 2 - title" },
      { key: "about.value2_desc", labelHe: "ערך 2 - תיאור", labelEn: "Value 2 - description", multiline: true },
      { key: "about.value3_title", labelHe: "ערך 3 - כותרת", labelEn: "Value 3 - title" },
      { key: "about.value3_desc", labelHe: "ערך 3 - תיאור", labelEn: "Value 3 - description", multiline: true },
      { key: "about.credential1", labelHe: "הסמכה 1", labelEn: "Credential 1" },
      { key: "about.credential2", labelHe: "הסמכה 2", labelEn: "Credential 2" },
      { key: "about.credential3", labelHe: "הסמכה 3", labelEn: "Credential 3" },
    ],
  },
  "legacy:services": {
    domId: "services",
    fields: [
      { key: "services.title", labelHe: "כותרת", labelEn: "Heading" },
      { key: "services.subtitle", labelHe: "כותרת משנה", labelEn: "Subtitle" },
      { key: "services.service1_title", labelHe: "שירות 1 - כותרת", labelEn: "Service 1 - title" },
      { key: "services.service1_desc", labelHe: "שירות 1 - תיאור", labelEn: "Service 1 - description", multiline: true },
      { key: "services.service2_title", labelHe: "שירות 2 - כותרת", labelEn: "Service 2 - title" },
      { key: "services.service2_desc", labelHe: "שירות 2 - תיאור", labelEn: "Service 2 - description", multiline: true },
      { key: "services.service3_title", labelHe: "שירות 3 - כותרת", labelEn: "Service 3 - title" },
      { key: "services.service3_desc", labelHe: "שירות 3 - תיאור", labelEn: "Service 3 - description", multiline: true },
      { key: "services.service4_title", labelHe: "שירות 4 - כותרת", labelEn: "Service 4 - title" },
      { key: "services.service4_desc", labelHe: "שירות 4 - תיאור", labelEn: "Service 4 - description", multiline: true },
      { key: "services.service5_title", labelHe: "שירות 5 - כותרת", labelEn: "Service 5 - title" },
      { key: "services.service5_desc", labelHe: "שירות 5 - תיאור", labelEn: "Service 5 - description", multiline: true },
      { key: "nav.process", labelHe: "כותרת תהליך העבודה", labelEn: "Process section heading" },
      { key: "services.step1_title", labelHe: "שלב 1 - כותרת", labelEn: "Step 1 - title" },
      { key: "services.step1_desc", labelHe: "שלב 1 - תיאור", labelEn: "Step 1 - description", multiline: true },
      { key: "services.step2_title", labelHe: "שלב 2 - כותרת", labelEn: "Step 2 - title" },
      { key: "services.step2_desc", labelHe: "שלב 2 - תיאור", labelEn: "Step 2 - description", multiline: true },
      { key: "services.step3_title", labelHe: "שלב 3 - כותרת", labelEn: "Step 3 - title" },
      { key: "services.step3_desc", labelHe: "שלב 3 - תיאור", labelEn: "Step 3 - description", multiline: true },
      { key: "services.step4_title", labelHe: "שלב 4 - כותרת", labelEn: "Step 4 - title" },
      { key: "services.step4_desc", labelHe: "שלב 4 - תיאור", labelEn: "Step 4 - description", multiline: true },
    ],
  },
  "legacy:adhdInfo": {
    domId: "adhd",
    fields: [
      { key: "nav.adhd", labelHe: "כותרת", labelEn: "Heading" },
      { key: "adhd.subtitle", labelHe: "כותרת משנה", labelEn: "Subtitle" },
      { key: "adhd.definition_title", labelHe: "כותרת הגדרה", labelEn: "Definition title" },
      { key: "adhd.definition_subtitle", labelHe: "כותרת משנה להגדרה", labelEn: "Definition subtitle" },
      { key: "adhd.symptoms_title", labelHe: "כותרת תסמינים", labelEn: "Symptoms title" },
      { key: "adhd.symptoms_subtitle", labelHe: "כותרת משנה לתסמינים", labelEn: "Symptoms subtitle" },
      { key: "adhd.symptom1_title", labelHe: "תסמין 1 - כותרת", labelEn: "Symptom 1 - title" },
      { key: "adhd.symptom1_desc", labelHe: "תסמין 1 - תיאור", labelEn: "Symptom 1 - description", multiline: true },
      { key: "adhd.symptom2_title", labelHe: "תסמין 2 - כותרת", labelEn: "Symptom 2 - title" },
      { key: "adhd.symptom2_desc", labelHe: "תסמין 2 - תיאור", labelEn: "Symptom 2 - description", multiline: true },
      { key: "adhd.symptom3_title", labelHe: "תסמין 3 - כותרת", labelEn: "Symptom 3 - title" },
      { key: "adhd.symptom3_desc", labelHe: "תסמין 3 - תיאור", labelEn: "Symptom 3 - description", multiline: true },
      { key: "adhd.treatable_title", labelHe: "ניתן לטיפול - כותרת", labelEn: "Treatable - title" },
      { key: "adhd.treatable_desc", labelHe: "ניתן לטיפול - תיאור", labelEn: "Treatable - description", multiline: true },
      { key: "adhd.symptom4_title", labelHe: "כרטיס 4 - כותרת", labelEn: "Card 4 - title" },
      { key: "adhd.symptom4_desc", labelHe: "כרטיס 4 - תיאור", labelEn: "Card 4 - description", multiline: true },
      { key: "adhd.early_title", labelHe: "גילוי מוקדם - כותרת", labelEn: "Early detection - title" },
      { key: "adhd.early_desc", labelHe: "גילוי מוקדם - תיאור", labelEn: "Early detection - description", multiline: true },
      { key: "faq.title", labelHe: "כותרת שאלות נפוצות", labelEn: "FAQ heading" },
      { key: "faq.subtitle", labelHe: "כותרת משנה לשאלות נפוצות", labelEn: "FAQ subtitle" },
      { key: "faq.q1", labelHe: "שאלה 1", labelEn: "Question 1" },
      { key: "faq.a1", labelHe: "תשובה 1", labelEn: "Answer 1", multiline: true },
      { key: "faq.q2", labelHe: "שאלה 2", labelEn: "Question 2" },
      { key: "faq.a2", labelHe: "תשובה 2", labelEn: "Answer 2", multiline: true },
      { key: "faq.q3", labelHe: "שאלה 3", labelEn: "Question 3" },
      { key: "faq.a3", labelHe: "תשובה 3", labelEn: "Answer 3", multiline: true },
      { key: "faq.q4", labelHe: "שאלה 4", labelEn: "Question 4" },
      { key: "faq.a4", labelHe: "תשובה 4", labelEn: "Answer 4", multiline: true },
      { key: "faq.q5", labelHe: "שאלה 5", labelEn: "Question 5" },
      { key: "faq.a5", labelHe: "תשובה 5", labelEn: "Answer 5", multiline: true },
      { key: "faq.q6", labelHe: "שאלה 6", labelEn: "Question 6" },
      { key: "faq.a6", labelHe: "תשובה 6", labelEn: "Answer 6", multiline: true },
      { key: "faq.no_answer", labelHe: "טקסט קישור ליצירת קשר", labelEn: "\"Still have questions\" link text" },
    ],
  },
  "legacy:questionnaires": {
    domId: "questionnaires",
    fields: [
      { key: "questionnaires.title", labelHe: "כותרת", labelEn: "Heading" },
      { key: "questionnaires.subtitle", labelHe: "כותרת משנה", labelEn: "Subtitle" },
      { key: "questionnaires.parent_form", labelHe: "שאלון הורים - שם", labelEn: "Parent form - name" },
      { key: "questionnaires.parent_form_desc", labelHe: "שאלון הורים - תיאור", labelEn: "Parent form - description", multiline: true },
      { key: "questionnaires.teacher_form", labelHe: "שאלון מורים - שם", labelEn: "Teacher form - name" },
      { key: "questionnaires.teacher_form_desc", labelHe: "שאלון מורים - תיאור", labelEn: "Teacher form - description", multiline: true },
      { key: "questionnaires.self_report", labelHe: "שאלון עצמי - שם", labelEn: "Self-report form - name" },
      { key: "questionnaires.self_report_desc", labelHe: "שאלון עצמי - תיאור", labelEn: "Self-report form - description", multiline: true },
      { key: "questionnaires.fill_online", labelHe: "טקסט כפתור מילוי מקוון", labelEn: "\"Fill online\" button text" },
      { key: "questionnaires.download_files", labelHe: "טקסט הורדת קבצים", labelEn: "\"Download files\" label" },
      { key: "questionnaires.note", labelHe: "הערה תחתונה", labelEn: "Bottom note", multiline: true },
    ],
  },
  "legacy:contact": {
    domId: "contact",
    fields: [
      { key: "contact.subtitle", labelHe: "כותרת משנה", labelEn: "Subtitle" },
      { key: "contact.click_to_open_form", labelHe: "טקסט מעל הטופס", labelEn: "Text above the form" },
      { key: "contact.name_placeholder", labelHe: "placeholder שם", labelEn: "Name placeholder" },
      { key: "contact.phone_placeholder", labelHe: "placeholder טלפון", labelEn: "Phone placeholder" },
      { key: "contact.email_optional", labelHe: "placeholder אימייל", labelEn: "Email placeholder" },
      { key: "contact.message_placeholder", labelHe: "placeholder הודעה", labelEn: "Message placeholder" },
      { key: "contact.send_message", labelHe: "טקסט כפתור שליחה", labelEn: "Send button text" },
      { key: "contact.details_title", labelHe: "כותרת פרטי קשר", labelEn: "Contact details heading" },
      { key: "contact.address_label", labelHe: "תווית כתובת", labelEn: "Address label" },
      { key: "contact.address_line1", labelHe: "שורת כתובת 1", labelEn: "Address line 1" },
      { key: "contact.address_line2", labelHe: "שורת כתובת 2", labelEn: "Address line 2" },
      { key: "contact.email_label", labelHe: "תווית אימייל", labelEn: "Email label" },
      { key: "contact.phone_label", labelHe: "תווית טלפון", labelEn: "Phone label" },
      { key: "contact.directions_title", labelHe: "כותרת הוראות הגעה", labelEn: "Directions heading" },
      { key: "contact.navigate_waze", labelHe: "כפתור Waze", labelEn: "Waze button text" },
      { key: "contact.navigate_google_maps", labelHe: "כפתור Google Maps", labelEn: "Google Maps button text" },
    ],
  },
};
