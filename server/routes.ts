import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, languageSettingsSchema, upsertTranslationSchema, bulkUpsertTranslationsSchema, SUPPORTED_LANGUAGES, QUESTIONNAIRE_TYPES, insertQuestionnaireSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

import en from "../client/src/i18n/locales/en";
import he from "../client/src/i18n/locales/he";
import fr from "../client/src/i18n/locales/fr";
import es from "../client/src/i18n/locales/es";
import de from "../client/src/i18n/locales/de";
import ru from "../client/src/i18n/locales/ru";
import am from "../client/src/i18n/locales/am";
import ar from "../client/src/i18n/locales/ar";
import yi from "../client/src/i18n/locales/yi";

const additionalTranslations: Record<string, Record<string, string>> = {
  he: {
    "hero.welcome_line1": "ברוכים הבאים למרפאת",
    "hero.welcome_line2": '"קשב פלוס"',
    "hero.clinic_description": "מרפאה לאבחון וטיפול של הפרעות קשב וריכוז",
    "hero.typing_children": "בילדים",
    "hero.typing_teens": "בבני נוער",
    "hero.typing_adults": "במבוגרים",
    "hero.accurate_diagnosis": 'ב"קשב פלוס" תקבלו אבחון מדויק',
    "hero.personal_plan": "ותוכנית טיפול אישית",
    "hero.first_step": "הצעד הראשון מתחיל כאן",
    "hero.schedule_consultation": "קבעו פגישת ייעוץ - בואו לגלות את הדרך להצלחה",
    "hero.start_now": "התחל/י את האבחון עכשיו",
    "hero.read_about_us": "קראו עוד עלינו",
    "hero.ready_to_start": "מוכנים להתחיל?",
    "hero.ready_description": "פנה/י אלינו היום כדי לקבוע את האבחון שלך ולקחת את הצעד הראשון לקראת חיים טובים יותר.",
    "hero.contact_us_now": "צרו קשר עכשיו",
    "hero.doctor_alt": "רופאה מומחית באבחון ADHD",
    "nav.skip_to_content": "דלג לתוכן הראשי",
    "nav.main_navigation": "ניווט ראשי",
    "nav.go_home": "חזרה לדף הבית",
    "nav.call_us": "התקשרו אלינו: 055-27-399-27",
    "nav.close_menu": "סגור תפריט",
    "nav.open_menu": "פתח תפריט",
    "contact.subtitle": "השאירו פרטים ונחזור אליכם בהקדם האפשרי",
    "contact.leave_details": "השאירו פרטים",
    "contact.full_name": "שם מלא",
    "contact.phone_label": "טלפון",
    "contact.email_optional": 'דוא"ל (אופציונלי)',
    "contact.message": "הודעה",
    "contact.name_placeholder": "הכניסו את שמכם המלא",
    "contact.message_placeholder": "ספרו לנו במה נוכל לעזור...",
    "contact.sending": "שולח...",
    "contact.send_message": "שליחת הודעה",
    "contact.success_title": "הודעה נשלחה בהצלחה!",
    "contact.success_desc": "נחזור אליכם בהקדם",
    "contact.error_title": "שגיאה בשליחה",
    "contact.error_desc": "אנא נסו שוב",
    "contact.thank_you": "תודה שפניתם אלינו!",
    "contact.will_reply": "נחזור אליכם בהקדם האפשרי",
    "contact.send_another": "שליחת הודעה נוספת",
    "contact.privacy_note": "המידע שלכם מאובטח ולא ישותף עם צדדים שלישיים",
    "contact.call_now": "התקשרו עכשיו",
    "contact.whatsapp": "שלחו הודעה בוואטסאפ",
    "contact.whatsapp_message": "שלום, אשמח לקבל מידע על אבחון ADHD",
    "contact.directions": "דרכי הגעה ואפשרויות חניה",
    "contact.directions_desc": "מידע על הגעה למרפאה וחניה באזור",
    "contact.clinic_address": "כתובת המרפאה",
    "contact.address_line1": "יגאל אלון 94, תל אביב",
    "contact.address_line2": "מגדלי אלון 1, קומה 12, משרד 1202",
    "contact.parking_title": "חניה",
    "contact.parking_desc": "ישנה חניה חינמית ברחוב ובסביבה. מומלץ להגיע מספר דקות לפני הפגישה לצורך מציאת חניה.",
    "contact.transport_title": "תחבורה ציבורית",
    "contact.transport_desc": "המרפאה נמצאת במרחק הליכה קצר מתחנת הרכבת באר שבע מרכז. קווי אוטובוס רבים עוברים בסמוך.",
    "footer.clinic_desc": "מרפאה מובילה לאבחון וטיפול בהפרעות קשב וריכוז בילדים, בני נוער ומבוגרים.",
    "footer.quick_links": "ניווט מהיר",
    "footer.contact_info": "פרטי התקשרות",
    "footer.follow_us": "עקבו אחרינו",
    "footer.privacy_policy": "מדיניות פרטיות",
    "footer.terms_of_use": "תנאי שימוש",
    "footer.address": "יגאל אלון 94, תל אביב",
    "footer.hours": "א'-ה' 09:00-19:00",
  },
  en: {
    "hero.welcome_line1": "Welcome to",
    "hero.welcome_line2": '"Keshev Plus" Clinic',
    "hero.clinic_description": "Clinic for Diagnosis and Treatment of ADHD",
    "hero.typing_children": "in Children",
    "hero.typing_teens": "in Teens",
    "hero.typing_adults": "in Adults",
    "hero.accurate_diagnosis": 'At "Keshev Plus" you will receive accurate diagnosis',
    "hero.personal_plan": "and a personalized treatment plan",
    "hero.first_step": "The first step starts here",
    "hero.schedule_consultation": "Schedule a consultation - discover the path to success",
    "hero.start_now": "Start Diagnosis Now",
    "hero.read_about_us": "Read More About Us",
    "hero.ready_to_start": "Ready to Start?",
    "hero.ready_description": "Contact us today to schedule your diagnosis and take the first step towards a better life.",
    "hero.contact_us_now": "Contact Us Now",
    "hero.doctor_alt": "Expert ADHD specialist doctor",
    "nav.skip_to_content": "Skip to main content",
    "nav.main_navigation": "Main navigation",
    "nav.go_home": "Go to homepage",
    "nav.call_us": "Call us: 055-27-399-27",
    "nav.close_menu": "Close menu",
    "nav.open_menu": "Open menu",
    "contact.subtitle": "Leave your details and we'll get back to you as soon as possible",
    "contact.leave_details": "Leave Your Details",
    "contact.full_name": "Full Name",
    "contact.phone_label": "Phone",
    "contact.email_optional": "Email (optional)",
    "contact.message": "Message",
    "contact.name_placeholder": "Enter your full name",
    "contact.message_placeholder": "Tell us how we can help...",
    "contact.sending": "Sending...",
    "contact.send_message": "Send Message",
    "contact.success_title": "Message sent successfully!",
    "contact.success_desc": "We'll get back to you soon",
    "contact.error_title": "Error sending message",
    "contact.error_desc": "Please try again",
    "contact.thank_you": "Thank you for contacting us!",
    "contact.will_reply": "We'll get back to you as soon as possible",
    "contact.send_another": "Send another message",
    "contact.privacy_note": "Your information is secure and will not be shared with third parties",
    "contact.call_now": "Call Now",
    "contact.whatsapp": "Message on WhatsApp",
    "contact.whatsapp_message": "Hello, I would like information about ADHD diagnosis",
    "contact.directions": "Directions & Parking",
    "contact.directions_desc": "Information about arriving at the clinic and parking nearby",
    "contact.clinic_address": "Clinic Address",
    "contact.address_line1": "94 Yigal Alon St., Tel Aviv",
    "contact.address_line2": "Alon Towers 1, Floor 12, Office 1202",
    "contact.parking_title": "Parking",
    "contact.parking_desc": "Free street parking is available in the area. We recommend arriving a few minutes early to find parking.",
    "contact.transport_title": "Public Transport",
    "contact.transport_desc": "The clinic is a short walk from Beer Sheva Central train station. Multiple bus lines pass nearby.",
    "footer.clinic_desc": "Leading clinic for ADHD diagnosis and treatment in children, teens, and adults.",
    "footer.quick_links": "Quick Links",
    "footer.contact_info": "Contact Info",
    "footer.follow_us": "Follow Us",
    "footer.privacy_policy": "Privacy Policy",
    "footer.terms_of_use": "Terms of Use",
    "footer.address": "94 Yigal Alon St., Tel Aviv",
    "footer.hours": "Sun-Thu 09:00-19:00",
  },
};

