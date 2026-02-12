import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, languageSettingsSchema, upsertTranslationSchema, bulkUpsertTranslationsSchema, SUPPORTED_LANGUAGES, QUESTIONNAIRE_TYPES, insertQuestionnaireSubmissionSchema, insertAppointmentSchema, insertClientSchema, insertClientActivitySchema, APPOINTMENT_STATUSES } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

// This is using Replit's AI Integrations service, which provides Gemini-compatible API access without requiring your own Gemini API key.
const geminiAi = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

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

const DEFAULT_EMAIL_NOTIFICATION_SETTINGS = {
  contactForm: true,
  appointments: true,
  questionnaires: true,
};

type EmailNotificationSettings = typeof DEFAULT_EMAIL_NOTIFICATION_SETTINGS;

async function getEmailNotificationSettings(): Promise<EmailNotificationSettings> {
  try {
    const setting = await storage.getSetting("emailNotifications");
    if (setting) return setting.value as EmailNotificationSettings;
  } catch {}
  return DEFAULT_EMAIL_NOTIFICATION_SETTINGS;
}

async function sendNotificationEmail(subject: string, body: string): Promise<void> {
  if (!process.env.EMAIL_PASS) {
    console.warn("EMAIL_PASS not set, skipping email delivery");
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'pluskeshev@gmail.com',
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'pluskeshev@gmail.com',
      to: 'pluskeshev@gmail.com',
      subject,
      text: body,
    });
  } catch (emailError) {
    console.error("Email delivery failed:", emailError);
  }
}

