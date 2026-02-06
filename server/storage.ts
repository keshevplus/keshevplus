import { users, contacts, siteSettings, type User, type InsertUser, type Contact, type InsertContact, type SiteSetting } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  markContactRead(id: number): Promise<Contact | undefined>;
  getSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSetting(key: string, value: unknown): Promise<SiteSetting>;
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
}

export const storage = new DatabaseStorage();
