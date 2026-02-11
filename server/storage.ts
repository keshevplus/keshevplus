import { users, contacts, siteSettings, translations, questionnaireSubmissions, smsVerifications, appointments, clients, clientActivities, conversations, messages, type User, type InsertUser, type Contact, type InsertContact, type SiteSetting, type Translation, type InsertTranslation, type QuestionnaireSubmission, type InsertQuestionnaireSubmission, type SmsVerification, type Appointment, type InsertAppointment, type Client, type InsertClient, type ClientActivity, type InsertClientActivity, type Conversation, type InsertConversation, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, lt, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
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
  createSmsVerification(phone: string, code: string, expiresAt: Date): Promise<SmsVerification>;
  verifySmsCode(phone: string, code: string): Promise<boolean>;
  cleanupExpiredVerifications(): Promise<void>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(status?: string): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  updateClient(id: number, data: Partial<InsertClient>): Promise<Client | undefined>;
  createClientActivity(activity: InsertClientActivity): Promise<ClientActivity>;
  getClientActivities(clientId: number): Promise<ClientActivity[]>;
  upsertClientByEmail(data: { name: string; email: string; phone?: string; source: string; childName?: string }): Promise<Client>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  getClientInteractions(clientId: number): Promise<{ contacts: Contact[]; appointments: Appointment[]; questionnaires: QuestionnaireSubmission[]; conversations: Conversation[] }>;
  getActiveAppointmentForChild(email: string, childName: string): Promise<Appointment | undefined>;
  getAdminBadgeCounts(): Promise<{ unreadContacts: number; pendingAppointments: number; unreviewedQuestionnaires: number; unreviewedConversations: number; newLeads: number }>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversations(): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  markConversationReviewed(id: number): Promise<Conversation | undefined>;
  addMessage(message: InsertMessage): Promise<Message>;
  getMessages(conversationId: number): Promise<Message[]>;
  deleteContact(id: number): Promise<boolean>;
  deleteConversation(id: number): Promise<boolean>;
  deleteClient(id: number): Promise<boolean>;
  bulkDeleteContacts(ids: number[]): Promise<number>;
  bulkDeleteConversations(ids: number[]): Promise<number>;
  bulkDeleteClients(ids: number[]): Promise<number>;
  updateContactStatus(id: number, status: string): Promise<Contact | undefined>;
  updateQuestionnaireStatus(id: number, status: string): Promise<QuestionnaireSubmission | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  deleteQuestionnaire(id: number): Promise<boolean>;
  bulkDeleteAppointments(ids: number[]): Promise<number>;
  bulkDeleteQuestionnaires(ids: number[]): Promise<number>;
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

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, mustChangePassword: false } as any)
      .where(eq(users.id, id));
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
  async createSmsVerification(phone: string, code: string, expiresAt: Date): Promise<SmsVerification> {
    const [created] = await db
      .insert(smsVerifications)
      .values({ phone, code, expiresAt } as any)
      .returning();
    return created;
  }

  async verifySmsCode(phone: string, code: string): Promise<boolean> {
    const now = new Date();
    const [record] = await db
      .select()
      .from(smsVerifications)
      .where(
        and(
          eq(smsVerifications.phone, phone),
          eq(smsVerifications.code, code),
          eq(smsVerifications.verified, false)
        )
      )
      .orderBy(desc(smsVerifications.createdAt))
      .limit(1);

    if (!record || record.expiresAt < now) return false;

    await db
      .update(smsVerifications)
      .set({ verified: true } as any)
      .where(eq(smsVerifications.id, record.id));

    return true;
  }

  async cleanupExpiredVerifications(): Promise<void> {
    const now = new Date();
    await db.delete(smsVerifications).where(lt(smsVerifications.expiresAt, now));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db.insert(appointments).values(appointment as any).returning();
    return created;
  }

  async getAppointments(status?: string): Promise<Appointment[]> {
    if (status) {
      return await db.select().from(appointments)
        .where(eq(appointments.status, status))
        .orderBy(desc(appointments.createdAt));
    }
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [a] = await db.select().from(appointments).where(eq(appointments.id, id));
    return a || undefined;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [updated] = await db.update(appointments)
      .set({ status } as any)
      .where(eq(appointments.id, id))
      .returning();
    return updated || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client as any).returning();
    return created;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [c] = await db.select().from(clients).where(eq(clients.id, id));
    return c || undefined;
  }

  async updateClient(id: number, data: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db.update(clients)
      .set(data as any)
      .where(eq(clients.id, id))
      .returning();
    return updated || undefined;
  }

  async createClientActivity(activity: InsertClientActivity): Promise<ClientActivity> {
    const [created] = await db.insert(clientActivities).values(activity as any).returning();
    return created;
  }

  async getClientActivities(clientId: number): Promise<ClientActivity[]> {
    return await db.select().from(clientActivities)
      .where(eq(clientActivities.clientId, clientId))
      .orderBy(desc(clientActivities.createdAt));
  }

  async upsertClientByEmail(data: { name: string; email: string; phone?: string; source: string; childName?: string }): Promise<Client> {
    const existing = await this.getClientByEmail(data.email);
    if (existing) {
      const updates: Record<string, any> = {};
      if (data.phone && !existing.phone) updates.phone = data.phone;
      if (data.childName && !existing.childName) updates.childName = data.childName;
      if (Object.keys(updates).length > 0) {
        const [updated] = await db.update(clients).set(updates).where(eq(clients.id, existing.id)).returning();
        return updated;
      }
      return existing;
    }
    const [created] = await db.insert(clients).values({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      status: 'lead',
      source: data.source,
      childName: data.childName || null,
    } as any).returning();
    return created;
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [c] = await db.select().from(clients).where(eq(clients.email, email));
    return c || undefined;
  }

  async getClientInteractions(clientId: number): Promise<{ contacts: Contact[]; appointments: Appointment[]; questionnaires: QuestionnaireSubmission[]; conversations: Conversation[] }> {
    const client = await this.getClient(clientId);
    if (!client || !client.email) {
      return { contacts: [], appointments: [], questionnaires: [], conversations: [] };
    }
    const email = client.email;
    const clientContacts = await db.select().from(contacts).where(eq(contacts.email, email)).orderBy(desc(contacts.createdAt));
    const clientAppointments = await db.select().from(appointments).where(eq(appointments.clientEmail, email)).orderBy(desc(appointments.createdAt));
    const clientQuestionnaires = await db.select().from(questionnaireSubmissions).where(eq(questionnaireSubmissions.respondentEmail, email)).orderBy(desc(questionnaireSubmissions.createdAt));
    const clientConversations = await db.select().from(conversations).where(eq(conversations.visitorEmail, email)).orderBy(desc(conversations.createdAt));
    return { contacts: clientContacts, appointments: clientAppointments, questionnaires: clientQuestionnaires, conversations: clientConversations };
  }

  async getActiveAppointmentForChild(email: string, childName: string): Promise<Appointment | undefined> {
    const allAppts = await db.select().from(appointments)
      .where(eq(appointments.clientEmail, email))
      .orderBy(desc(appointments.createdAt));
    return allAppts.find(a => 
      (a.status === 'pending' || a.status === 'confirmed') && 
      a.childName?.toLowerCase() === childName.toLowerCase()
    );
  }

  async getAdminBadgeCounts(): Promise<{ unreadContacts: number; pendingAppointments: number; unreviewedQuestionnaires: number; unreviewedConversations: number; newLeads: number }> {
    const [contactsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(contacts).where(eq(contacts.read, false));
    const [appointmentsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(appointments).where(eq(appointments.status, 'pending'));
    const [questionnairesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(questionnaireSubmissions).where(eq(questionnaireSubmissions.reviewed, false));
    const [conversationsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(conversations).where(eq(conversations.reviewed, false));
    const [leadsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(clients).where(eq(clients.status, 'lead'));
    return {
      unreadContacts: contactsResult?.count ?? 0,
      pendingAppointments: appointmentsResult?.count ?? 0,
      unreviewedQuestionnaires: questionnairesResult?.count ?? 0,
      unreviewedConversations: conversationsResult?.count ?? 0,
      newLeads: leadsResult?.count ?? 0,
    };
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(conversation as any).returning();
    return created;
  }

  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [c] = await db.select().from(conversations).where(eq(conversations.id, id));
    return c || undefined;
  }

  async markConversationReviewed(id: number): Promise<Conversation | undefined> {
    const [updated] = await db.update(conversations)
      .set({ reviewed: true } as any)
      .where(eq(conversations.id, id))
      .returning();
    return updated || undefined;
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message as any).returning();
    return created;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }

  async deleteConversation(id: number): Promise<boolean> {
    const result = await db.delete(conversations).where(eq(conversations.id, id)).returning();
    return result.length > 0;
  }

  async deleteClient(id: number): Promise<boolean> {
    await db.delete(clientActivities).where(eq(clientActivities.clientId, id));
    const result = await db.delete(clients).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }

  async bulkDeleteContacts(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(contacts).where(inArray(contacts.id, ids)).returning();
    return result.length;
  }

  async bulkDeleteConversations(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    await db.delete(messages).where(inArray(messages.conversationId, ids));
    const result = await db.delete(conversations).where(inArray(conversations.id, ids)).returning();
    return result.length;
  }

  async bulkDeleteClients(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    await db.delete(clientActivities).where(inArray(clientActivities.clientId, ids));
    const result = await db.delete(clients).where(inArray(clients.id, ids)).returning();
    return result.length;
  }

  async updateContactStatus(id: number, status: string): Promise<Contact | undefined> {
    const [updated] = await db.update(contacts).set({ status }).where(eq(contacts.id, id)).returning();
    return updated;
  }

  async updateQuestionnaireStatus(id: number, status: string): Promise<QuestionnaireSubmission | undefined> {
    const [updated] = await db.update(questionnaireSubmissions).set({ status }).where(eq(questionnaireSubmissions.id, id)).returning();
    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id)).returning();
    return result.length > 0;
  }

  async deleteQuestionnaire(id: number): Promise<boolean> {
    const result = await db.delete(questionnaireSubmissions).where(eq(questionnaireSubmissions.id, id)).returning();
    return result.length > 0;
  }

  async bulkDeleteAppointments(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(appointments).where(inArray(appointments.id, ids)).returning();
    return result.length;
  }

  async bulkDeleteQuestionnaires(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(questionnaireSubmissions).where(inArray(questionnaireSubmissions.id, ids)).returning();
    return result.length;
  }
}

export const storage = new DatabaseStorage();
