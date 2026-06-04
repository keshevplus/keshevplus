import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

const DATABASE_URL_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "KESHEVPLUS_POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "KESHEVPLUS_POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "KESHEVPLUS_POSTGRES_URL_NON_POOLING",
  "KESHEVPLUS_DATABASE_URL",
];

function loadLocalEnv() {
  if (!fs.existsSync(".env")) return;

  const lines = fs.readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function getDatabaseUrl() {
  for (const key of DATABASE_URL_ENV_KEYS) {
    if (process.env[key]) return process.env[key];
  }
  throw new Error(`Missing database URL. Set one of: ${DATABASE_URL_ENV_KEYS.join(", ")}`);
}

async function ensureSchema(client) {
  await client.query("begin");
  try {
    await client.query(`
      create table if not exists users (
        id serial primary key,
        email text unique,
        password text,
        role text not null default 'user',
        must_change_password boolean not null default false,
        reset_token text
      );

      alter table users add column if not exists email text;
      alter table users add column if not exists password text;
      alter table users add column if not exists role text not null default 'user';
      alter table users add column if not exists must_change_password boolean not null default false;
      alter table users add column if not exists reset_token text;
      update users set password = password_hash where password is null and password_hash is not null;

      do $$
      begin
        if exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'users' and column_name = 'name'
        ) then
          alter table users alter column name drop not null;
        end if;

        if exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'users' and column_name = 'password_hash'
        ) then
          alter table users alter column password_hash drop not null;
        end if;
      end $$;

      create unique index if not exists users_email_unique_idx on users (email);

      create table if not exists contacts (
        id serial primary key,
        name text not null,
        phone text not null,
        email text,
        message text not null,
        created_at timestamp not null default now(),
        read boolean not null default false,
        status text not null default 'new'
      );

      create table if not exists site_settings (
        id serial primary key,
        key text not null unique,
        value jsonb not null
      );

      create table if not exists translations (
        id serial primary key,
        key text,
        language text,
        value text
      );

      alter table translations add column if not exists key text;
      alter table translations add column if not exists language text;
      alter table translations add column if not exists value text;
      do $$
      begin
        if exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'translations' and column_name = 'translation_key'
        ) then
          update translations
          set
            key = coalesce(key, translation_key::text),
            language = coalesce(language, language_code::text),
            value = coalesce(value, translation_value::text)
          where key is null or language is null or value is null;
        end if;

        if exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'translations' and column_name = 'language_code'
        ) then
          alter table translations alter column language_code drop not null;
        end if;

        if exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'translations' and column_name = 'language_name'
        ) then
          alter table translations alter column language_name drop not null;
        end if;

        if exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'translations' and column_name = 'translation_key'
        ) then
          alter table translations alter column translation_key drop not null;
        end if;

        if exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'translations' and column_name = 'translation_value'
        ) then
          alter table translations alter column translation_value drop not null;
        end if;
      end $$;

      create unique index if not exists translations_key_language_idx
        on translations (key, language);

      create table if not exists questionnaire_submissions (
        id serial primary key,
        type text not null,
        respondent_name text not null,
        respondent_email text not null,
        respondent_phone text not null,
        child_name text,
        child_age integer,
        child_gender text,
        relationship text,
        answers jsonb not null,
        scores jsonb,
        notes text,
        created_at timestamp not null default now(),
        reviewed boolean not null default false,
        status text not null default 'new'
      );

      create table if not exists sms_verifications (
        id serial primary key,
        phone text not null,
        code text not null,
        expires_at timestamp not null,
        verified boolean not null default false,
        created_at timestamp not null default now()
      );

      create table if not exists appointments (
        id serial primary key,
        client_name text not null,
        client_email text not null,
        client_phone text not null,
        child_name text,
        date text not null,
        time text not null,
        type text not null default 'consultation',
        status text not null default 'pending',
        notes text,
        created_at timestamp not null default now()
      );

      create table if not exists clients (
        id serial primary key,
        name text not null,
        email text,
        phone text,
        notes text,
        status text not null default 'lead',
        source text not null default 'manual',
        child_name text,
        created_at timestamp not null default now()
      );

      create table if not exists client_activities (
        id serial primary key,
        client_id integer not null,
        type text not null,
        description text not null,
        metadata jsonb,
        created_at timestamp not null default now()
      );

      create table if not exists conversations (
        id serial primary key,
        visitor_name text not null,
        visitor_email text not null,
        visitor_phone text default '',
        title text not null,
        reviewed boolean not null default false,
        created_at timestamp not null default current_timestamp
      );

      create table if not exists messages (
        id serial primary key,
        conversation_id integer,
        role text,
        content text,
        created_at timestamp not null default current_timestamp
      );

      alter table messages add column if not exists conversation_id integer;
      alter table messages add column if not exists role text;
      alter table messages add column if not exists content text;
      alter table messages add column if not exists created_at timestamp not null default current_timestamp;

      create table if not exists whatsapp_messages (
        id serial primary key,
        client_id integer,
        wa_message_id text,
        phone text not null,
        direction text not null default 'inbound',
        content text not null,
        media_url text,
        status text not null default 'sent',
        raw_payload jsonb,
        created_at timestamp not null default now()
      );

      create table if not exists user_sessions (
        sid varchar not null primary key,
        sess json not null,
        expire timestamp(6) not null
      );
      create index if not exists IDX_user_sessions_expire on user_sessions (expire);
    `);

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

loadLocalEnv();
const client = new Client({ connectionString: getDatabaseUrl() });

try {
  await client.connect();
  await ensureSchema(client);
  const { rows } = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name = any($1::text[])
    order by table_name
  `, [[
    "appointments",
    "clients",
    "contacts",
    "questionnaire_submissions",
    "site_settings",
    "translations",
    "users",
    "user_sessions",
  ]]);
  console.log(`Neon schema ready. Verified tables: ${rows.map((row) => row.table_name).join(", ")}`);
} finally {
  await client.end();
}
