import {
    pgTable,
    serial,
    text,
    varchar,
    timestamp,
    boolean,
    index,
} from 'drizzle-orm/pg-core';

// Page content table
export const pageContent = pgTable('page_content', {
    id: serial('id').primaryKey(),
    pageKey: varchar('page_key', { length: 50 }).notNull().unique(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Translations table with compound index
export const translations = pgTable(
    'translations',
    {
        id: serial('id').primaryKey(),
        language: varchar('language', { length: 10 }).notNull(),
        namespace: varchar('namespace', { length: 50 }).notNull(),
        key: varchar('key', { length: 255 }).notNull(),
        value: text('value').notNull(),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow(),
    },
    (table) => {
        return {
            languageNamespaceKeyIdx: index('translations_idx').on(
                table.language,
                table.namespace,
                table.key
            ),
        };
    }
);

// Users table with named indexes
export const users = pgTable(
    'users',
    {
        id: serial('id').primaryKey(),
        username: text('username').notNull().unique(),
        email: text('email').notNull().unique(),
        password: text('password').notNull(),
        fullName: text('full_name'),
        role: text('role').default('user'),
        isAdmin: boolean('is_admin').default(false),
        createdAt: timestamp('created_at').defaultNow(),
    },
    (table) => {
        return {
            emailIdx: index('users_email_idx').on(table.email),
            usernameIdx: index('users_username_idx').on(table.username),
        };
    }
);

// Leads table
export const leads = pgTable('leads', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone').notNull(),
    subject: text('subject'),
    message: text('message').notNull(),
    dateReceived: timestamp('date_received').defaultNow(),
});
