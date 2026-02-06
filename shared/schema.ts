import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
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

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, read: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

export const languageSettingsSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["bilingual", "multilingual"]),
  defaultLanguage: z.enum(["he", "en", "fr", "es", "de", "ru", "am", "ar", "yi"]),
});

export type LanguageSettings = z.infer<typeof languageSettingsSchema>;
