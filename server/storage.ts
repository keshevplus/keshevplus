import { users, contacts, siteSettings, translations, questionnaireSubmissions, type User, type InsertUser, type Contact, type InsertContact, type SiteSetting, type Translation, type InsertTranslation, type QuestionnaireSubmission, type InsertQuestionnaireSubmission } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  markContactRead(id: number): Promise<Contact | undefined>;
  getSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSetting(key: string, value: unknown): Promise<SiteSetting>;
  getTranslationsByLanguage(language: string): Promise<Record<string, string>>;
  getAllTranslations(): Promise<Translation[]>;
  upsertTranslation(key: string, language: string, value: string): Promise<Translation>;
  upsertTranslationsBulk(items: InsertTranslation[]): Promise<number>;
  deleteTranslationKey(key: string): Promise<number>;
  getTranslationKeys(): Promise<string[]>;
  createQuestionnaireSubmission(submission: InsertQuestionnaireSubmission): Promise<QuestionnaireSubmission>;
  getQuestionnaireSubmissions(type?: string): Promise<QuestionnaireSubmission[]>;
  getQuestionnaireSubmission(id: number): Promise<QuestionnaireSubmission | undefined>;
  markQuestionnaireReviewed(id: number): Promise<QuestionnaireSubmission | undefined>;
  getQuestionnaireStats(): Promise<{ total: number; byType: Record<string, number>; unreviewed: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser as any)
      .returning();
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact as any)
      .returning();
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async markContactRead(id: number): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set({ read: true } as any)
      .where(eq(contacts.id, id))
      .returning();
    return contact || undefined;
  }

  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting || undefined;
  }

  async upsertSetting(key: string, value: unknown): Promise<SiteSetting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ value } as any)
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(siteSettings)
      .values({ key, value } as any)
      .returning();
    return created;
  }

  async getTranslationsByLanguage(language: string): Promise<Record<string, string>> {
    const rows = await db.select().from(translations).where(eq(translations.language, language));
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }

  async getAllTranslations(): Promise<Translation[]> {
    return await db.select().from(translations).orderBy(translations.key, translations.language);
  }

  async upsertTranslation(key: string, language: string, value: string): Promise<Translation> {
    const [existing] = await db
      .select()
      .from(translations)
      .where(and(eq(translations.key, key), eq(translations.language, language)));

    if (existing) {
      const [updated] = await db
        .update(translations)
        .set({ value } as any)
        .where(and(eq(translations.key, key), eq(translations.language, language)))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(translations)
      .values({ key, language, value } as any)
      .returning();
    return created;
  }

  async upsertTranslationsBulk(items: InsertTranslation[]): Promise<number> {
    if (items.length === 0) return 0;
    let count = 0;
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await db
        .insert(translations)
        .values(batch as any)
        .onConflictDoUpdate({
          target: [translations.key, translations.language],
          set: { value: sql`excluded.value` },
        });
      count += batch.length;
    }
    return count;
  }

  async deleteTranslationKey(key: string): Promise<number> {
    const deleted = await db.delete(translations).where(eq(translations.key, key)).returning();
    return deleted.length;
  }

  async getTranslationKeys(): Promise<string[]> {
    const rows = await db
      .selectDistinct({ key: translations.key })
      .from(translations)
      .orderBy(translations.key);
    return rows.map((r) => r.key);
  }

  async createQuestionnaireSubmission(submission: InsertQuestionnaireSubmission): Promise<QuestionnaireSubmission> {
    const [created] = await db
      .insert(questionnaireSubmissions)
      .values(submission as any)
      .returning();
    return created;
  }

  async getQuestionnaireSubmissions(type?: string): Promise<QuestionnaireSubmission[]> {
    if (type) {
      return await db.select().from(questionnaireSubmissions)
        .where(eq(questionnaireSubmissions.type, type))
        .orderBy(desc(questionnaireSubmissions.createdAt));
    }
    return await db.select().from(questionnaireSubmissions)
      .orderBy(desc(questionnaireSubmissions.createdAt));
  }

  async getQuestionnaireSubmission(id: number): Promise<QuestionnaireSubmission | undefined> {
    const [submission] = await db.select().from(questionnaireSubmissions)
      .where(eq(questionnaireSubmissions.id, id));
    return submission || undefined;
  }

  async markQuestionnaireReviewed(id: number): Promise<QuestionnaireSubmission | undefined> {
    const [updated] = await db
      .update(questionnaireSubmissions)
      .set({ reviewed: true } as any)
      .where(eq(questionnaireSubmissions.id, id))
      .returning();
    return updated || undefined;
  }

  async getQuestionnaireStats(): Promise<{ total: number; byType: Record<string, number>; unreviewed: number }> {
    const all = await db.select().from(questionnaireSubmissions);
    const byType: Record<string, number> = {};
    let unreviewed = 0;
    for (const sub of all) {
      byType[sub.type] = (byType[sub.type] || 0) + 1;
      if (!sub.reviewed) unreviewed++;
    }
    return { total: all.length, byType, unreviewed };
  }
}

export const storage = new DatabaseStorage();