function hasAdminAccess(user: { role: string; email: string } | undefined | null): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "owner" || user.email === "admin@keshevplus.co.il";
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const result = insertContactSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error.message });
      }
      
      await storage.createContact(result.data);

      if (result.data.email) {
        try {
          await storage.upsertClientByEmail({
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone,
            source: 'contact_form',
          });
        } catch (e) { console.error("Auto-register client error:", e); }
      }

      const notifSettings = await getEmailNotificationSettings();
      if (notifSettings.contactForm) {
        await sendNotificationEmail(
          `פנייה חדשה מהאתר - ${result.data.name}`,
          `שם: ${result.data.name}\nטלפון: ${result.data.phone}\nאימייל: ${result.data.email || 'לא צויין'}\nהודעה: ${result.data.message}`
        );
      }

      return res.json({ success: true, message: "Form submitted successfully" });
    } catch (error) {
      console.error("Contact form error:", error);
      return res.status(500).json({ success: false, message: "Failed to submit form" });
    }
  });

  app.get("/api/admin/badge-counts", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const counts = await storage.getAdminBadgeCounts();
      return res.json(counts);
    } catch (error) {
      console.error("Error fetching badge counts:", error);
      return res.status(500).json({ error: "Failed to fetch badge counts" });
    }
  });

  app.get("/api/settings/widgets", async (req, res) => {
    const settings = await storage.getWidgetSettings();
    res.json(settings);
  });

  app.put("/api/settings/widgets", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!hasAdminAccess(user)) return res.status(403).json({ error: "Admin access required" });
    
    const settings = await storage.updateWidgetSettings(req.body);
    res.json(settings);
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const contacts = await storage.getContacts();
      const status = req.query.status as string | undefined;
      const filtered = status && status !== "all" 
        ? contacts.filter(c => c.status === status)
        : contacts;
      return res.json(filtered);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.patch("/api/contacts/:id/read", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
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

  app.patch("/api/contacts/:id/status", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const contact = await storage.updateContactStatus(id, status);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      return res.json(contact);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update contact status" });
    }
  });

  app.post("/api/contacts/bulk-delete", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs array is required" });
      }
      const count = await storage.bulkDeleteContacts(ids.map(Number));
      return res.json({ success: true, deleted: count });
    } catch (error) {
      return res.status(500).json({ error: "Failed to bulk delete contacts" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContact(id);
      if (!deleted) {
        return res.status(404).json({ error: "Contact not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete contact" });
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
      if (!hasAdminAccess(user)) {
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

  app.get("/api/settings/email-notifications", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const settings = await getEmailNotificationSettings();
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch notification settings" });
    }
  });

  app.put("/api/settings/email-notifications", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { contactForm, appointments, questionnaires } = req.body;
      const value = {
        contactForm: contactForm !== false,
        appointments: appointments !== false,
        questionnaires: questionnaires !== false,
      };
      const setting = await storage.upsertSetting("emailNotifications", value);
      return res.json(setting.value);
    } catch (error) {
      return res.status(500).json({ error: "Failed to save notification settings" });
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
      return res.json({ id: user.id, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) return res.status(403).json({ error: "Admin access required" });

      const allUsers = await db.select().from(users);
      // Hide superadmin from everyone
      const filtered = allUsers.filter(u => u.email !== "drkeshevplus@gmail.com");
      return res.json(filtered);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) return res.status(403).json({ error: "Admin access required" });

      const targetId = parseInt(req.params.id);
      const targetUser = await storage.getUser(targetId);
      
      if (targetUser?.email === "drkeshevplus@gmail.com") {
        return res.status(403).json({ error: "Cannot delete superadmin" });
      }

      await db.delete(users).where(eq(users.id, targetId));
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Delete failed" });
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
    return res.json({ id: user.id, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword });
  });

  app.post("/api/auth/change-password", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(401).json({ error: "User not found" });

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      const bcrypt = await import("bcryptjs");
      const compare = bcrypt.default?.compare || bcrypt.compare;
      const valid = await compare(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hash = bcrypt.default?.hash || bcrypt.hash;
      const hashedPassword = await hash(newPassword, 10);
      await storage.updateUserPassword(userId, hashedPassword);

      return res.json({ success: true });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ error: "Failed to change password" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ success: true, message: "If the email exists, a reset link was sent." });
      }

      const resetToken = Math.random().toString(36).substring(2, 15);
      await storage.setResetToken(user.id, resetToken);

      const resetUrl = `${req.protocol}://${req.get('host')}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      await sendNotificationEmail(
        "שחזור סיסמה - קשב פלוס",
        `שלום,\n\nהתקבלה בקשה לשחזור סיסמה עבור המשתמש שלך.\nלחץ על הקישור הבא כדי לאפס את הסיסמה:\n${resetUrl}\n\nאם לא ביקשת זאת, ניתן להתעלם מהודעה זו.`
      );

      return res.json({ success: true, message: "If the email exists, a reset link was sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || (user as any).resetToken !== token) {
        return res.status(400).json({ error: "Invalid token or email" });
      }

      const bcrypt = await import("bcryptjs");
      const hash = bcrypt.default?.hash || bcrypt.hash;
      const hashedPassword = await hash(newPassword, 10);
      
      await storage.updateUserPassword(user.id, hashedPassword);
      await storage.clearResetToken(user.id);
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Reset failed" });
    }
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
      if (!hasAdminAccess(user)) {
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
      if (!hasAdminAccess(user)) {
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
      if (!hasAdminAccess(user)) {
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
      if (!hasAdminAccess(user)) {
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

      try {
        await storage.upsertClientByEmail({
          name: result.data.respondentName,
          email: result.data.respondentEmail,
          phone: result.data.respondentPhone,
          source: 'questionnaire',
          childName: result.data.childName || undefined,
        });
      } catch (e) { console.error("Auto-register client error:", e); }

      const notifSettings = await getEmailNotificationSettings();
      if (notifSettings.questionnaires) {
        const typeNames: Record<string, string> = { parent: 'הורה', teacher: 'מורה', self_report: 'דיווח עצמי' };
        await sendNotificationEmail(
          `שאלון חדש הוגש - ${typeNames[result.data.type] || result.data.type}`,
          `סוג שאלון: ${typeNames[result.data.type] || result.data.type}\nשם: ${result.data.respondentName}\nטלפון: ${result.data.respondentPhone}\nאימייל: ${result.data.respondentEmail}\nשם הילד: ${result.data.childName || 'לא צויין'}`
        );
      }

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
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      let submissions = await storage.getQuestionnaireSubmissions(type && type !== 'all' ? type : undefined);
      if (status && status !== "all") {
        submissions = submissions.filter(s => s.status === status);
      }
      return res.json(submissions);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      return res.status(500).json({ error: "Failed to fetch questionnaires" });
    }
  });

  app.patch("/api/questionnaires/:id/status", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const submission = await storage.updateQuestionnaireStatus(id, status);
      if (!submission) {
        return res.status(404).json({ error: "Questionnaire not found" });
      }
      return res.json(submission);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update questionnaire status" });
    }
  });

  app.delete("/api/questionnaires/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteQuestionnaire(id);
      if (!deleted) {
        return res.status(404).json({ error: "Questionnaire not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete questionnaire" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(id);
      if (!deleted) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  app.get("/api/questionnaires/stats", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
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
      if (!hasAdminAccess(user)) {
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
      if (!hasAdminAccess(user)) {
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

  // ===== Appointment Routes =====
  app.post("/api/appointments", async (req, res) => {
    try {
      const result = insertAppointmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error.message });
      }

      const childName = result.data.childName || '';
      if (childName && result.data.clientEmail) {
        const existing = await storage.getActiveAppointmentForChild(result.data.clientEmail, childName);
        if (existing) {
          return res.status(400).json({ 
            success: false, 
            error: "כבר קיים תור פעיל עבור ילד זה. ניתן לקבוע תור חדש רק לאחר השלמת או ביטול התור הקיים." 
          });
        }
      }

      try {
        await storage.upsertClientByEmail({
          name: result.data.clientName,
          email: result.data.clientEmail,
          phone: result.data.clientPhone,
          source: 'appointment',
          childName: childName || undefined,
        });
      } catch (e) { console.error("Auto-register client error:", e); }

      const appointment = await storage.createAppointment(result.data);

      const notifSettings = await getEmailNotificationSettings();
      if (notifSettings.appointments) {
        await sendNotificationEmail(
          `פגישה חדשה נקבעה - ${result.data.clientName}`,
          `שם: ${result.data.clientName}\nטלפון: ${result.data.clientPhone}\nאימייל: ${result.data.clientEmail}\nתאריך: ${result.data.date}\nשעה: ${result.data.time}\nסוג: ${result.data.type || 'consultation'}\nהערות: ${result.data.notes || 'אין'}`
        );
      }

      return res.json({ success: true, appointment });
    } catch (error) {
      console.error("Appointment creation error:", error);
      return res.status(500).json({ success: false, error: "Failed to create appointment" });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const status = req.query.status as string | undefined;
      const list = await storage.getAppointments(status);
      return res.json(list);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status || !APPOINTMENT_STATUSES.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateAppointmentStatus(id, status);
      if (!updated) return res.status(404).json({ error: "Appointment not found" });
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  // ===== CRM Client Routes =====
  app.post("/api/clients", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const result = insertClientSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const client = await storage.createClient(result.data);
      return res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      return res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.post("/api/clients/bulk-delete", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs array is required" });
      }
      const count = await storage.bulkDeleteClients(ids.map(Number));
      return res.json({ success: true, deleted: count });
    } catch (error) {
      return res.status(500).json({ error: "Failed to bulk delete clients" });
    }
  });

  app.get("/api/clients", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const list = await storage.getClients();
      return res.json(list);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) return res.status(404).json({ error: "Client not found" });
      return res.json(client);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const updated = await storage.updateClient(id, req.body);
      if (!updated) return res.status(404).json({ error: "Client not found" });
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.get("/api/clients/:id/interactions", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const interactions = await storage.getClientInteractions(id);
      return res.json(interactions);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch interactions" });
    }
  });

  // ===== CRM Activity Routes =====
  app.post("/api/clients/:id/activities", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const clientId = parseInt(req.params.id);
      const result = insertClientActivitySchema.safeParse({ ...req.body, clientId });
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const activity = await storage.createClientActivity(result.data);
      return res.json(activity);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create activity" });
    }
  });

  app.get("/api/clients/:id/activities", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const clientId = parseInt(req.params.id);
      const activities = await storage.getClientActivities(clientId);
      return res.json(activities);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // ===== AI Chat Widget Route =====
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [], language = 'he', conversationId } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const useDirectKey = !!process.env.OPENAI_API_KEY;
      const openai = new OpenAI({
        apiKey: useDirectKey ? process.env.OPENAI_API_KEY : process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        ...(useDirectKey ? {} : { baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL }),
      });

      const systemPrompt = language === 'he'
        ? `אתה עוזר וירטואלי של מרפאת "קשב פלוס" - מרפאה מובילה לאבחון וטיפול בהפרעות קשב וריכוז (ADHD) בילדים, בני נוער ומבוגרים. המרפאה נמצאת ביגאל אלון 94, תל אביב. טלפון: 055-27-399-27. ענה בעברית, בצורה מקצועית וחמה. עזור למבקרים להבין את תהליך האבחון, סוגי הטיפול, ולקבוע פגישה. אל תתן ייעוץ רפואי ספציפי - הפנה תמיד לפגישת ייעוץ.`
        : `You are the virtual assistant for "Keshev Plus" clinic - a leading clinic for ADHD diagnosis and treatment in children, teens, and adults. The clinic is located at 94 Yigal Alon St., Tel Aviv. Phone: 055-27-399-27. Answer professionally and warmly. Help visitors understand the diagnosis process, treatment options, and schedule appointments. Never give specific medical advice - always refer to a consultation appointment.`;

      const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...history.map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ];

      if (conversationId) {
        try {
          const conv = await storage.getConversation(conversationId);
          if (conv) {
            await storage.addMessage({ conversationId, role: 'user', content: message });
          }
        } catch (msgErr) {
          console.error("Failed to save user message:", msgErr);
        }
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullAssistantResponse = '';

      try {
        const stream = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: chatMessages,
          stream: true,
          max_completion_tokens: 500,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullAssistantResponse += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
      } catch (openaiError: any) {
        console.error("OpenAI failed, falling back to Gemini:", openaiError);
        try {
          // Fix Gemini model instantiation - some versions use getGenerativeModel on the instance
          const model = (geminiAi as any).getGenerativeModel ? (geminiAi as any).getGenerativeModel({ model: "gemini-1.5-flash" }) : (geminiAi as any).models.get("gemini-1.5-flash");
          const chatHistory = history.map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const chat = model.startChat({
            history: chatHistory,
          });

          // Gemini doesn't support a separate system message in startChat like OpenAI, 
          // so we prepend it to the first message if history is empty, or just use sendMessageStream.
          // For simplicity and to maintain instructions, we use the system instruction if supported by the model config.
          const result = await model.generateContentStream({
            contents: [
              { role: 'user', parts: [{ text: `Instructions: ${systemPrompt}\n\nUser Message: ${message}` }] }
            ]
          });

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              fullAssistantResponse += chunkText;
              res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
            }
          }
        } catch (geminiError) {
          console.error("Both OpenAI and Gemini failed:", geminiError);
          const errorMsg = language === 'he'
            ? 'שירות הצ\'אט אינו זמין כרגע. ניתן ליצור קשר עם המרפאה בטלפון 055-27-399-27 או דרך טופס יצירת הקשר באתר.'
            : 'Chat service is currently unavailable. Please contact the clinic at 055-27-399-27 or use the contact form on the website.';
          res.write(`data: ${JSON.stringify({ content: errorMsg })}\n\n`);
        }
      }

      if (conversationId && fullAssistantResponse) {
        const conv = await storage.getConversation(conversationId);
        if (conv) {
          await storage.addMessage({ conversationId, role: 'assistant', content: fullAssistantResponse });
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Chat error:", error);
      const isAuthError = error?.status === 401 || error?.message?.includes('401');
      const fallbackMsg = req.body.language === 'he'
        ? 'שירות הצ\'אט אינו זמין כרגע. ניתן ליצור קשר עם המרפאה בטלפון 055-27-399-27 או דרך טופס יצירת הקשר באתר.'
        : 'Chat service is currently unavailable. Please contact the clinic at 055-27-399-27 or use the contact form on the website.';

      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ content: fallbackMsg })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } else if (isAuthError) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ content: fallbackMsg })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Chat failed" });
      }
    }
  });

  // ===== Conversation Routes =====
  const createConversationSchema = z.object({
    visitorName: z.string().min(1, "Name is required"),
    visitorEmail: z.string().email("Valid email is required"),
    visitorPhone: z.string().optional().default(''),
    title: z.string().optional(),
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const result = createConversationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
      const { visitorName, visitorEmail, visitorPhone, title } = result.data;
      const conversation = await storage.createConversation({
        visitorName,
        visitorEmail,
        visitorPhone: visitorPhone || '',
        title: title || `${visitorName} - ${new Date().toLocaleDateString('he-IL')}`,
      });

      try {
        await storage.upsertClientByEmail({
          name: visitorName,
          email: visitorEmail,
          phone: visitorPhone || undefined,
          source: 'chat',
        });
      } catch (e) { console.error("Auto-register client error:", e); }

      return res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      return res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const list = await storage.getConversations();
      return res.json(list);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const msgs = await storage.getMessages(id);
      return res.json(msgs);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.patch("/api/conversations/:id/reviewed", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const updated = await storage.markConversationReviewed(id);
      if (!updated) return res.status(404).json({ error: "Conversation not found" });
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update conversation" });
    }
  });

  app.post("/api/conversations/bulk-delete", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs array is required" });
      }
      const count = await storage.bulkDeleteConversations(ids.map(Number));
      return res.json({ success: true, deleted: count });
    } catch (error) {
      return res.status(500).json({ error: "Failed to bulk delete conversations" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!hasAdminAccess(user)) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteConversation(id);
      if (!deleted) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
