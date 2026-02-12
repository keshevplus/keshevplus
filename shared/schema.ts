import { pgTable, text, serial, timestamp, boolean, jsonb, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  resetToken: text("reset_token"),
});

export const CONTACT_STATUSES = ["new", "in_progress", "closed", "follow_up"] as const;
export type ContactStatus = typeof CONTACT_STATUSES[number];

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
  status: text("status").notNull().default("new"),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
});

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  language: text("language").notNull(),
  value: text("value").notNull(),
}, (table) => [
  uniqueIndex("translations_key_language_idx").on(table.key, table.language),
]);

export const QUESTIONNAIRE_TYPES = ["parent", "teacher", "self_report"] as const;
export type QuestionnaireType = typeof QUESTIONNAIRE_TYPES[number];

export const QUESTIONNAIRE_STATUSES = ["new", "reviewed", "archived"] as const;
export type QuestionnaireStatus = typeof QUESTIONNAIRE_STATUSES[number];

export const questionnaireSubmissions = pgTable("questionnaire_submissions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  respondentName: text("respondent_name").notNull(),
  respondentEmail: text("respondent_email").notNull(),
  respondentPhone: text("respondent_phone").notNull(),
  childName: text("child_name"),
  childAge: integer("child_age"),
  childGender: text("child_gender"),
  relationship: text("relationship"),
  answers: jsonb("answers").notNull(),
  scores: jsonb("scores"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewed: boolean("reviewed").default(false).notNull(),
  status: text("status").notNull().default("new"),
});

export const smsVerifications = pgTable("sms_verifications", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const APPOINTMENT_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number];

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  childName: text("child_name"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull().default("consultation"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  status: text("status").notNull().default("lead"),
  source: text("source").notNull().default("manual"),
  childName: text("child_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientActivities = pgTable("client_activities", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, read: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true });
export const insertTranslationSchema = createInsertSchema(translations).omit({ id: true });
export const insertQuestionnaireSubmissionSchema = createInsertSchema(questionnaireSubmissions).omit({ id: true, createdAt: true, reviewed: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertClientActivitySchema = createInsertSchema(clientActivities).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type QuestionnaireSubmission = typeof questionnaireSubmissions.$inferSelect;
export type InsertQuestionnaireSubmission = z.infer<typeof insertQuestionnaireSubmissionSchema>;
export type SmsVerification = typeof smsVerifications.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type ClientActivity = typeof clientActivities.$inferSelect;
export type InsertClientActivity = z.infer<typeof insertClientActivitySchema>;

export const SUPPORTED_LANGUAGES = ["he", "en", "fr", "es", "de", "ru", "am", "ar", "yi"] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const languageSettingsSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["bilingual", "multilingual"]),
  defaultLanguage: z.enum(SUPPORTED_LANGUAGES),
});

export const widgetSettingsSchema = z.object({
  showChat: z.boolean().default(true),
  showAccessibility: z.boolean().default(true),
  showWhatsApp: z.boolean().default(true),
});

export type LanguageSettings = z.infer<typeof languageSettingsSchema>;
export type WidgetSettings = z.infer<typeof widgetSettingsSchema>;

export const upsertTranslationSchema = z.object({
  key: z.string().min(1),
  language: z.enum(SUPPORTED_LANGUAGES),
  value: z.string(),
});

export const bulkUpsertTranslationsSchema = z.array(upsertTranslationSchema);

export { conversations, messages } from "./models/chat";
export type { Conversation, InsertConversation, Message, InsertMessage } from "./models/chat";
