import { pgTable, text, serial, timestamp, boolean, jsonb, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
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
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, read: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true });
export const insertTranslationSchema = createInsertSchema(translations).omit({ id: true });
export const insertQuestionnaireSubmissionSchema = createInsertSchema(questionnaireSubmissions).omit({ id: true, createdAt: true, reviewed: true });

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

export const SUPPORTED_LANGUAGES = ["he", "en", "fr", "es", "de", "ru", "am", "ar", "yi"] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const languageSettingsSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["bilingual", "multilingual"]),
  defaultLanguage: z.enum(SUPPORTED_LANGUAGES),
});

export type LanguageSettings = z.infer<typeof languageSettingsSchema>;

export const upsertTranslationSchema = z.object({
  key: z.string().min(1),
  language: z.enum(SUPPORTED_LANGUAGES),
  value: z.string(),
});

export const bulkUpsertTranslationsSchema = z.array(upsertTranslationSchema);
