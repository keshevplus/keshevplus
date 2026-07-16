import { users, contacts, siteSettings, translations, questionnaireSubmissions, smsVerifications, appointments, clients, clientActivities, conversations, messages, whatsappMessages, type User, type InsertUser, type Contact, type InsertContact, type SiteSetting, type Translation, type InsertTranslation, type QuestionnaireSubmission, type InsertQuestionnaireSubmission, type SmsVerification, type Appointment, type InsertAppointment, type Client, type InsertClient, type ClientActivity, type InsertClientActivity, type Conversation, type InsertConversation, type Message, type InsertMessage, type WidgetSettings, type DashboardLayout, type WhatsAppMessage, type InsertWhatsAppMessage } from "@shared/schema";
import type { AppointmentTypeHoursConfig } from "@shared/appointmentSchedule";
import { db } from "./db";
import { eq, desc, and, sql, lt, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  setResetToken(id: number, token: string | null): Promise<void>;
  clearResetToken(id: number): Promise<void>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  markContactRead(id: number): Promise<Contact | undefined>;
  markContactUnread(id: number): Promise<Contact | undefined>;
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
  getAdminBadgeCounts(): Promise<{ unreadContacts: number; pendingAppointments: number; unreviewedQuestionnaires: number; unreviewedConversations: number; newLeads: number; newLeadItems: Array<{ id: number; name: string; email: string | null; phone: string | null; leadNumber: number | null }> }>;
  getWidgetSettings(): Promise<WidgetSettings>;
  updateWidgetSettings(settings: WidgetSettings): Promise<WidgetSettings>;
  getDashboardLayout(): Promise<DashboardLayout | null>;
  updateDashboardLayout(layout: DashboardLayout): Promise<DashboardLayout>;
  getAppointmentTypeHours(): Promise<AppointmentTypeHoursConfig>;
  updateAppointmentTypeHours(config: AppointmentTypeHoursConfig): Promise<AppointmentTypeHoursConfig>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversations(): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  markConversationReviewed(id: number): Promise<Conversation | undefined>;
  markConversationUnreviewed(id: number): Promise<Conversation | undefined>;
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
  createWhatsAppMessage(message: InsertWhatsAppMessage): Promise<WhatsAppMessage>;
  getWhatsAppMessages(phone: string): Promise<WhatsAppMessage[]>;
  getWhatsAppConversations(): Promise<{ phone: string; clientId: number | null; lastMessage: string; lastMessageAt: Date; unreadCount: number }[]>;
  updateWhatsAppMessageStatus(waMessageId: string, status: string): Promise<void>;
  markClientSeen(id: number): Promise<void>;
}

function normalizeCrmEmail(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function normalizeCrmPhone(value?: string | null) {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("972")) return `0${digits.slice(3)}`;
  return digits;
}