const DEFAULT_LANGUAGE_SETTINGS = {
  enabled: false,
  mode: "bilingual" as const,
  defaultLanguage: "he",
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const result = insertContactSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error.message });
      }
      
      // Save to database (admin dashboard fallback)
      await storage.createContact(result.data);

      // Attempt to send email
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER || 'pluskeshev@gmail.com',
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: result.data.email || 'pluskeshev@gmail.com',
          to: 'pluskeshev@gmail.com',
          subject: `פנייה חדשה מהאתר - ${result.data.name}`,
          text: `
            שם: ${result.data.name}
            טלפון: ${result.data.phone}
            אימייל: ${result.data.email || 'לא צויין'}
            הודעה: ${result.data.message}
          `
        };

        if (process.env.EMAIL_PASS) {
          await transporter.sendMail(mailOptions);
        } else {
          console.warn("EMAIL_PASS not set, skipping email delivery");
        }
      } catch (emailError) {
        console.error("Email delivery failed, message saved to DB:", emailError);
      }

      return res.json({ success: true, message: "Form submitted successfully" });
    } catch (error) {
      console.error("Contact form error:", error);
      return res.status(500).json({ success: false, message: "Failed to submit form" });
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      return res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.patch("/api/contacts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.markContactRead(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      return res.json(contact);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.get("/api/settings/language", async (_req, res) => {
    try {
      const setting = await storage.getSetting("language");
      if (setting) {
        return res.json(setting.value);
      }
      return res.json(DEFAULT_LANGUAGE_SETTINGS);
    } catch (error) {
      console.error("Error fetching language settings:", error);
      return res.json(DEFAULT_LANGUAGE_SETTINGS);
    }
  });

  app.put("/api/settings/language", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const result = languageSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }

      const setting = await storage.upsertSetting("language", result.data);
      return res.json(setting.value);
    } catch (error) {
      console.error("Error saving language settings:", error);
      return res.status(500).json({ error: "Failed to save settings" });
    }
  });

  app.post("/api/firecrawl-scrape", async (req, res) => {
    try {
      const { url, options } = req.body;

      if (!url) {
        return res.status(400).json({ success: false, error: "URL is required" });
      }

      const apiKey = process.env.FIRECRAWL_API_KEY;
      if (!apiKey) {
        console.error("FIRECRAWL_API_KEY not configured");
        return res.status(500).json({ success: false, error: "Firecrawl connector not configured" });
      }

      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = `https://${formattedUrl}`;
      }

      console.log("Scraping URL:", formattedUrl);

      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: options?.formats || ["markdown", "html", "screenshot", "links"],
          onlyMainContent: options?.onlyMainContent ?? false,
          waitFor: options?.waitFor || 2000,
          location: options?.location,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error("Firecrawl API error:", data);
        return res.status(response.status).json({
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        });
      }

      console.log("Scrape successful");
      return res.json(data);
    } catch (error) {
      console.error("Error scraping:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to scrape";
      return res.status(500).json({ success: false, error: errorMessage });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const bcrypt = await import("bcryptjs");
      const compare = bcrypt.default?.compare || bcrypt.compare;
      const valid = await compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;
      return res.json({ id: user.id, email: user.email, role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    return res.json({ id: user.id, email: user.email, role: user.role });
  });

  app.get("/api/translations/keys", async (_req, res) => {
    try {
      const keys = await storage.getTranslationKeys();
      return res.json(keys);
    } catch (error) {
      console.error("Error fetching translation keys:", error);
      return res.status(500).json({ error: "Failed to fetch translation keys" });
    }
  });

  app.get("/api/translations", async (req, res) => {
    try {
      const lang = req.query.lang as string | undefined;
      if (lang) {
        const translations = await storage.getTranslationsByLanguage(lang);
        return res.json(translations);
      }
      const allTranslations = await storage.getAllTranslations();
      const grouped: Record<string, Record<string, string>> = {};
      for (const t of allTranslations) {
        if (!grouped[t.key]) {
          grouped[t.key] = {};
        }
        grouped[t.key][t.language] = t.value;
      }
      return res.json(grouped);
    } catch (error) {
      console.error("Error fetching translations:", error);
      return res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  app.put("/api/translations", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const result = upsertTranslationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }

      const translation = await storage.upsertTranslation(result.data.key, result.data.language, result.data.value);
      return res.json(translation);
    } catch (error) {
      console.error("Error upserting translation:", error);
      return res.status(500).json({ error: "Failed to upsert translation" });
    }
  });

  app.put("/api/translations/bulk", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const result = bulkUpsertTranslationsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }

      const count = await storage.upsertTranslationsBulk(result.data);
      return res.json({ count });
    } catch (error) {
      console.error("Error bulk upserting translations:", error);
      return res.status(500).json({ error: "Failed to bulk upsert translations" });
    }
  });

  app.delete("/api/translations/:key", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const key = decodeURIComponent(req.params.key);
      const count = await storage.deleteTranslationKey(key);
      return res.json({ deleted: count });
    } catch (error) {
      console.error("Error deleting translation key:", error);
      return res.status(500).json({ error: "Failed to delete translation key" });
    }
  });

  app.post("/api/translations/seed", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const locales: Record<string, Record<string, string>> = {
        en, he, fr, es, de, ru, am, ar, yi,
      };

      const items: { key: string; language: string; value: string }[] = [];

      for (const [lang, translations] of Object.entries(locales)) {
        for (const [key, value] of Object.entries(translations)) {
          items.push({ key, language: lang, value });
        }
      }

      for (const [lang, extra] of Object.entries(additionalTranslations)) {
        for (const [key, value] of Object.entries(extra)) {
          items.push({ key, language: lang, value });
        }
      }

      const count = await storage.upsertTranslationsBulk(items);
      return res.json({ seeded: count });
    } catch (error) {
      console.error("Error seeding translations:", error);
      return res.status(500).json({ error: "Failed to seed translations" });
    }
  });

  const questionnaireSubmitSchema = z.object({
    type: z.enum(QUESTIONNAIRE_TYPES),
    respondentName: z.string().min(1, "Name is required"),
    respondentEmail: z.string().email("Valid email is required"),
    respondentPhone: z.string().min(7, "Phone number is required"),
    childName: z.string().optional().nullable(),
    childAge: z.number().int().min(1).max(120).optional().nullable(),
    childGender: z.string().optional().nullable(),
    relationship: z.string().optional().nullable(),
    answers: z.record(z.string(), z.number()),
    scores: z.any().optional().nullable(),
    notes: z.string().optional().nullable(),
  });

  app.post("/api/questionnaires/submit", async (req, res) => {
    try {
      const result = questionnaireSubmitSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error.message });
      }

      const submission = await storage.createQuestionnaireSubmission(result.data as any);
      return res.json({ success: true, id: submission.id });
    } catch (error) {
      console.error("Questionnaire submission error:", error);
      return res.status(500).json({ success: false, error: "Failed to submit questionnaire" });
    }
  });

  app.get("/api/questionnaires", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const type = req.query.type as string | undefined;
      const submissions = await storage.getQuestionnaireSubmissions(type);
      return res.json(submissions);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      return res.status(500).json({ error: "Failed to fetch questionnaires" });
    }
  });

  app.get("/api/questionnaires/stats", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const stats = await storage.getQuestionnaireStats();
      return res.json(stats);
    } catch (error) {
      console.error("Error fetching questionnaire stats:", error);
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/questionnaires/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const submission = await storage.getQuestionnaireSubmission(id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      return res.json(submission);
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      return res.status(500).json({ error: "Failed to fetch questionnaire" });
    }
  });

  app.patch("/api/questionnaires/:id/reviewed", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const submission = await storage.markQuestionnaireReviewed(id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      return res.json(submission);
    } catch (error) {
      console.error("Error updating questionnaire:", error);
      return res.status(500).json({ error: "Failed to update questionnaire" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
