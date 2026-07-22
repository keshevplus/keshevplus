import { pgTable, text, serial, timestamp, boolean, jsonb, uniqueIndex, integer, numeric } from "drizzle-orm/pg-core";
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
  // Origin the submission came from (e.g. https://keshevplus.co.il,
  // https://lp.keshevplus.com), captured server-side from the request -
  // lets admins tell which site/form generated the lead.
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
  status: text("status").notNull().default("new"),
  archived: boolean("archived").default(false).notNull(),
  isTest: boolean("is_test").default(false).notNull(),
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
  archived: boolean("archived").default(false).notNull(),
  isTest: boolean("is_test").default(false).notNull(),
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
  appointmentFor: text("appointment_for").notNull().default("self"),
  childName: text("child_name"),
  childAge: integer("child_age"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull().default("consultation"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  archived: boolean("archived").default(false).notNull(),
  isTest: boolean("is_test").default(false).notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  leadNumber: integer("lead_number").unique(),
  clientNumber: integer("client_number").unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  status: text("status").notNull().default("lead"),
  source: text("source").notNull().default("manual"),
  childName: text("child_name"),
  adminSeen: boolean("admin_seen").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  archived: boolean("archived").default(false).notNull(),
  isTest: boolean("is_test").default(false).notNull(),
  dateOfBirth: text("date_of_birth"),
  city: text("city"),
  gender: text("gender"),
  isDiagnosed: boolean("is_diagnosed"),
  clientSince: timestamp("client_since"),
});

export const clientActivities = pgTable("client_activities", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "bit", "check", "other"] as const;
export const PAYMENT_STATUSES = ["paid", "pending", "unpaid"] as const;

export const clientPayments = pgTable("client_payments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  date: text("date").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  method: text("method"),
  invoiceNumber: text("invoice_number"),
  status: text("status").notNull().default("paid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const CLIENT_FILE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;
export const CLIENT_FILE_MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export const clientFiles = pgTable("client_files", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  blobUrl: text("blob_url").notNull(),
  uploadedBy: integer("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientFileSchema = createInsertSchema(clientFiles).omit({ id: true, createdAt: true }).extend({
  fileType: z.enum(CLIENT_FILE_ALLOWED_TYPES),
  fileSize: z.number().int().positive().max(CLIENT_FILE_MAX_SIZE_BYTES),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, read: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true });
export const insertTranslationSchema = createInsertSchema(translations).omit({ id: true });
export const insertQuestionnaireSubmissionSchema = createInsertSchema(questionnaireSubmissions).omit({ id: true, createdAt: true, reviewed: true });
export const insertAppointmentSchema = createInsertSchema(appointments)
  .omit({ id: true, createdAt: true, approvedAt: true })
  .extend({
    appointmentFor: z.enum(["self", "child"]).default("self"),
    childAge: z.number().int().min(6).optional().nullable(),
  });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, leadNumber: true, clientNumber: true, createdAt: true });
export const insertClientActivitySchema = createInsertSchema(clientActivities).omit({ id: true, createdAt: true });
export const insertClientPaymentSchema = createInsertSchema(clientPayments).omit({ id: true, createdAt: true }).extend({
  amount: z.union([z.string(), z.number()]).transform((v) => String(v)),
  method: z.enum(PAYMENT_METHODS).optional().nullable(),
  status: z.enum(PAYMENT_STATUSES).default("paid"),
});

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
export type ClientPayment = typeof clientPayments.$inferSelect;
export type InsertClientPayment = z.infer<typeof insertClientPaymentSchema>;
export type ClientFile = typeof clientFiles.$inferSelect;
export type InsertClientFile = z.infer<typeof insertClientFileSchema>;

export const SUPPORTED_LANGUAGES = ["he", "en", "fr", "es", "de", "ru", "am", "ar", "yi", "it"] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const supportedLanguageSchema = z.enum(SUPPORTED_LANGUAGES);

export const languageSettingsSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["bilingual", "multilingual"]),
  defaultLanguage: supportedLanguageSchema,
  enabledLanguages: z.array(supportedLanguageSchema).min(1).optional(),
});