function clientMatchesIdentity(client: Client, identity: { email?: string | null; phone?: string | null }) {
  const email = normalizeCrmEmail(identity.email);
  const phone = normalizeCrmPhone(identity.phone);
  const clientEmail = normalizeCrmEmail(client.email);
  const clientPhone = normalizeCrmPhone(client.phone);

  return (
    (!!email && !!clientEmail && clientEmail === email) ||
    (!!phone && !!clientPhone && (
      clientPhone === phone ||
      (clientPhone.length >= 7 && phone.length >= 7 && (clientPhone.endsWith(phone) || phone.endsWith(clientPhone)))
    ))
  );
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
      .set({ password: hashedPassword, mustChangePassword: false, resetToken: null } as any)
      .where(eq(users.id, id));
  }

  async setResetToken(id: number, token: string | null): Promise<void> {
    await db
      .update(users)
      .set({ resetToken: token } as any)
      .where(eq(users.id, id));
  }

  async clearResetToken(id: number): Promise<void> {
    await db
      .update(users)
      .set({ resetToken: null } as any)
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
    return await db.select().from(contacts)
      .where(and(eq(contacts.archived, false), eq(contacts.isTest, false)))
      .orderBy(desc(contacts.createdAt));
  }

  async markContactRead(id: number): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set({ read: true } as any)
      .where(eq(contacts.id, id))
      .returning();
    return contact || undefined;
  }

  async markContactUnread(id: number): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set({ read: false } as any)
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

  private async getNextCrmNumber(key: string, start: number): Promise<number> {
    const result = await db.execute(sql`
      insert into site_settings (key, value)
      values (${key}, ${JSON.stringify(start + 1)}::jsonb)
      on conflict (key)
      do update set value = to_jsonb(((site_settings.value #>> '{}')::int + 1))
      returning ((value #>> '{}')::int - 1) as number
    `);
    const row = (result.rows as Array<{ number: number }>)[0];

    return Number(row?.number || start);
  }

  private async getNextLeadNumber() {
    return this.getNextCrmNumber("crm_next_lead_number", 5000);
  }

  private async getNextClientNumber() {
    return this.getNextCrmNumber("crm_next_client_number", 200);
  }

  private async findClientByIdentity(identity: { email?: string | null; phone?: string | null }, excludeId?: number): Promise<Client | undefined> {
    const email = normalizeCrmEmail(identity.email);
    const phone = normalizeCrmPhone(identity.phone);
    if (!email && !phone) return undefined;

    const allClients = await this.getClients();
    return allClients.find((client) => client.id !== excludeId && clientMatchesIdentity(client, identity));
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
    const visible = and(eq(questionnaireSubmissions.archived, false), eq(questionnaireSubmissions.isTest, false));
    if (type) {
      return await db.select().from(questionnaireSubmissions)
        .where(and(eq(questionnaireSubmissions.type, type), visible))
        .orderBy(desc(questionnaireSubmissions.createdAt));
    }
    return await db.select().from(questionnaireSubmissions)
      .where(visible)
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
    const visible = and(eq(appointments.archived, false), eq(appointments.isTest, false));
    if (status) {
      return await db.select().from(appointments)
        .where(and(eq(appointments.status, status), visible))
        .orderBy(desc(appointments.createdAt));
    }
    return await db.select().from(appointments).where(visible).orderBy(desc(appointments.createdAt));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [a] = await db.select().from(appointments).where(eq(appointments.id, id));
    return a || undefined;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const existing = await this.getAppointment(id);
    if (!existing) return undefined;

    const updates: Partial<Appointment> = { status };
    if (status === "confirmed" && !existing.approvedAt) {
      updates.approvedAt = new Date();
    }

    const [updated] = await db.update(appointments)
      .set(updates as any)
      .where(eq(appointments.id, id))
      .returning();
    return updated || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const existing = await this.findClientByIdentity(client);
    if (existing) {
      const updates: Record<string, any> = {};
      if (client.name && existing.name !== client.name) updates.name = existing.name || client.name;
      if (client.email && !existing.email) updates.email = client.email;
      if (client.phone && !existing.phone) updates.phone = client.phone;
      if ((client as any).childName && !existing.childName) updates.childName = (client as any).childName;
      if (client.notes && !existing.notes) updates.notes = client.notes;
      if (Object.keys(updates).length > 0) {
        const [updated] = await db.update(clients).set(updates).where(eq(clients.id, existing.id)).returning();
        return updated || existing;
      }
      return existing;
    }

    const status = (client as any).status || "lead";
    const values: Record<string, any> = { ...client, status };
    if (status === "client") {
      values.clientNumber = await this.getNextClientNumber();
    } else {
      values.leadNumber = await this.getNextLeadNumber();
    }

    const [created] = await db.insert(clients).values(values as any).returning();
    return created;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients)
      .where(and(eq(clients.archived, false), eq(clients.isTest, false)))
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [c] = await db.select().from(clients).where(eq(clients.id, id));
    return c || undefined;
  }

  async updateClient(id: number, data: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = await this.getClient(id);
    if (!existing) return undefined;

    const updates: Record<string, any> = { ...data };
    const requestedStatus = (data as any).status;
    if (requestedStatus && !["lead", "client"].includes(requestedStatus)) {
      throw new Error("Invalid client status");
    }

    const nextIdentity = {
      email: updates.email !== undefined ? updates.email : existing.email,
      phone: updates.phone !== undefined ? updates.phone : existing.phone,
    };
    const duplicate = await this.findClientByIdentity(nextIdentity, id);
    if (duplicate) {
      const target = duplicate.status === "client" ? duplicate : existing;
      const source = target.id === duplicate.id ? existing : duplicate;
      const merged: Record<string, any> = {};

      if (!target.email && source.email) merged.email = source.email;
      if (!target.phone && source.phone) merged.phone = source.phone;
      if (!target.childName && source.childName) merged.childName = source.childName;
      if (!target.notes && source.notes) merged.notes = source.notes;
      if (updates.name && target.name !== updates.name) merged.name = target.name || updates.name;
      if (requestedStatus === "client" && target.status !== "client") merged.status = "client";
      if ((merged.status === "client" || target.status === "client") && !target.clientNumber) {
        merged.clientNumber = await this.getNextClientNumber();
      }

      const updatedRows = Object.keys(merged).length > 0
        ? await db.update(clients).set(merged as any).where(eq(clients.id, target.id)).returning()
        : [target];
      const [updated] = updatedRows;
      await db.update(clientActivities).set({ clientId: target.id } as any).where(eq(clientActivities.clientId, source.id));
      await db.delete(clients).where(eq(clients.id, source.id));
      return updated || target;
    }

    if (requestedStatus === "client" && existing.status !== "client" && !existing.clientNumber) {
      updates.clientNumber = await this.getNextClientNumber();
    }
    if (!requestedStatus && existing.status === "lead" && !existing.leadNumber) {
      updates.leadNumber = await this.getNextLeadNumber();
    }

    const [updated] = await db.update(clients)
      .set(updates as any)
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
    const existing = await this.findClientByIdentity({ email: data.email, phone: data.phone });
    if (existing) {
      const updates: Record<string, any> = {};
      if (data.email && !existing.email) updates.email = data.email;
      if (data.phone && !existing.phone) updates.phone = data.phone;
      if (data.childName && !existing.childName) updates.childName = data.childName;
      if (Object.keys(updates).length > 0) {
        const [updated] = await db.update(clients).set(updates).where(eq(clients.id, existing.id)).returning();
        return updated;
      }
      return existing;
    }
    const [created] = await db.insert(clients).values({
      leadNumber: await this.getNextLeadNumber(),
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

  async getAdminBadgeCounts(): Promise<{ unreadContacts: number; pendingAppointments: number; unreviewedQuestionnaires: number; unreviewedConversations: number; newLeads: number; newLeadItems: Array<{ id: number; name: string; email: string | null; phone: string | null; leadNumber: number | null }> }> {
    const [contactsNew] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(and(eq(contacts.status, "new"), eq(contacts.archived, false), eq(contacts.isTest, false)));

    const [appointmentsPending] = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(eq(appointments.status, "pending"), eq(appointments.archived, false), eq(appointments.isTest, false)));

    const [conversationsNew] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(and(eq(conversations.reviewed, false), eq(conversations.archived, false), eq(conversations.isTest, false)));

    const [questionnairesNew] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questionnaireSubmissions)
      .where(and(eq(questionnaireSubmissions.status, "new"), eq(questionnaireSubmissions.archived, false), eq(questionnaireSubmissions.isTest, false)));

    const [newLeadsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(and(eq(clients.status, "lead"), eq(clients.adminSeen, false), eq(clients.archived, false), eq(clients.isTest, false)));

    const newLeadRows = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        leadNumber: clients.leadNumber,
      })
      .from(clients)
      .where(and(eq(clients.status, "lead"), eq(clients.adminSeen, false), eq(clients.archived, false), eq(clients.isTest, false)))
      .orderBy(desc(clients.createdAt))
      .limit(10);

    return {
      unreadContacts: Number(contactsNew?.count ?? 0),
      pendingAppointments: Number(appointmentsPending?.count ?? 0),
      unreviewedConversations: Number(conversationsNew?.count ?? 0),
      unreviewedQuestionnaires: Number(questionnairesNew?.count ?? 0),
      newLeads: Number(newLeadsCount?.count ?? 0),
      newLeadItems: newLeadRows,
    };
  }

  async getWidgetSettings(): Promise<WidgetSettings> {
    const setting = await this.getSetting("widget_settings");
    if (setting) return setting.value as WidgetSettings;
    return { showChat: true, showAccessibility: true, showWhatsApp: true };
  }

  async updateWidgetSettings(settings: WidgetSettings): Promise<WidgetSettings> {
    const updated = await this.upsertSetting("widget_settings", settings);
    return updated.value as WidgetSettings;
  }

  async getDashboardLayout(): Promise<DashboardLayout | null> {
    const setting = await this.getSetting("admin_dashboard_layout");
    if (setting) return setting.value as DashboardLayout;
    return null;
  }

  async updateDashboardLayout(layout: DashboardLayout): Promise<DashboardLayout> {
    const updated = await this.upsertSetting("admin_dashboard_layout", layout);
    return updated.value as DashboardLayout;
  }

  async getAppointmentTypeHours(): Promise<AppointmentTypeHoursConfig> {
    const setting = await this.getSetting("appointment_type_hours");
    if (setting) return setting.value as AppointmentTypeHoursConfig;
    return {};
  }

  async updateAppointmentTypeHours(config: AppointmentTypeHoursConfig): Promise<AppointmentTypeHoursConfig> {
    const updated = await this.upsertSetting("appointment_type_hours", config);
    return updated.value as AppointmentTypeHoursConfig;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(conversation as any).returning();
    return created;
  }

  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(and(eq(conversations.archived, false), eq(conversations.isTest, false)))
      .orderBy(desc(conversations.createdAt));
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

  async markConversationUnreviewed(id: number): Promise<Conversation | undefined> {
    const [updated] = await db.update(conversations)
      .set({ reviewed: false } as any)
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
    const [updated] = await db.update(contacts).set({ status } as any).where(eq(contacts.id, id)).returning();
    return updated;
  }

  async updateQuestionnaireStatus(id: number, status: string): Promise<QuestionnaireSubmission | undefined> {
    const [updated] = await db.update(questionnaireSubmissions).set({ status } as any).where(eq(questionnaireSubmissions.id, id)).returning();
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

  // --- Archive (soft delete), restore, and "mark as test" ---
  // Used so manager/admin "deletes" are recoverable in the owner-only recycle bin
  // instead of immediately destroying data.

  async archiveContact(id: number): Promise<boolean> {
    const result = await db.update(contacts).set({ archived: true } as any).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }
  async bulkArchiveContacts(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.update(contacts).set({ archived: true } as any).where(inArray(contacts.id, ids)).returning();
    return result.length;
  }
  async restoreContact(id: number): Promise<boolean> {
    const result = await db.update(contacts).set({ archived: false, isTest: false } as any).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }
  async setContactTest(id: number, isTest: boolean): Promise<boolean> {
    const result = await db.update(contacts).set({ isTest } as any).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }

  async archiveConversation(id: number): Promise<boolean> {
    const result = await db.update(conversations).set({ archived: true } as any).where(eq(conversations.id, id)).returning();
    return result.length > 0;
  }
  async bulkArchiveConversations(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.update(conversations).set({ archived: true } as any).where(inArray(conversations.id, ids)).returning();
    return result.length;
  }
  async restoreConversation(id: number): Promise<boolean> {
    const result = await db.update(conversations).set({ archived: false, isTest: false } as any).where(eq(conversations.id, id)).returning();
    return result.length > 0;
  }
  async setConversationTest(id: number, isTest: boolean): Promise<boolean> {
    const result = await db.update(conversations).set({ isTest } as any).where(eq(conversations.id, id)).returning();
    return result.length > 0;
  }

  async archiveClient(id: number): Promise<boolean> {
    const result = await db.update(clients).set({ archived: true } as any).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }
  async bulkArchiveClients(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.update(clients).set({ archived: true } as any).where(inArray(clients.id, ids)).returning();
    return result.length;
  }
  async restoreClient(id: number): Promise<boolean> {
    const result = await db.update(clients).set({ archived: false, isTest: false } as any).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }
  async setClientTest(id: number, isTest: boolean): Promise<boolean> {
    const result = await db.update(clients).set({ isTest } as any).where(eq(clients.id, id)).returning();
    return result.length > 0;
  }

  async archiveAppointment(id: number): Promise<boolean> {
    const result = await db.update(appointments).set({ archived: true } as any).where(eq(appointments.id, id)).returning();
    return result.length > 0;
  }
  async bulkArchiveAppointments(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.update(appointments).set({ archived: true } as any).where(inArray(appointments.id, ids)).returning();
    return result.length;
  }
  async restoreAppointment(id: number): Promise<boolean> {
    const result = await db.update(appointments).set({ archived: false, isTest: false } as any).where(eq(appointments.id, id)).returning();
    return result.length > 0;
  }
  async setAppointmentTest(id: number, isTest: boolean): Promise<boolean> {
    const result = await db.update(appointments).set({ isTest } as any).where(eq(appointments.id, id)).returning();
    return result.length > 0;
  }

  async archiveQuestionnaire(id: number): Promise<boolean> {
    const result = await db.update(questionnaireSubmissions).set({ archived: true } as any).where(eq(questionnaireSubmissions.id, id)).returning();
    return result.length > 0;
  }
  async bulkArchiveQuestionnaires(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.update(questionnaireSubmissions).set({ archived: true } as any).where(inArray(questionnaireSubmissions.id, ids)).returning();
    return result.length;
  }
  async restoreQuestionnaire(id: number): Promise<boolean> {
    const result = await db.update(questionnaireSubmissions).set({ archived: false, isTest: false } as any).where(eq(questionnaireSubmissions.id, id)).returning();
    return result.length > 0;
  }
  async setQuestionnaireTest(id: number, isTest: boolean): Promise<boolean> {
    const result = await db.update(questionnaireSubmissions).set({ isTest } as any).where(eq(questionnaireSubmissions.id, id)).returning();
    return result.length > 0;
  }

  async getBinItems(): Promise<Array<{ type: string; id: number; label: string; archived: boolean; isTest: boolean; createdAt: Date }>> {
    const hidden = (archived: boolean, isTest: boolean) => archived || isTest;

    const [contactRows, conversationRows, clientRows, appointmentRows, questionnaireRows] = await Promise.all([
      db.select().from(contacts).where(sql`${contacts.archived} = true OR ${contacts.isTest} = true`),
      db.select().from(conversations).where(sql`${conversations.archived} = true OR ${conversations.isTest} = true`),
      db.select().from(clients).where(sql`${clients.archived} = true OR ${clients.isTest} = true`),
      db.select().from(appointments).where(sql`${appointments.archived} = true OR ${appointments.isTest} = true`),
      db.select().from(questionnaireSubmissions).where(sql`${questionnaireSubmissions.archived} = true OR ${questionnaireSubmissions.isTest} = true`),
    ]);

    const items = [
      ...contactRows.map(r => ({ type: "contact", id: r.id, label: r.name, archived: r.archived, isTest: r.isTest, createdAt: r.createdAt })),
      ...conversationRows.map(r => ({ type: "conversation", id: r.id, label: r.visitorName, archived: r.archived, isTest: r.isTest, createdAt: r.createdAt })),
      ...clientRows.map(r => ({ type: "client", id: r.id, label: r.name, archived: r.archived, isTest: r.isTest, createdAt: r.createdAt })),
      ...appointmentRows.map(r => ({ type: "appointment", id: r.id, label: r.clientName, archived: r.archived, isTest: r.isTest, createdAt: r.createdAt })),
      ...questionnaireRows.map(r => ({ type: "questionnaire", id: r.id, label: r.respondentName, archived: r.archived, isTest: r.isTest, createdAt: r.createdAt })),
    ].filter(item => hidden(item.archived, item.isTest));

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async permanentlyDeleteBinItem(type: string, id: number): Promise<boolean> {
    switch (type) {
      case "contact": return this.deleteContact(id);
      case "conversation": return this.deleteConversation(id);
      case "client": return this.deleteClient(id);
      case "appointment": return this.deleteAppointment(id);
      case "questionnaire": return this.deleteQuestionnaire(id);
      default: throw new Error(`Unknown bin item type: ${type}`);
    }
  }

  async restoreBinItem(type: string, id: number): Promise<boolean> {
    switch (type) {
      case "contact": return this.restoreContact(id);
      case "conversation": return this.restoreConversation(id);
      case "client": return this.restoreClient(id);
      case "appointment": return this.restoreAppointment(id);
      case "questionnaire": return this.restoreQuestionnaire(id);
      default: throw new Error(`Unknown bin item type: ${type}`);
    }
  }

  async createWhatsAppMessage(message: InsertWhatsAppMessage): Promise<WhatsAppMessage> {
    const [msg] = await db.insert(whatsappMessages).values(message as any).returning();
    return msg;
  }

  async getWhatsAppMessages(phone: string): Promise<WhatsAppMessage[]> {
    return await db.select().from(whatsappMessages).where(eq(whatsappMessages.phone, phone)).orderBy(whatsappMessages.createdAt);
  }

  async getWhatsAppConversations(): Promise<{ phone: string; clientId: number | null; lastMessage: string; lastMessageAt: Date; unreadCount: number }[]> {
    const result = await db.execute(sql`
      SELECT 
        phone,
        (SELECT client_id FROM whatsapp_messages w2 WHERE w2.phone = w.phone AND w2.client_id IS NOT NULL LIMIT 1) as client_id,
        (SELECT content FROM whatsapp_messages w3 WHERE w3.phone = w.phone ORDER BY w3.created_at DESC LIMIT 1) as last_message,
        MAX(created_at) as last_message_at,
        COUNT(*) FILTER (WHERE direction = 'inbound' AND status != 'read') as unread_count
      FROM whatsapp_messages w
      GROUP BY phone
      ORDER BY MAX(created_at) DESC
    `);
    return (result.rows as any[]).map(r => ({
      phone: r.phone,
      clientId: r.client_id ? Number(r.client_id) : null,
      lastMessage: r.last_message || '',
      lastMessageAt: new Date(r.last_message_at),
      unreadCount: Number(r.unread_count || 0),
    }));
  }

  async markClientSeen(id: number): Promise<void> {
    await db.update(clients).set({ adminSeen: true } as any).where(eq(clients.id, id));
  }

  async updateWhatsAppMessageStatus(waMessageId: string, status: string): Promise<void> {
    await db.update(whatsappMessages).set({ status } as any).where(eq(whatsappMessages.waMessageId, waMessageId));
  }
}

export const storage = new DatabaseStorage();