export const widgetSettingsSchema = z.object({
  showChat: z.boolean().default(true),
  showAccessibility: z.boolean().default(true),
  showWhatsApp: z.boolean().default(true),
});

export const contactFormSettingsSchema = z.object({
  requireMessage: z.boolean().default(true),
});

export const dashboardLayoutSchema = z.object({
  widgets: z.array(z.string()),
});

export type LanguageSettings = z.infer<typeof languageSettingsSchema>;
export type WidgetSettings = z.infer<typeof widgetSettingsSchema>;
export type ContactFormSettings = z.infer<typeof contactFormSettingsSchema>;
export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;

export const upsertTranslationSchema = z.object({
  key: z.string().min(1),
  language: z.enum(SUPPORTED_LANGUAGES),
  value: z.string(),
});

export const bulkUpsertTranslationsSchema = z.array(upsertTranslationSchema);

export const WA_MESSAGE_DIRECTIONS = ["inbound", "outbound"] as const;
export type WaMessageDirection = typeof WA_MESSAGE_DIRECTIONS[number];

export const WA_MESSAGE_STATUSES = ["sent", "delivered", "read", "failed"] as const;
export type WaMessageStatus = typeof WA_MESSAGE_STATUSES[number];

export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  waMessageId: text("wa_message_id"),
  phone: text("phone").notNull(),
  direction: text("direction").notNull().default("inbound"),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  status: text("status").notNull().default("sent"),
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWhatsAppMessageSchema = createInsertSchema(whatsappMessages).omit({ id: true, createdAt: true });
export type WhatsAppMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsAppMessage = z.infer<typeof insertWhatsAppMessageSchema>;

export { conversations, messages } from "./models/chat";
export type { Conversation, InsertConversation, Message, InsertMessage } from "./models/chat";

// Images: CMS-managed, replaceable image assets keyed by a stable "slot" name
// (e.g. "logo", "hero.image", "section.<id>.image"). Storing bytes as base64
// text keeps this portable across hosts without needing an object-storage
// integration, which matters for a template meant to be cloned freely.
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  slot: text("slot").notNull().unique(),
  mimeType: text("mime_type").notNull(),
  filename: text("filename"),
  data: text("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertImageSchema = createInsertSchema(images).omit({ id: true, updatedAt: true });
export type ImageAsset = typeof images.$inferSelect;
export type InsertImageAsset = z.infer<typeof insertImageSchema>;
export type ImageAssetMeta = Omit<ImageAsset, "data">;

// Home page sections: an admin-orderable list of content blocks. "legacy:*"
// types render the existing hardcoded business components (their text still
// goes through the translations system below); the other types are generic,
// reusable templates whose text/images are addressable via
// `section.<id>.*` translation keys and `section.<id>.<field>` image slots.
export const HOME_SECTION_TYPES = [
  "legacy:about",
  "legacy:services",
  "legacy:adhdInfo",
  "legacy:questionnaires",
  "legacy:contact",
  "richText",
  "cards",
  "faq",
  "testimonials",
  "gallery",
  "cta",
] as const;
export type HomeSectionType = typeof HOME_SECTION_TYPES[number];

export const LEGACY_SECTION_TYPES: HomeSectionType[] = [
  "legacy:about",
  "legacy:services",
  "legacy:adhdInfo",
  "legacy:questionnaires",
  "legacy:contact",
];

export const homeSectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(HOME_SECTION_TYPES),
  enabled: z.boolean().default(true),
  config: z.record(z.any()).default({}),
});
export type HomeSection = z.infer<typeof homeSectionSchema>;

export const homeSectionsSchema = z.array(homeSectionSchema);

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  { id: "about", type: "legacy:about", enabled: true, config: {} },
  { id: "services", type: "legacy:services", enabled: true, config: {} },
  { id: "adhd-info", type: "legacy:adhdInfo", enabled: true, config: {} },
  { id: "questionnaires", type: "legacy:questionnaires", enabled: true, config: {} },
  { id: "contact", type: "legacy:contact", enabled: true, config: {} },
];
