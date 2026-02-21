--
-- PostgreSQL database dump
--

\restrict a6EwMjPhZCrhytk6fJ1vnlj85mZd1Z9UbbzcI13ESMRJeAtRtxbRePHohP41mN0

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_conversations_id_fk;
DROP INDEX IF EXISTS public.translations_key_language_idx;
ALTER TABLE IF EXISTS ONLY public.whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.translations DROP CONSTRAINT IF EXISTS translations_pkey;
ALTER TABLE IF EXISTS ONLY public.sms_verifications DROP CONSTRAINT IF EXISTS sms_verifications_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_key_unique;
ALTER TABLE IF EXISTS ONLY public.questionnaire_submissions DROP CONSTRAINT IF EXISTS questionnaire_submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.contacts DROP CONSTRAINT IF EXISTS contacts_pkey;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_pkey;
ALTER TABLE IF EXISTS ONLY public.client_activities DROP CONSTRAINT IF EXISTS client_activities_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS public.whatsapp_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.translations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sms_verifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.site_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.questionnaire_submissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.conversations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contacts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.clients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.client_activities ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.appointments ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.whatsapp_messages_id_seq;
DROP TABLE IF EXISTS public.whatsapp_messages;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.translations_id_seq;
DROP TABLE IF EXISTS public.translations;
DROP SEQUENCE IF EXISTS public.sms_verifications_id_seq;
DROP TABLE IF EXISTS public.sms_verifications;
DROP SEQUENCE IF EXISTS public.site_settings_id_seq;
DROP TABLE IF EXISTS public.site_settings;
DROP SEQUENCE IF EXISTS public.questionnaire_submissions_id_seq;
DROP TABLE IF EXISTS public.questionnaire_submissions;
DROP SEQUENCE IF EXISTS public.messages_id_seq;
DROP TABLE IF EXISTS public.messages;
DROP SEQUENCE IF EXISTS public.conversations_id_seq;
DROP TABLE IF EXISTS public.conversations;
DROP SEQUENCE IF EXISTS public.contacts_id_seq;
DROP TABLE IF EXISTS public.contacts;
DROP SEQUENCE IF EXISTS public.clients_id_seq;
DROP TABLE IF EXISTS public.clients;
DROP SEQUENCE IF EXISTS public.client_activities_id_seq;
DROP TABLE IF EXISTS public.client_activities;
DROP SEQUENCE IF EXISTS public.appointments_id_seq;
DROP TABLE IF EXISTS public.appointments;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    client_name text NOT NULL,
    client_email text NOT NULL,
    client_phone text NOT NULL,
    date text NOT NULL,
    "time" text NOT NULL,
    type text DEFAULT 'consultation'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    child_name text
);


--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: client_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_activities (
    id integer NOT NULL,
    client_id integer NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: client_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_activities_id_seq OWNED BY public.client_activities.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'lead'::text NOT NULL,
    source text DEFAULT 'manual'::text NOT NULL,
    child_name text
);


--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    read boolean DEFAULT false NOT NULL,
    status text DEFAULT 'new'::text NOT NULL
);


--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    title text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    visitor_name text NOT NULL,
    visitor_email text NOT NULL,
    visitor_phone text DEFAULT ''::text,
    reviewed boolean DEFAULT false NOT NULL
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: questionnaire_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questionnaire_submissions (
    id integer NOT NULL,
    type text NOT NULL,
    respondent_name text NOT NULL,
    respondent_email text NOT NULL,
    respondent_phone text NOT NULL,
    child_name text,
    child_age integer,
    child_gender text,
    relationship text,
    answers jsonb NOT NULL,
    scores jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    reviewed boolean DEFAULT false NOT NULL,
    status text DEFAULT 'new'::text NOT NULL
);


--
-- Name: questionnaire_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.questionnaire_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questionnaire_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.questionnaire_submissions_id_seq OWNED BY public.questionnaire_submissions.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL
);


--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: sms_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sms_verifications (
    id integer NOT NULL,
    phone text NOT NULL,
    code text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sms_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sms_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sms_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sms_verifications_id_seq OWNED BY public.sms_verifications.id;


--
-- Name: translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.translations (
    id integer NOT NULL,
    key text NOT NULL,
    language text NOT NULL,
    value text NOT NULL
);


--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    must_change_password boolean DEFAULT false NOT NULL,
    reset_token text
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: whatsapp_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_messages (
    id integer NOT NULL,
    client_id integer,
    wa_message_id text,
    phone text NOT NULL,
    direction text DEFAULT 'inbound'::text NOT NULL,
    content text NOT NULL,
    media_url text,
    status text DEFAULT 'sent'::text NOT NULL,
    raw_payload jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.whatsapp_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.whatsapp_messages_id_seq OWNED BY public.whatsapp_messages.id;


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: client_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_activities ALTER COLUMN id SET DEFAULT nextval('public.client_activities_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: questionnaire_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questionnaire_submissions ALTER COLUMN id SET DEFAULT nextval('public.questionnaire_submissions_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: sms_verifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_verifications ALTER COLUMN id SET DEFAULT nextval('public.sms_verifications_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: whatsapp_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_messages ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_messages_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, client_name, client_email, client_phone, date, "time", type, status, notes, created_at, child_name) FROM stdin;
\.


--
-- Data for Name: client_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.client_activities (id, client_id, type, description, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clients (id, name, email, phone, notes, created_at, status, source, child_name) FROM stdin;
9	Alon Kochav Raifman	alonkochav@gmail.com	0544777469	\N	2026-02-12 15:29:17.05365	lead	contact_form	\N
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contacts (id, name, phone, email, message, created_at, read, status) FROM stdin;
12	Alon Kochav Raifman	0544777469	alonkochav@gmail.com	Moxo כמה עולה ?	2026-02-12 15:29:16.753583	t	new
13	Alon Kochav Raifman	0544777469	alonkochav@gmail.com	Fggvgggyyyyyyy	2026-02-15 07:20:05.997559	f	new
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, title, created_at, visitor_name, visitor_email, visitor_phone, reviewed) FROM stdin;
284	אלון - 12.2.2026	2026-02-12 16:19:11.218882	אלון	alonkochav@gmail.com		f
285	אלון - 12.2.2026	2026-02-12 17:39:12.423771	אלון	alonkochav@gmail.com		f
286	אלון כוכב רייפמן - 13.2.2026	2026-02-13 08:07:18.459819	אלון כוכב רייפמן	alonkochav@gmail.com	0544777469	f
287	אלון כוכב רייפמן - 14.2.2026	2026-02-14 08:16:39.244131	אלון כוכב רייפמן	alonkochav@gmail.com	0544777469	f
288	אלון - 14.2.2026	2026-02-14 08:17:29.999264	אלון	alonkochav@gmail.com		f
289	אלון כוכב רייפמן - 14.2.2026	2026-02-14 08:18:39.357068	אלון כוכב רייפמן	alonkochav@gmail.com	0544777469	f
290	אלון - 14.2.2026	2026-02-14 08:19:27.394067	אלון	alonkochav@gmail.com		f
291	אלון - 14.2.2026	2026-02-14 08:29:56.916715	אלון	alonkochav@gmail.com		f
292	אלון - 14.2.2026	2026-02-14 08:35:00.034438	אלון	alonkochav@gmail.com		f
293	אלון - 14.2.2026	2026-02-14 08:35:29.547074	אלון	alonkochav@gmail.com		f
294	אלון כוכב רייפמן - 14.2.2026	2026-02-14 08:36:10.000297	אלון כוכב רייפמן	alonkochav@gmail.com	0544777469	f
295	אלון - 14.2.2026	2026-02-14 08:37:26.743558	אלון	alonkochav@gmail.com		f
296	אלון - 14.2.2026	2026-02-14 09:03:38.015569	אלון	alonkochav@gmail.com		f
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, role, content, created_at) FROM stdin;
17	284	user	היי	2026-02-12 16:19:12.167765
18	285	user	Hi	2026-02-12 17:39:13.010556
19	286	user	Hi	2026-02-13 08:07:18.71243
20	287	user	Hi	2026-02-14 08:16:39.495215
21	288	user	היי	2026-02-14 08:17:30.28006
22	289	user	ינבב	2026-02-14 08:18:39.598737
23	289	user	למה	2026-02-14 08:18:48.183834
24	290	user	היי	2026-02-14 08:19:27.623134
25	291	user	Hi	2026-02-14 08:29:57.157878
26	292	user	היי	2026-02-14 08:35:00.252725
27	293	user	היי	2026-02-14 08:35:29.793862
28	294	user	יכעלעע	2026-02-14 08:36:10.278753
29	295	user	מהעת	2026-02-14 08:37:26.985555
30	296	user	היי	2026-02-14 09:03:38.261549
\.


--
-- Data for Name: questionnaire_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.questionnaire_submissions (id, type, respondent_name, respondent_email, respondent_phone, child_name, child_age, child_gender, relationship, answers, scores, notes, created_at, reviewed, status) FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, key, value) FROM stdin;
2	emailNotifications	{"contactForm": true, "appointments": true, "questionnaires": true}
1	language	{"mode": "multilingual", "enabled": false, "defaultLanguage": "he"}
\.


--
-- Data for Name: sms_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sms_verifications (id, phone, code, expires_at, verified, created_at) FROM stdin;
\.


--
-- Data for Name: translations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.translations (id, key, language, value) FROM stdin;
1	nav.home	en	Home
2	nav.about	en	About Us
3	nav.services	en	Services
4	nav.adhd	en	What is ADHD?
5	nav.process	en	Diagnosis Process
6	nav.faq	en	FAQ
7	nav.questionnaires	en	Questionnaires
8	nav.contact	en	Contact
9	hero.title	en	Welcome to
10	hero.clinic	en	"Keshev Plus" Clinic
11	hero.subtitle	en	Children • Teens • Adults
12	hero.description	en	At "Keshev Plus" you will receive accurate diagnosis\nand personalized treatment plan
13	hero.step	en	The first step starts here
14	hero.consultation	en	Schedule a consultation - discover the path to success
15	hero.read_more	en	Read More About Us
16	hero.start_diagnosis	en	Start Diagnosis Now
17	hero.ready_title	en	Ready to Begin?
18	hero.ready_text	en	Contact us today to schedule your diagnosis and take the first step\ntowards a better life.
19	hero.contact_now	en	Contact Us Now
82	about.doctor_name	en	Dr. IrIne Kochav-Raifman
1396	contact.email_placeholder	he	דוא"ל
1397	contact.phone_placeholder	he	מספר טלפון
1398	contact.topic_label	he	נושא הפנייה
1399	contact.topic_option1	he	אבחון ADHD
1400	contact.topic_option2	he	מבחן MOXO
1401	contact.topic_option3	he	אחר
1402	contact.address_label	he	כתובת:
1403	contact.email_label	he	דוא"ל:
1404	contact.details_title	he	פרטי התקשרות
1405	contact.directions_title	he	דרכי הגעה ואפשרויות חניה
1406	contact.clear_form	he	ניקוי טופס
823	contact.address_line1	ru	Алон Тауэрс 1, Этаж 12, Офис 1202
824	contact.address_line2	ru	Игаль Алон 94, Тель-Авив
1474	contact.email_placeholder	ar	البريد الإلكتروني
1475	contact.phone_placeholder	ar	رقم الهاتف
1476	contact.topic_label	ar	اختر موضوعًا
1477	contact.topic_option1	ar	تشخيص ADHD
1478	contact.topic_option2	ar	اختبار MOXO
1479	contact.topic_option3	ar	أخرى
1480	contact.address_label	ar	العنوان:
1481	contact.email_label	ar	البريد:
1482	contact.details_title	ar	تفاصيل الاتصال
1483	contact.directions_title	ar	الاتجاهات ومواقف السيارات
1484	contact.clear_form	ar	مسح النموذج
1089	contact.address_line1	ar	أبراج ألون 1، الطابق 12، مكتب 1202
1090	contact.address_line2	ar	يغئال ألون 94، تل أبيب
1487	contact.email_placeholder	am	ኢሜይል
1488	contact.phone_placeholder	am	ስልክ ቁጥር
1489	contact.topic_label	am	ርዕስ ይምረጡ
1490	contact.topic_option1	am	የADHD ምርመራ
1491	contact.topic_option2	am	የMOXO ፈተና
1492	contact.topic_option3	am	ሌላ
1493	contact.address_label	am	አድራሻ:
1494	contact.email_label	am	ኢሜይል:
1495	contact.details_title	am	የመገናኛ ዝርዝሮች
1496	contact.directions_title	am	አቅጣጫዎች እና ማቆሚያ
1497	contact.clear_form	am	ቅጹን ያጽዱ
956	contact.address_line1	am	አሎን ታወርስ 1, ፎቅ 12, ቢሮ 1202
957	contact.address_line2	am	ይጋል አሎን 94, ቴል አቪቭ
1500	contact.email_placeholder	yi	בליצפּאָסט
1501	contact.phone_placeholder	yi	טעלעפֿאָן נומער
1502	contact.topic_label	yi	קלויבט אַ טעמע
1503	contact.topic_option1	yi	ADHD דיאַגנאָז
1504	contact.topic_option2	yi	MOXO טעסט
1505	contact.topic_option3	yi	אַנדערע
1506	contact.address_label	yi	אַדרעס:
1507	contact.email_label	yi	בליצפּאָסט:
1508	contact.details_title	yi	קאָנטאַקט פּרטים
1509	contact.directions_title	yi	ריכטונגען און פּאַרקירונג
1510	contact.clear_form	yi	ריין דעם פֿאָרם
1222	contact.address_line1	yi	אלון טאַוערס 1, שטאָק 12, ביוראָ 1202
1223	contact.address_line2	yi	יגאל אלון 94, תל אביב
1513	contact.email_placeholder	it	Email
1514	contact.phone_placeholder	it	Numero di telefono
1515	contact.topic_label	it	Seleziona un argomento
1516	contact.topic_option1	it	Diagnosi ADHD
1517	contact.topic_option2	it	Test MOXO
1518	contact.topic_option3	it	Altro
1519	contact.address_label	it	Indirizzo:
80	about.title	en	About Us
81	about.subtitle	en	Specialists in ADHD Diagnosis and Treatment
83	about.doctor_title	en	Specialist Physician
84	about.doctor_desc	en	Extensive experience in diagnosing children, adolescents, and adults. Has accompanied many patients on their journey to personal fulfillment and optimal functioning.
85	about.doctor_alt	en	Dr. Irene Kochav-Reifman
86	about.credential1	en	ADHD Diagnosis and Treatment Specialist
87	about.credential2	en	Over 15 years of experience
88	about.credential3	en	Specialization in children, teens, and adults
89	about.mission	en	Our mission is to provide accurate diagnosis and personalized treatment plans, enabling our patients to reach their full personal potential.
90	about.value1_title	en	Personal Approach
91	about.value1_desc	en	Every patient receives personalized attention tailored to their unique needs
92	about.value2_title	en	Professionalism
93	about.value2_desc	en	Expert team with extensive experience and continuous updates
1520	contact.email_label	it	Email:
94	about.value3_title	en	Discretion
95	about.value3_desc	en	Complete privacy protection and safe environment
96	services.title	en	Our Services
97	services.service1_title	en	Comprehensive Diagnosis
98	services.service1_desc	en	Personalized diagnosis using advanced tools, clinical interviews, and computerized tests
99	services.service2_title	en	Medication Adjustment
100	services.service2_desc	en	Personalized pharmacological treatment with ongoing safety monitoring
101	services.service3_title	en	MOXO Computerized Test
102	services.service3_desc	en	Objective assessment of attention and concentration functions
103	services.service4_title	en	Consultation & Follow-up
104	services.service4_desc	en	Continuous professional support and treatment monitoring
105	services.service5_title	en	Referrals to Complementary Treatments
106	services.service5_desc	en	Referrals to occupational therapy, emotional therapy, or psychological support
107	services.step1_title	en	Contact
108	services.step1_desc	en	Initial contact by phone or through the website form
109	services.step2_title	en	Initial Consultation
110	services.step2_desc	en	Initial interview, medical history collection, and questionnaire completion
111	services.step3_title	en	Comprehensive Assessment
112	services.step3_desc	en	Computerized testing and in-depth clinical evaluation
113	services.step4_title	en	Report & Treatment Plan
114	services.step4_desc	en	Receive detailed report and personalized treatment recommendations
115	services.list_label	en	Our services
116	contact.title	en	Contact Us
117	contact.phone	en	055-27-399-27
118	contact.email	en	info@keshevplus.co.il
119	contact.address	en	Tel Aviv, Israel
120	questionnaires.title	en	Questionnaires
121	questionnaires.subtitle	en	Questionnaires for identifying signs of ADHD
122	questionnaires.parent_form	en	Parent Questionnaire
123	questionnaires.parent_form_desc	en	This questionnaire is designed for parents and provides insights into the child's behavior at home and in the family environment.
124	questionnaires.teacher_form	en	Teacher Questionnaire
125	questionnaires.teacher_form_desc	en	This questionnaire is designed for teachers and provides insights into the child's behavior in the classroom and educational environment.
126	questionnaires.self_report	en	Self-Report Questionnaire
127	questionnaires.self_report_desc	en	This questionnaire is designed for adults over 18 to assess attention deficit and hyperactivity disorders.
128	questionnaires.note	en	You can download the questionnaires and fill them out before your appointment at the clinic
129	questionnaires.download_files	en	Download Files
130	questionnaires.download_pdf	en	Download PDF
131	questionnaires.download_word	en	Download Word
132	questionnaires.fill_online	en	Fill Out Online
133	adhd.subtitle	en	ADHD (Attention Deficit Hyperactivity Disorder) is a neurodevelopmental disorder that affects both children and adults
134	adhd.symptom1_title	en	Difficulty Concentrating
135	adhd.symptom1_desc	en	Trouble maintaining focus over time, easy distractibility, and forgetfulness
136	adhd.symptom2_title	en	Hyperactivity
137	adhd.symptom2_desc	en	Restlessness, difficulty sitting still, and a feeling of internal unease
138	adhd.symptom3_title	en	Impulsivity
139	adhd.symptom3_desc	en	Difficulty with self-control, making quick decisions without forethought
140	adhd.symptom4_title	en	Social Challenges
141	adhd.symptom4_desc	en	Difficulty with social communication, forming and maintaining relationships
142	adhd.treatable_title	en	ADHD is Treatable!
143	adhd.treatable_desc	en	With accurate diagnosis and a personalized treatment plan, quality of life can be significantly improved. The first step is reaching out to a specialist.
144	faq.title	en	Frequently Asked Questions
145	faq.subtitle	en	Answers to the most common questions
146	faq.no_answer	en	Didn't find your answer? Contact us
147	faq.q1	en	What is ADHD?
148	faq.a1	en	ADHD (Attention Deficit Hyperactivity Disorder) is a neurodevelopmental disorder affecting concentration, impulse control, and activity regulation. It is common in both children and adults and affects daily functioning, studies, and work.
149	faq.q2	en	How long does the diagnosis process take?
150	faq.a2	en	The full diagnosis process includes several sessions and takes an average of 2-4 weeks. It includes an in-depth clinical interview, computerized tests (MOXO), questionnaires, and review of relevant medical documents.
151	faq.q3	en	Is the diagnosis suitable for all ages?
152	faq.a3	en	Yes, we provide professional diagnosis for children from age 6, teenagers, and adults. Each age group has a tailored assessment protocol that considers the unique characteristics of that age.
153	faq.q4	en	What is included in the treatment plan?
154	faq.a4	en	The treatment plan is personalized and includes: medication recommendations (if needed), parent guidance, practical daily coping tools, referrals to complementary treatments, and ongoing follow-up.
155	faq.q5	en	Is a doctor's referral required?
156	faq.a5	en	No, a referral is not required. You can contact the clinic directly to schedule a diagnosis appointment. However, if you have previous medical documents, it is recommended to bring them to the first meeting.
157	faq.q6	en	What is the difference between ADD and ADHD?
158	faq.a6	en	ADD is the old term for attention deficit without hyperactivity. Today, the term ADHD is used with three subtypes: predominantly inattentive, predominantly hyperactive-impulsive, or combined.
159	services.process_steps	en	Diagnosis process steps
160	footer.rights	en	© 2025 All rights reserved to Keshev Plus
161	admin.dashboard	en	Admin Dashboard
162	admin.welcome	en	Welcome back
163	admin.signout	en	Sign Out
164	admin.language_settings	en	Language Settings
165	admin.multilingual_support	en	Multilingual Support
166	admin.multilingual_desc	en	Enable or disable the language selector on the website
167	admin.language_mode	en	Language Mode
168	admin.bilingual	en	Bilingual (Hebrew / English)
169	admin.multilingual	en	Multilingual (All languages)
170	admin.default_language	en	Default Language
171	admin.settings_saved	en	Settings saved successfully
172	admin.settings_error	en	Failed to save settings
173	nav.home	he	בית
174	nav.about	he	אודותינו
175	nav.services	he	שירותים
176	nav.adhd	he	מה זה ADHD?
177	nav.process	he	תהליך האבחון
178	nav.faq	he	שאלות נפוצות
179	nav.questionnaires	he	שאלונים
180	nav.contact	he	יצירת קשר
181	hero.title	he	ברוכים הבאים למרפאת
182	hero.clinic	he	"קשב פלוס"
183	hero.subtitle	he	בילדים • בבני נוער • במבוגרים
184	hero.description	he	ב"קשב פלוס" תקבלו אבחון מדויק\nותוכנית טיפול אישית
185	hero.step	he	הצעד הראשון מתחיל כאן
186	hero.consultation	he	קבעו פגישת ייעוץ - בואו לגלות את הדרך להצלחה
187	hero.read_more	he	קראו עוד עלינו
188	hero.start_diagnosis	he	התחל/י את האבחון עכשיו
189	hero.ready_title	he	מוכנים להתחיל?
190	hero.ready_text	he	פנה/י אלינו היום כדי לקבוע את האבחון שלך ולקחת את הצעד הראשון\nלקראת חיים טובים יותר.
191	hero.contact_now	he	צרו קשר עכשיו
238	contact.address_line1	he	מגדלי אלון 1, קומה 12, משרד 1202
239	contact.address_line2	he	יגאל אלון 94, תל אביב
1409	contact.email_placeholder	en	Email
1410	contact.phone_placeholder	en	Phone number
1411	contact.topic_label	en	Select a topic
1412	contact.topic_option1	en	ADHD Diagnosis
1413	contact.topic_option2	en	MOXO Test
1414	contact.topic_option3	en	Other
1415	contact.address_label	en	Address:
1416	contact.email_label	en	Email:
1417	contact.details_title	en	Contact Details
1418	contact.directions_title	en	Directions & Parking
1419	contact.clear_form	en	Clear form
1422	contact.email_placeholder	fr	E-mail
1423	contact.phone_placeholder	fr	Numéro de téléphone
1424	contact.topic_label	fr	Sélectionnez un sujet
1425	contact.topic_option1	fr	Diagnostic TDAH
1426	contact.topic_option2	fr	Test MOXO
1427	contact.topic_option3	fr	Autre
1428	contact.address_label	fr	Adresse :
1429	contact.email_label	fr	E-mail :
1430	contact.details_title	fr	Coordonnées
1431	contact.directions_title	fr	Itinéraire et stationnement
1432	contact.clear_form	fr	Effacer le formulaire
424	contact.address_line1	fr	Alon Towers 1, Étage 12, Bureau 1202
425	contact.address_line2	fr	Yigal Alon 94, Tel Aviv
1435	contact.email_placeholder	es	Correo electrónico
1436	contact.phone_placeholder	es	Número de teléfono
1437	contact.topic_label	es	Seleccione un tema
1438	contact.topic_option1	es	Diagnóstico de TDAH
1439	contact.topic_option2	es	Prueba MOXO
1440	contact.topic_option3	es	Otro
1441	contact.address_label	es	Dirección:
217	contact.phone_label	he	טלפון
218	contact.email_optional	he	דוא"ל (אופציונלי)
219	contact.message	he	הודעה
220	contact.name_placeholder	he	הכניסו את שמכם המלא
221	contact.message_placeholder	he	ספרו לנו במה נוכל לעזור...
222	contact.sending	he	שולח...
223	contact.send_message	he	שליחת הודעה
224	contact.success_title	he	הודעה נשלחה בהצלחה!
225	contact.success_desc	he	נחזור אליכם בהקדם
226	contact.error_title	he	שגיאה בשליחה
227	contact.error_desc	he	אנא נסו שוב
228	contact.thank_you	he	תודה שפניתם אלינו!
229	contact.will_reply	he	נחזור אליכם בהקדם האפשרי
230	contact.send_another	he	שליחת הודעה נוספת
231	contact.privacy_note	he	המידע שלכם מאובטח ולא ישותף עם צדדים שלישיים
232	contact.call_now	he	התקשרו עכשיו
233	contact.whatsapp	he	שלחו הודעה בוואטסאפ
234	contact.whatsapp_message	he	שלום, אשמח לקבל מידע על אבחון ADHD
235	contact.directions	he	דרכי הגעה ואפשרויות חניה
236	contact.directions_desc	he	מידע על הגעה למרפאה וחניה באזור
237	contact.clinic_address	he	כתובת המרפאה
240	contact.parking_title	he	חניה
242	contact.transport_title	he	תחבורה ציבורית
1442	contact.email_label	es	Correo:
1443	contact.details_title	es	Datos de contacto
1444	contact.directions_title	es	Cómo llegar y estacionamiento
1445	contact.clear_form	es	Limpiar formulario
557	contact.address_line1	es	Alon Towers 1, Piso 12, Oficina 1202
558	contact.address_line2	es	Yigal Alon 94, Tel Aviv
1448	contact.email_placeholder	de	E-Mail
1449	contact.phone_placeholder	de	Telefonnummer
1450	contact.topic_label	de	Thema auswählen
1451	contact.topic_option1	de	ADHS-Diagnose
1452	contact.topic_option2	de	MOXO-Test
1453	contact.topic_option3	de	Sonstiges
252	about.title	he	אודותינו
253	about.subtitle	he	מומחים באבחון וטיפול בהפרעות קשב וריכוז
254	about.doctor_name	he	ד"ר איירין כוכב-רייפמן
255	about.doctor_title	he	רופאה מומחית
256	about.doctor_desc	he	בעלת ניסיון עשיר באבחון של ילדים, מתבגרים ובוגרים. ליוותה מטופלים רבים במסע להגשמה אישית ותפקוד מיטבי.
257	about.doctor_alt	he	ד"ר איירין כוכב-רייפמן
258	about.credential1	he	מומחית באבחון וטיפול ב-ADHD
259	about.credential2	he	ניסיון של למעלה מ-15 שנה
260	about.credential3	he	התמחות בילדים, נוער ומבוגרים
261	about.mission	he	המשימה שלנו היא לספק אבחון מדויק ותוכניות טיפול מותאמות אישית, המאפשרים למטופלים שלנו להגיע למיצוי הפוטנציאל האישי שלהם.
262	about.value1_title	he	יחס אישי
263	about.value1_desc	he	כל מטופל מקבל יחס אישי ומותאם לצרכיו הייחודיים
264	about.value2_title	he	מקצועיות
265	about.value2_desc	he	צוות מומחים עם ניסיון רב ועדכון מתמיד
266	about.value3_title	he	דיסקרטיות
267	about.value3_desc	he	שמירה על פרטיות מלאה וסביבה בטוחה
268	services.title	he	השירותים שלנו
269	services.service1_title	he	אבחון מקיף
270	services.service1_desc	he	אבחון מותאם אישית באמצעות כלים מתקדמים, ראיונות קליניים ומבחנים ממוחשבים
271	services.service2_title	he	התאמת טיפול תרופתי
272	services.service2_desc	he	התאמת טיפול תרופתי אישי עם מעקב בטיחות מתמשך
273	services.service3_title	he	מבחן MOXO ממוחשב
274	services.service3_desc	he	הערכה אובייקטיבית של תפקודי הקשב והריכוז
275	services.service4_title	he	ייעוץ ומעקב
276	services.service4_desc	he	תמיכה מקצועית מתמשכת ומעקב אחר הטיפול
277	services.service5_title	he	הפניות לטיפולים משלימים
278	services.service5_desc	he	הפניות לריפוי בעיסוק, טיפול רגשי ותמיכה פסיכולוגית
279	services.step1_title	he	יצירת קשר
280	services.step1_desc	he	פנייה ראשונית טלפונית או באמצעות הטופס באתר
281	services.step2_title	he	פגישת היכרות
282	services.step2_desc	he	שיחה ראשונית, איסוף היסטוריה רפואית ומילוי שאלונים
283	services.step3_title	he	אבחון מקיף
284	services.step3_desc	he	ביצוע מבחנים ממוחשבים והערכה קלינית מעמיקה
285	services.step4_title	he	דוח ותוכנית טיפול
286	services.step4_desc	he	קבלת דוח מפורט והמלצות לתוכנית טיפול אישית
287	services.list_label	he	השירותים שלנו
288	contact.title	he	צרו קשר
289	contact.phone	he	055-27-399-27
290	contact.email	he	info@keshevplus.co.il
291	contact.address	he	תל אביב, ישראל
292	questionnaires.title	he	שאלונים
293	questionnaires.subtitle	he	שאלונים לזיהוי סימנים של הפרעת קשב וריכוז (ADHD)
294	questionnaires.parent_form	he	שאלון להורים
295	questionnaires.parent_form_desc	he	שאלון זה מיועד להורים ומספק תובנות על התנהגות הילד בבית ובסביבה המשפחתית.
296	questionnaires.teacher_form	he	שאלון למורה
297	questionnaires.teacher_form_desc	he	שאלון זה מיועד למורים ומספק תובנות על התנהגות הילד בכיתה ובסביבה החינוכית.
298	questionnaires.self_report	he	שאלון דיווח עצמי
299	questionnaires.self_report_desc	he	שאלון זה מיועד למילוי על ידי מבוגר מעל גיל 18 להערכת הפרעות קשב ופעלתנות יתר.
300	questionnaires.note	he	ניתן להוריד את השאלונים ולמלא אותם לפני הפגישה במרפאה
301	questionnaires.download_files	he	קבצים להורדה
302	questionnaires.download_pdf	he	הורדת PDF
303	questionnaires.download_word	he	הורדת Word
304	questionnaires.fill_online	he	מלא/י שאלון אונליין
305	adhd.subtitle	he	הפרעת קשב וריכוז (ADHD) היא הפרעה נוירו-התפתחותית שמשפיעה על ילדים ומבוגרים כאחד
306	adhd.symptom1_title	he	קשיי ריכוז
307	adhd.symptom1_desc	he	קושי לשמור על ריכוז לאורך זמן, הסחת דעת קלה ושכחנות
308	adhd.symptom2_title	he	היפראקטיביות
309	adhd.symptom2_desc	he	חוסר שקט, קושי לשבת במקום ותחושת אי-מנוחה פנימית
310	adhd.symptom3_title	he	אימפולסיביות
311	adhd.symptom3_desc	he	קושי בבקרה עצמית, קבלת החלטות מהירות ללא מחשבה מוקדמת
312	adhd.symptom4_title	he	קשיים חברתיים
313	adhd.symptom4_desc	he	קושי בתקשורת חברתית, ביצירת קשרים ובשמירה עליהם
314	adhd.treatable_title	he	ADHD ניתן לטיפול!
315	adhd.treatable_desc	he	עם אבחון מדויק ותוכנית טיפול מותאמת אישית, ניתן לשפר משמעותית את איכות החיים. הצעד הראשון הוא פנייה למומחה.
316	faq.title	he	שאלות נפוצות
317	faq.subtitle	he	תשובות לשאלות הנפוצות ביותר
318	faq.no_answer	he	לא מצאתם תשובה? צרו איתנו קשר
319	faq.q1	he	מהו ADHD?
320	faq.a1	he	ADHD (הפרעת קשב וריכוז) היא הפרעה נוירו-התפתחותית המשפיעה על יכולת הריכוז, השליטה בדחפים וויסות הפעילות. היא נפוצה בילדים ומבוגרים כאחד ומשפיעה על תפקוד יומיומי, לימודים ועבודה.
321	faq.q2	he	כמה זמן לוקח תהליך האבחון?
322	faq.a2	he	תהליך האבחון המלא כולל מספר פגישות ואורך בממוצע 2-4 שבועות. התהליך כולל ריאיון קליני מעמיק, מבחנים ממוחשבים (MOXO), שאלונים ובדיקת מסמכים רפואיים רלוונטיים.
323	faq.q3	he	האם האבחון מתאים לכל הגילאים?
324	faq.a3	he	כן, אנו מספקים אבחון מקצועי לילדים מגיל 6, בני נוער ומבוגרים. לכל קבוצת גיל יש פרוטוקול אבחון מותאם המתחשב במאפיינים הייחודיים של אותו גיל.
325	faq.q4	he	מה כלול בתוכנית הטיפול?
326	faq.a4	he	תוכנית הטיפול מותאמת אישית וכוללת: המלצות לטיפול תרופתי (במידת הצורך), הדרכת הורים, כלים מעשיים להתמודדות יומיומית, הפניות לטיפולים משלימים ומעקב מתמשך.
327	faq.q5	he	האם יש צורך בהפניה מרופא?
328	faq.a5	he	לא, אין צורך בהפניה. ניתן לפנות ישירות למרפאה לקביעת תור לאבחון. עם זאת, אם יש מסמכים רפואיים קודמים, מומלץ להביא אותם לפגישה הראשונה.
329	faq.q6	he	מה ההבדל בין ADD ל-ADHD?
330	faq.a6	he	ADD הוא המונח הישן להפרעת קשב ללא היפראקטיביות. כיום משתמשים במונח ADHD עם שלושה תת-סוגים: חוסר קשב בעיקר, היפראקטיביות-אימפולסיביות בעיקר, או משולב.
331	services.process_steps	he	שלבי תהליך האבחון
332	footer.rights	he	© 2025 כל הזכויות שמורות לקשב פלוס
333	admin.dashboard	he	לוח בקרה
334	admin.welcome	he	ברוך השב
335	admin.signout	he	התנתקות
336	admin.language_settings	he	הגדרות שפה
337	admin.multilingual_support	he	תמיכה רב-לשונית
338	admin.multilingual_desc	he	הפעל או השבת את בורר השפות באתר
339	admin.language_mode	he	מצב שפה
340	admin.bilingual	he	דו-לשוני (עברית / אנגלית)
341	admin.multilingual	he	רב-לשוני (כל השפות)
342	admin.default_language	he	שפת ברירת מחדל
343	admin.settings_saved	he	ההגדרות נשמרו בהצלחה
344	admin.settings_error	he	שגיאה בשמירת ההגדרות
345	nav.home	fr	Accueil
346	nav.about	fr	À propos
347	nav.services	fr	Services
348	nav.adhd	fr	Qu'est-ce que le TDAH ?
349	nav.process	fr	Processus de diagnostic
350	nav.faq	fr	FAQ
351	nav.questionnaires	fr	Questionnaires
352	nav.contact	fr	Contact
353	nav.skip_to_content	fr	Aller au contenu principal
354	nav.main_navigation	fr	Navigation principale
355	nav.go_home	fr	Aller à la page d'accueil
356	nav.call_us	fr	Appelez-nous : 055-27-399-27
357	nav.close_menu	fr	Fermer le menu
358	nav.open_menu	fr	Ouvrir le menu
359	hero.title	fr	Bienvenue à la clinique
360	hero.clinic	fr	"Keshev Plus"
361	hero.subtitle	fr	Enfants • Adolescents • Adultes
362	hero.description	fr	Chez "Keshev Plus", vous recevrez un diagnostic précis\net un plan de traitement personnalisé
363	hero.step	fr	Le premier pas commence ici
364	hero.consultation	fr	Prenez rendez-vous - découvrez le chemin vers le succès
365	hero.read_more	fr	En savoir plus
366	hero.start_diagnosis	fr	Commencer le diagnostic
367	hero.ready_title	fr	Prêt à commencer ?
368	hero.ready_text	fr	Contactez-nous aujourd'hui pour planifier votre diagnostic et faire le premier pas\nvers une vie meilleure.
369	hero.contact_now	fr	Contactez-nous
370	hero.welcome_line1	fr	Bienvenue à
371	hero.welcome_line2	fr	la clinique "Keshev Plus"
372	hero.clinic_description	fr	Clinique de diagnostic et de traitement du TDAH
373	hero.typing_children	fr	chez les enfants
374	hero.typing_teens	fr	chez les adolescents
375	hero.typing_adults	fr	chez les adultes
376	hero.accurate_diagnosis	fr	Chez "Keshev Plus", vous recevrez un diagnostic précis
377	hero.personal_plan	fr	et un plan de traitement personnalisé
378	hero.first_step	fr	Le premier pas commence ici
379	hero.schedule_consultation	fr	Prenez rendez-vous - découvrez le chemin vers le succès
380	hero.start_now	fr	Commencer le diagnostic maintenant
381	hero.read_about_us	fr	En savoir plus sur nous
382	hero.ready_to_start	fr	Prêt à commencer ?
383	hero.ready_description	fr	Contactez-nous aujourd'hui pour planifier votre diagnostic et faire le premier pas vers une vie meilleure.
384	hero.contact_us_now	fr	Contactez-nous maintenant
385	hero.doctor_alt	fr	Médecin spécialiste du TDAH
386	about.title	fr	À propos
387	about.subtitle	fr	Spécialistes du diagnostic et du traitement du TDAH
388	about.text	fr	Nous sommes spécialisés dans le diagnostic et le traitement du TDAH pour tous les âges. Notre équipe est composée de médecins et de psychologues experts.
389	services.title	fr	Nos services
390	services.diagnosis	fr	Diagnostic du TDAH
391	services.diagnosis_desc	fr	Diagnostic professionnel et précis pour enfants, adolescents et adultes
392	services.treatment	fr	Plan de traitement
393	services.treatment_desc	fr	Plan de traitement personnalisé adapté aux besoins uniques
394	services.counseling	fr	Conseil familial
725	footer.quick_links	de	Schnelllinks
395	services.counseling_desc	fr	Orientation et soutien pour les familles et les proches
396	contact.title	fr	Contactez-nous
397	contact.phone	fr	055-27-399-27
398	contact.email	fr	info@keshevplus.co.il
399	contact.address	fr	Tel Aviv, Israël
400	contact.subtitle	fr	Laissez vos coordonnées et nous vous recontacterons dès que possible
401	contact.leave_details	fr	Laissez vos coordonnées
402	contact.full_name	fr	Nom complet
403	contact.phone_label	fr	Téléphone
404	contact.email_optional	fr	Email (facultatif)
405	contact.message	fr	Message
406	contact.name_placeholder	fr	Entrez votre nom complet
407	contact.message_placeholder	fr	Dites-nous comment nous pouvons vous aider...
408	contact.sending	fr	Envoi en cours...
409	contact.send_message	fr	Envoyer le message
410	contact.success_title	fr	Message envoyé avec succès !
411	contact.success_desc	fr	Nous vous recontacterons bientôt
412	contact.error_title	fr	Erreur lors de l'envoi du message
413	contact.error_desc	fr	Veuillez réessayer
414	contact.thank_you	fr	Merci de nous avoir contactés !
415	contact.will_reply	fr	Nous vous répondrons dès que possible
416	contact.send_another	fr	Envoyer un autre message
417	contact.privacy_note	fr	Vos informations sont sécurisées et ne seront pas partagées avec des tiers
418	contact.call_now	fr	Appeler maintenant
419	contact.whatsapp	fr	Message sur WhatsApp
420	contact.whatsapp_message	fr	Bonjour, je souhaite des informations sur le diagnostic du TDAH
421	contact.directions	fr	Itinéraire et stationnement
422	contact.directions_desc	fr	Informations pour se rendre à la clinique et se garer à proximité
423	contact.clinic_address	fr	Adresse de la clinique
426	contact.parking_title	fr	Stationnement
427	contact.parking_desc	fr	Un stationnement gratuit dans la rue est disponible dans le quartier. Nous vous recommandons d'arriver quelques minutes à l'avance pour trouver une place.
428	contact.transport_title	fr	Transports en commun
429	contact.transport_desc	fr	La clinique est à quelques minutes à pied de la gare centrale de Beer Sheva. Plusieurs lignes de bus passent à proximité.
430	questionnaires.title	fr	Questionnaires
431	questionnaires.subtitle	fr	Questionnaires de dépistage et de diagnostic du TDAH à télécharger
432	questionnaires.parent_form	fr	Questionnaire pour les parents
433	questionnaires.parent_form_desc	fr	Ce questionnaire est destiné aux parents et fournit des informations sur le comportement de l'enfant à la maison et dans l'environnement familial.
434	questionnaires.teacher_form	fr	Questionnaire pour l'enseignant
435	questionnaires.teacher_form_desc	fr	Ce questionnaire est destiné aux enseignants et fournit des informations sur le comportement de l'enfant en classe et dans l'environnement éducatif.
436	questionnaires.self_report	fr	Questionnaire d'auto-évaluation
437	questionnaires.self_report_desc	fr	Ce questionnaire est destiné aux adultes de plus de 18 ans pour l'évaluation des troubles de l'attention et de l'hyperactivité.
438	questionnaires.download_files	fr	Fichiers à télécharger
439	questionnaires.download_word	fr	Télécharger Word
440	questionnaires.note	fr	Vous pouvez télécharger les questionnaires et les remplir avant votre rendez-vous
441	questionnaires.download_pdf	fr	Télécharger PDF
442	adhd.subtitle	fr	Le TDAH (Trouble du Déficit de l'Attention avec Hyperactivité) est un trouble neurodéveloppemental qui affecte aussi bien les enfants que les adultes
443	adhd.symptom1_title	fr	Difficulté de concentration
444	adhd.symptom1_desc	fr	Difficulté à maintenir l'attention dans le temps, distractibilité facile et oublis fréquents
445	adhd.symptom2_title	fr	Hyperactivité
446	adhd.symptom2_desc	fr	Agitation, difficulté à rester assis et sentiment d'inconfort intérieur
447	adhd.symptom3_title	fr	Impulsivité
448	adhd.symptom3_desc	fr	Difficulté à se contrôler, prise de décisions rapides sans réflexion préalable
449	adhd.symptom4_title	fr	Difficultés sociales
450	adhd.symptom4_desc	fr	Difficulté dans la communication sociale, à créer et maintenir des relations
451	adhd.treatable_title	fr	Le TDAH se traite !
452	adhd.treatable_desc	fr	Avec un diagnostic précis et un plan de traitement personnalisé, la qualité de vie peut être considérablement améliorée. La première étape est de consulter un spécialiste.
453	faq.title	fr	Questions fréquentes
454	faq.subtitle	fr	Réponses aux questions les plus courantes
455	faq.no_answer	fr	Vous n'avez pas trouvé de réponse ? Contactez-nous
456	services.process_steps	fr	Étapes du processus de diagnostic
457	footer.rights	fr	© 2025 Tous droits réservés à Keshev Plus
458	footer.clinic_desc	fr	Clinique leader dans le diagnostic et le traitement du TDAH chez les enfants, les adolescents et les adultes.
459	footer.quick_links	fr	Liens rapides
460	footer.contact_info	fr	Coordonnées
461	footer.follow_us	fr	Suivez-nous
462	footer.privacy_policy	fr	Politique de confidentialité
463	footer.terms_of_use	fr	Conditions d'utilisation
464	footer.address	fr	94, rue Yigal Alon, Tel Aviv
465	footer.hours	fr	Dim-Jeu 09:00-19:00
466	admin.dashboard	fr	Tableau de bord
467	admin.welcome	fr	Bienvenue
468	admin.signout	fr	Déconnexion
469	admin.language_settings	fr	Paramètres de langue
470	admin.multilingual_support	fr	Support multilingue
471	admin.multilingual_desc	fr	Activer ou désactiver le sélecteur de langue sur le site
472	admin.language_mode	fr	Mode linguistique
473	admin.bilingual	fr	Bilingue (Hébreu / Anglais)
474	admin.multilingual	fr	Multilingue (Toutes les langues)
475	admin.default_language	fr	Langue par défaut
476	admin.settings_saved	fr	Paramètres enregistrés
477	admin.settings_error	fr	Échec de l'enregistrement
478	nav.home	es	Inicio
479	nav.about	es	Sobre nosotros
480	nav.services	es	Servicios
481	nav.adhd	es	¿Qué es el TDAH?
482	nav.process	es	Proceso de diagnóstico
483	nav.faq	es	Preguntas frecuentes
484	nav.questionnaires	es	Cuestionarios
485	nav.contact	es	Contacto
486	nav.skip_to_content	es	Ir al contenido principal
487	nav.main_navigation	es	Navegación principal
488	nav.go_home	es	Ir a la página de inicio
489	nav.call_us	es	Llámenos: 055-27-399-27
490	nav.close_menu	es	Cerrar menú
491	nav.open_menu	es	Abrir menú
492	hero.title	es	Bienvenido a la clínica
493	hero.clinic	es	"Keshev Plus"
494	hero.subtitle	es	Niños • Adolescentes • Adultos
495	hero.description	es	En "Keshev Plus" recibirá un diagnóstico preciso\ny un plan de tratamiento personalizado
496	hero.step	es	El primer paso comienza aquí
497	hero.consultation	es	Programe una consulta - descubra el camino hacia el éxito
498	hero.read_more	es	Leer más
499	hero.start_diagnosis	es	Iniciar diagnóstico
500	hero.ready_title	es	¿Listo para empezar?
501	hero.ready_text	es	Contáctenos hoy para programar su diagnóstico y dar el primer paso\nhacia una vida mejor.
502	hero.contact_now	es	Contáctenos ahora
503	hero.welcome_line1	es	Bienvenido a
504	hero.welcome_line2	es	la clínica "Keshev Plus"
505	hero.clinic_description	es	Clínica de diagnóstico y tratamiento del TDAH
506	hero.typing_children	es	en niños
507	hero.typing_teens	es	en adolescentes
508	hero.typing_adults	es	en adultos
509	hero.accurate_diagnosis	es	En "Keshev Plus" recibirá un diagnóstico preciso
510	hero.personal_plan	es	y un plan de tratamiento personalizado
511	hero.first_step	es	El primer paso comienza aquí
512	hero.schedule_consultation	es	Programe una consulta - descubra el camino hacia el éxito
513	hero.start_now	es	Iniciar diagnóstico ahora
514	hero.read_about_us	es	Leer más sobre nosotros
515	hero.ready_to_start	es	¿Listo para empezar?
516	hero.ready_description	es	Contáctenos hoy para programar su diagnóstico y dar el primer paso hacia una vida mejor.
517	hero.contact_us_now	es	Contáctenos ahora
518	hero.doctor_alt	es	Médico especialista en TDAH
519	about.title	es	Sobre nosotros
520	about.subtitle	es	Especialistas en diagnóstico y tratamiento del TDAH
521	about.text	es	Nos especializamos en el diagnóstico y tratamiento del TDAH para todas las edades. Nuestro equipo está compuesto por médicos y psicólogos expertos.
522	services.title	es	Nuestros servicios
523	services.diagnosis	es	Diagnóstico de TDAH
524	services.diagnosis_desc	es	Diagnóstico profesional y preciso para niños, adolescentes y adultos
525	services.treatment	es	Plan de tratamiento
526	services.treatment_desc	es	Plan de tratamiento personalizado adaptado a necesidades únicas
527	services.counseling	es	Asesoramiento familiar
528	services.counseling_desc	es	Orientación y apoyo para familias y seres queridos
529	contact.title	es	Contáctenos
530	contact.phone	es	055-27-399-27
531	contact.email	es	info@keshevplus.co.il
532	contact.address	es	Tel Aviv, Israel
533	contact.subtitle	es	Deje sus datos y nos pondremos en contacto con usted lo antes posible
534	contact.leave_details	es	Deje sus datos
535	contact.full_name	es	Nombre completo
536	contact.phone_label	es	Teléfono
537	contact.email_optional	es	Email (opcional)
538	contact.message	es	Mensaje
539	contact.name_placeholder	es	Ingrese su nombre completo
540	contact.message_placeholder	es	Cuéntenos cómo podemos ayudarle...
541	contact.sending	es	Enviando...
542	contact.send_message	es	Enviar mensaje
543	contact.success_title	es	¡Mensaje enviado con éxito!
544	contact.success_desc	es	Nos pondremos en contacto pronto
545	contact.error_title	es	Error al enviar el mensaje
546	contact.error_desc	es	Por favor, inténtelo de nuevo
547	contact.thank_you	es	¡Gracias por contactarnos!
548	contact.will_reply	es	Nos pondremos en contacto con usted lo antes posible
549	contact.send_another	es	Enviar otro mensaje
550	contact.privacy_note	es	Su información está segura y no será compartida con terceros
551	contact.call_now	es	Llamar ahora
552	contact.whatsapp	es	Mensaje por WhatsApp
553	contact.whatsapp_message	es	Hola, me gustaría información sobre el diagnóstico de TDAH
554	contact.directions	es	Cómo llegar y estacionamiento
555	contact.directions_desc	es	Información sobre cómo llegar a la clínica y estacionamiento cercano
556	contact.clinic_address	es	Dirección de la clínica
559	contact.parking_title	es	Estacionamiento
560	contact.parking_desc	es	Hay estacionamiento gratuito en la calle disponible en la zona. Recomendamos llegar unos minutos antes para encontrar lugar.
561	contact.transport_title	es	Transporte público
562	contact.transport_desc	es	La clínica está a pocos minutos a pie de la estación central de tren de Beer Sheva. Varias líneas de autobús pasan cerca.
563	questionnaires.title	es	Cuestionarios
1015	nav.faq	ar	أسئلة شائعة
564	questionnaires.subtitle	es	Cuestionarios de detección y diagnóstico de TDAH para descargar
565	questionnaires.parent_form	es	Cuestionario para padres
566	questionnaires.parent_form_desc	es	Este cuestionario está diseñado para padres y proporciona información sobre el comportamiento del niño en el hogar y el entorno familiar.
567	questionnaires.teacher_form	es	Cuestionario para el maestro
568	questionnaires.teacher_form_desc	es	Este cuestionario está diseñado para maestros y proporciona información sobre el comportamiento del niño en el aula y el entorno educativo.
569	questionnaires.self_report	es	Cuestionario de autoinforme
570	questionnaires.self_report_desc	es	Este cuestionario está diseñado para adultos mayores de 18 años para evaluar trastornos de déficit de atención e hiperactividad.
571	questionnaires.download_files	es	Archivos para descargar
572	questionnaires.download_word	es	Descargar Word
573	questionnaires.note	es	Puede descargar los cuestionarios y completarlos antes de su cita en la clínica
574	questionnaires.download_pdf	es	Descargar PDF
575	adhd.subtitle	es	El TDAH (Trastorno por Déficit de Atención e Hiperactividad) es un trastorno del neurodesarrollo que afecta tanto a niños como a adultos
576	adhd.symptom1_title	es	Dificultad para concentrarse
577	adhd.symptom1_desc	es	Problemas para mantener la atención a lo largo del tiempo, fácil distracción y olvidos frecuentes
578	adhd.symptom2_title	es	Hiperactividad
579	adhd.symptom2_desc	es	Inquietud, dificultad para permanecer sentado y sensación de malestar interno
580	adhd.symptom3_title	es	Impulsividad
581	adhd.symptom3_desc	es	Dificultad con el autocontrol, toma de decisiones rápidas sin reflexión previa
582	adhd.symptom4_title	es	Dificultades sociales
583	adhd.symptom4_desc	es	Dificultad en la comunicación social, para crear y mantener relaciones
584	adhd.treatable_title	es	¡El TDAH tiene tratamiento!
585	adhd.treatable_desc	es	Con un diagnóstico preciso y un plan de tratamiento personalizado, la calidad de vida puede mejorar significativamente. El primer paso es consultar a un especialista.
586	faq.title	es	Preguntas frecuentes
587	faq.subtitle	es	Respuestas a las preguntas más comunes
588	faq.no_answer	es	¿No encontró respuesta? Contáctenos
589	services.process_steps	es	Pasos del proceso de diagnóstico
590	footer.rights	es	© 2025 Todos los derechos reservados a Keshev Plus
591	footer.clinic_desc	es	Clínica líder en diagnóstico y tratamiento del TDAH en niños, adolescentes y adultos.
592	footer.quick_links	es	Enlaces rápidos
593	footer.contact_info	es	Información de contacto
594	footer.follow_us	es	Síguenos
595	footer.privacy_policy	es	Política de privacidad
596	footer.terms_of_use	es	Términos de uso
597	footer.address	es	Calle Yigal Alon 94, Tel Aviv
598	footer.hours	es	Dom-Jue 09:00-19:00
599	admin.dashboard	es	Panel de administración
600	admin.welcome	es	Bienvenido de nuevo
601	admin.signout	es	Cerrar sesión
602	admin.language_settings	es	Configuración de idioma
603	admin.multilingual_support	es	Soporte multilingüe
604	admin.multilingual_desc	es	Activar o desactivar el selector de idioma en el sitio
605	admin.language_mode	es	Modo de idioma
606	admin.bilingual	es	Bilingüe (Hebreo / Inglés)
607	admin.multilingual	es	Multilingüe (Todos los idiomas)
608	admin.default_language	es	Idioma predeterminado
609	admin.settings_saved	es	Configuración guardada
610	admin.settings_error	es	Error al guardar
611	nav.home	de	Startseite
612	nav.about	de	Über uns
613	nav.services	de	Leistungen
614	nav.adhd	de	Was ist ADHS?
615	nav.process	de	Diagnoseverfahren
616	nav.faq	de	Häufige Fragen
617	nav.questionnaires	de	Fragebögen
618	nav.contact	de	Kontakt
619	nav.skip_to_content	de	Zum Hauptinhalt springen
620	nav.main_navigation	de	Hauptnavigation
621	nav.go_home	de	Zur Startseite
622	nav.call_us	de	Rufen Sie uns an: 055-27-399-27
623	nav.close_menu	de	Menü schließen
624	nav.open_menu	de	Menü öffnen
625	hero.title	de	Willkommen in der Klinik
626	hero.clinic	de	"Keshev Plus"
627	hero.subtitle	de	Kinder • Jugendliche • Erwachsene
628	hero.description	de	Bei "Keshev Plus" erhalten Sie eine präzise Diagnose\nund einen personalisierten Behandlungsplan
629	hero.step	de	Der erste Schritt beginnt hier
630	hero.consultation	de	Vereinbaren Sie einen Beratungstermin - entdecken Sie den Weg zum Erfolg
631	hero.read_more	de	Mehr erfahren
632	hero.start_diagnosis	de	Diagnose starten
633	hero.ready_title	de	Bereit anzufangen?
634	hero.ready_text	de	Kontaktieren Sie uns noch heute, um Ihre Diagnose zu planen und den ersten Schritt\nin ein besseres Leben zu machen.
635	hero.contact_now	de	Jetzt kontaktieren
636	hero.welcome_line1	de	Willkommen in der
637	hero.welcome_line2	de	Klinik "Keshev Plus"
638	hero.clinic_description	de	Klinik für Diagnose und Behandlung von ADHS
639	hero.typing_children	de	bei Kindern
640	hero.typing_teens	de	bei Jugendlichen
641	hero.typing_adults	de	bei Erwachsenen
642	hero.accurate_diagnosis	de	Bei "Keshev Plus" erhalten Sie eine präzise Diagnose
643	hero.personal_plan	de	und einen personalisierten Behandlungsplan
644	hero.first_step	de	Der erste Schritt beginnt hier
645	hero.schedule_consultation	de	Vereinbaren Sie einen Beratungstermin - entdecken Sie den Weg zum Erfolg
646	hero.start_now	de	Diagnose jetzt starten
647	hero.read_about_us	de	Mehr über uns erfahren
648	hero.ready_to_start	de	Bereit anzufangen?
649	hero.ready_description	de	Kontaktieren Sie uns noch heute, um Ihre Diagnose zu planen und den ersten Schritt in ein besseres Leben zu machen.
650	hero.contact_us_now	de	Jetzt kontaktieren
651	hero.doctor_alt	de	ADHS-Facharzt
652	about.title	de	Über uns
653	about.subtitle	de	Spezialisten für ADHS-Diagnose und -Behandlung
654	about.text	de	Wir sind auf die Diagnose und Behandlung von ADHS für alle Altersgruppen spezialisiert. Unser Team besteht aus erfahrenen Ärzten und Psychologen.
655	services.title	de	Unsere Leistungen
656	services.diagnosis	de	ADHS-Diagnose
657	services.diagnosis_desc	de	Professionelle und präzise Diagnose für Kinder, Jugendliche und Erwachsene
658	services.treatment	de	Behandlungsplan
659	services.treatment_desc	de	Personalisierter Behandlungsplan, angepasst an individuelle Bedürfnisse
660	services.counseling	de	Familienberatung
661	services.counseling_desc	de	Begleitung und Unterstützung für Familien und Angehörige
662	contact.title	de	Kontaktieren Sie uns
663	contact.phone	de	055-27-399-27
664	contact.email	de	info@keshevplus.co.il
665	contact.address	de	Tel Aviv, Israel
666	contact.subtitle	de	Hinterlassen Sie Ihre Daten und wir melden uns so schnell wie möglich bei Ihnen
667	contact.leave_details	de	Hinterlassen Sie Ihre Daten
668	contact.full_name	de	Vollständiger Name
669	contact.phone_label	de	Telefon
670	contact.email_optional	de	E-Mail (optional)
671	contact.message	de	Nachricht
672	contact.name_placeholder	de	Geben Sie Ihren vollständigen Namen ein
673	contact.message_placeholder	de	Teilen Sie uns mit, wie wir Ihnen helfen können...
674	contact.sending	de	Wird gesendet...
675	contact.send_message	de	Nachricht senden
676	contact.success_title	de	Nachricht erfolgreich gesendet!
677	contact.success_desc	de	Wir melden uns bald bei Ihnen
678	contact.error_title	de	Fehler beim Senden der Nachricht
679	contact.error_desc	de	Bitte versuchen Sie es erneut
680	contact.thank_you	de	Vielen Dank für Ihre Kontaktaufnahme!
681	contact.will_reply	de	Wir melden uns so schnell wie möglich bei Ihnen
682	contact.send_another	de	Weitere Nachricht senden
683	contact.privacy_note	de	Ihre Daten sind sicher und werden nicht an Dritte weitergegeben
684	contact.call_now	de	Jetzt anrufen
685	contact.whatsapp	de	Nachricht über WhatsApp
686	contact.whatsapp_message	de	Hallo, ich möchte Informationen zur ADHS-Diagnose
687	contact.directions	de	Anfahrt und Parken
688	contact.directions_desc	de	Informationen zur Anfahrt zur Klinik und zum Parken in der Nähe
689	contact.clinic_address	de	Klinikadresse
692	contact.parking_title	de	Parken
693	contact.parking_desc	de	Kostenlose Straßenparkplätze sind in der Umgebung verfügbar. Wir empfehlen, einige Minuten früher zu kommen, um einen Parkplatz zu finden.
694	contact.transport_title	de	Öffentliche Verkehrsmittel
695	contact.transport_desc	de	Die Klinik ist nur wenige Gehminuten vom Hauptbahnhof Beer Sheva entfernt. Mehrere Buslinien fahren in der Nähe.
696	questionnaires.title	de	Fragebögen
697	questionnaires.subtitle	de	ADHS-Screening- und Diagnosefragebögen zum Herunterladen
698	questionnaires.parent_form	de	Elternfragebogen
699	questionnaires.parent_form_desc	de	Dieser Fragebogen ist für Eltern bestimmt und bietet Einblicke in das Verhalten des Kindes zu Hause und im familiären Umfeld.
700	questionnaires.teacher_form	de	Lehrerfragebogen
701	questionnaires.teacher_form_desc	de	Dieser Fragebogen ist für Lehrer bestimmt und bietet Einblicke in das Verhalten des Kindes im Klassenzimmer und im schulischen Umfeld.
702	questionnaires.self_report	de	Selbstbeurteilungsfragebogen
703	questionnaires.self_report_desc	de	Dieser Fragebogen ist für Erwachsene über 18 Jahre zur Beurteilung von Aufmerksamkeitsdefizit- und Hyperaktivitätsstörungen bestimmt.
704	questionnaires.download_files	de	Dateien zum Herunterladen
705	questionnaires.download_word	de	Word herunterladen
706	questionnaires.note	de	Sie können die Fragebögen herunterladen und vor Ihrem Termin ausfüllen
707	questionnaires.download_pdf	de	PDF herunterladen
708	adhd.subtitle	de	ADHS (Aufmerksamkeitsdefizit-Hyperaktivitätsstörung) ist eine neurologische Entwicklungsstörung, die sowohl Kinder als auch Erwachsene betrifft
709	adhd.symptom1_title	de	Konzentrationsschwierigkeiten
710	adhd.symptom1_desc	de	Schwierigkeiten, die Aufmerksamkeit über längere Zeit aufrechtzuerhalten, leichte Ablenkbarkeit und Vergesslichkeit
711	adhd.symptom2_title	de	Hyperaktivität
712	adhd.symptom2_desc	de	Unruhe, Schwierigkeiten still zu sitzen und ein Gefühl innerer Rastlosigkeit
713	adhd.symptom3_title	de	Impulsivität
714	adhd.symptom3_desc	de	Schwierigkeiten mit der Selbstkontrolle, schnelle Entscheidungen ohne Vorausdenken
715	adhd.symptom4_title	de	Soziale Herausforderungen
716	adhd.symptom4_desc	de	Schwierigkeiten in der sozialen Kommunikation, beim Aufbau und Pflegen von Beziehungen
717	adhd.treatable_title	de	ADHS ist behandelbar!
718	adhd.treatable_desc	de	Mit einer präzisen Diagnose und einem personalisierten Behandlungsplan kann die Lebensqualität erheblich verbessert werden. Der erste Schritt ist die Kontaktaufnahme mit einem Spezialisten.
719	faq.title	de	Häufige Fragen
720	faq.subtitle	de	Antworten auf die häufigsten Fragen
721	faq.no_answer	de	Keine Antwort gefunden? Kontaktieren Sie uns
722	services.process_steps	de	Schritte des Diagnoseprozesses
723	footer.rights	de	© 2025 Alle Rechte vorbehalten für Keshev Plus
724	footer.clinic_desc	de	Führende Klinik für ADHS-Diagnose und -Behandlung bei Kindern, Jugendlichen und Erwachsenen.
726	footer.contact_info	de	Kontaktinformationen
727	footer.follow_us	de	Folgen Sie uns
728	footer.privacy_policy	de	Datenschutzrichtlinie
729	footer.terms_of_use	de	Nutzungsbedingungen
730	footer.address	de	Yigal Alon Str. 94, Tel Aviv
731	footer.hours	de	So-Do 09:00-19:00
732	admin.dashboard	de	Admin-Dashboard
733	admin.welcome	de	Willkommen zurück
734	admin.signout	de	Abmelden
735	admin.language_settings	de	Spracheinstellungen
736	admin.multilingual_support	de	Mehrsprachige Unterstützung
737	admin.multilingual_desc	de	Sprachauswahl auf der Website aktivieren oder deaktivieren
738	admin.language_mode	de	Sprachmodus
739	admin.bilingual	de	Zweisprachig (Hebräisch / Englisch)
740	admin.multilingual	de	Mehrsprachig (Alle Sprachen)
741	admin.default_language	de	Standardsprache
742	admin.settings_saved	de	Einstellungen gespeichert
743	admin.settings_error	de	Fehler beim Speichern
744	nav.home	ru	Главная
745	nav.about	ru	О нас
746	nav.services	ru	Услуги
747	nav.adhd	ru	Что такое СДВГ?
748	nav.process	ru	Процесс диагностики
749	nav.faq	ru	Частые вопросы
750	nav.questionnaires	ru	Опросники
751	nav.contact	ru	Контакты
752	nav.skip_to_content	ru	Перейти к основному содержанию
753	nav.main_navigation	ru	Основная навигация
754	nav.go_home	ru	На главную страницу
755	nav.call_us	ru	Позвоните нам: 055-27-399-27
756	nav.close_menu	ru	Закрыть меню
757	nav.open_menu	ru	Открыть меню
758	hero.title	ru	Добро пожаловать в клинику
759	hero.clinic	ru	"Keshev Plus"
760	hero.subtitle	ru	Дети • Подростки • Взрослые
761	hero.description	ru	В "Keshev Plus" вы получите точную диагностику\nи индивидуальный план лечения
762	hero.step	ru	Первый шаг начинается здесь
763	hero.consultation	ru	Запишитесь на консультацию - откройте путь к успеху
764	hero.read_more	ru	Узнать больше
765	hero.start_diagnosis	ru	Начать диагностику
766	hero.ready_title	ru	Готовы начать?
767	hero.ready_text	ru	Свяжитесь с нами сегодня, чтобы запланировать диагностику и сделать первый шаг\nк лучшей жизни.
768	hero.contact_now	ru	Связаться сейчас
769	hero.welcome_line1	ru	Добро пожаловать в
770	hero.welcome_line2	ru	клинику "Keshev Plus"
771	hero.clinic_description	ru	Клиника диагностики и лечения СДВГ
772	hero.typing_children	ru	у детей
773	hero.typing_teens	ru	у подростков
774	hero.typing_adults	ru	у взрослых
775	hero.accurate_diagnosis	ru	В "Keshev Plus" вы получите точную диагностику
776	hero.personal_plan	ru	и индивидуальный план лечения
777	hero.first_step	ru	Первый шаг начинается здесь
778	hero.schedule_consultation	ru	Запишитесь на консультацию - откройте путь к успеху
779	hero.start_now	ru	Начать диагностику сейчас
780	hero.read_about_us	ru	Узнать больше о нас
781	hero.ready_to_start	ru	Готовы начать?
782	hero.ready_description	ru	Свяжитесь с нами сегодня, чтобы запланировать диагностику и сделать первый шаг к лучшей жизни.
783	hero.contact_us_now	ru	Свяжитесь с нами сейчас
784	hero.doctor_alt	ru	Врач-специалист по СДВГ
785	about.title	ru	О нас
786	about.subtitle	ru	Специалисты по диагностике и лечению СДВГ
787	about.text	ru	Мы специализируемся на диагностике и лечении СДВГ для всех возрастов. Наша команда состоит из опытных врачей и психологов.
788	services.title	ru	Наши услуги
789	services.diagnosis	ru	Диагностика СДВГ
790	services.diagnosis_desc	ru	Профессиональная и точная диагностика для детей, подростков и взрослых
791	services.treatment	ru	План лечения
792	services.treatment_desc	ru	Индивидуальный план лечения, адаптированный к уникальным потребностям
793	services.counseling	ru	Семейное консультирование
794	services.counseling_desc	ru	Поддержка и помощь семьям и близким
795	contact.title	ru	Свяжитесь с нами
796	contact.phone	ru	055-27-399-27
797	contact.email	ru	info@keshevplus.co.il
798	contact.address	ru	Тель-Авив, Израиль
799	contact.subtitle	ru	Оставьте свои данные, и мы свяжемся с вами как можно скорее
800	contact.leave_details	ru	Оставьте свои данные
801	contact.full_name	ru	Полное имя
802	contact.phone_label	ru	Телефон
803	contact.email_optional	ru	Электронная почта (необязательно)
804	contact.message	ru	Сообщение
805	contact.name_placeholder	ru	Введите ваше полное имя
806	contact.message_placeholder	ru	Расскажите, чем мы можем вам помочь...
807	contact.sending	ru	Отправка...
808	contact.send_message	ru	Отправить сообщение
809	contact.success_title	ru	Сообщение успешно отправлено!
810	contact.success_desc	ru	Мы свяжемся с вами в ближайшее время
811	contact.error_title	ru	Ошибка при отправке сообщения
812	contact.error_desc	ru	Пожалуйста, попробуйте снова
813	contact.thank_you	ru	Спасибо за обращение!
814	contact.will_reply	ru	Мы ответим вам как можно скорее
815	contact.send_another	ru	Отправить ещё одно сообщение
816	contact.privacy_note	ru	Ваша информация защищена и не будет передана третьим лицам
817	contact.call_now	ru	Позвонить сейчас
818	contact.whatsapp	ru	Написать в WhatsApp
819	contact.whatsapp_message	ru	Здравствуйте, я хотел бы получить информацию о диагностике СДВГ
820	contact.directions	ru	Как добраться и парковка
821	contact.directions_desc	ru	Информация о том, как добраться до клиники и припарковаться рядом
822	contact.clinic_address	ru	Адрес клиники
825	contact.parking_title	ru	Парковка
826	contact.parking_desc	ru	В этом районе доступна бесплатная уличная парковка. Рекомендуем приехать на несколько минут раньше, чтобы найти место.
827	contact.transport_title	ru	Общественный транспорт
828	contact.transport_desc	ru	Клиника находится в нескольких минутах ходьбы от центрального вокзала Беэр-Шевы. Рядом проходят несколько автобусных маршрутов.
829	questionnaires.title	ru	Опросники
830	questionnaires.subtitle	ru	Опросники для скрининга и диагностики СДВГ для скачивания
831	questionnaires.parent_form	ru	Опросник для родителей
832	questionnaires.parent_form_desc	ru	Этот опросник предназначен для родителей и даёт представление о поведении ребёнка дома и в семейной среде.
833	questionnaires.teacher_form	ru	Опросник для учителя
834	questionnaires.teacher_form_desc	ru	Этот опросник предназначен для учителей и даёт представление о поведении ребёнка в классе и в учебной среде.
835	questionnaires.self_report	ru	Опросник самооценки
836	questionnaires.self_report_desc	ru	Этот опросник предназначен для взрослых старше 18 лет для оценки расстройств внимания и гиперактивности.
837	questionnaires.download_files	ru	Файлы для скачивания
838	questionnaires.download_word	ru	Скачать Word
839	questionnaires.note	ru	Вы можете скачать опросники и заполнить их до визита в клинику
840	questionnaires.download_pdf	ru	Скачать PDF
841	adhd.subtitle	ru	СДВГ (Синдром дефицита внимания и гиперактивности) — это нарушение нервно-психического развития, которое затрагивает как детей, так и взрослых
842	adhd.symptom1_title	ru	Трудности с концентрацией
843	adhd.symptom1_desc	ru	Сложности с удержанием внимания на протяжении длительного времени, лёгкая отвлекаемость и забывчивость
844	adhd.symptom2_title	ru	Гиперактивность
845	adhd.symptom2_desc	ru	Беспокойство, трудности с тем, чтобы усидеть на месте, и чувство внутреннего дискомфорта
846	adhd.symptom3_title	ru	Импульсивность
847	adhd.symptom3_desc	ru	Трудности с самоконтролем, принятие поспешных решений без предварительного обдумывания
848	adhd.symptom4_title	ru	Социальные трудности
849	adhd.symptom4_desc	ru	Трудности в социальном общении, в установлении и поддержании отношений
850	adhd.treatable_title	ru	СДВГ поддаётся лечению!
851	adhd.treatable_desc	ru	При точной диагностике и индивидуальном плане лечения качество жизни может значительно улучшиться. Первый шаг — обращение к специалисту.
852	faq.title	ru	Часто задаваемые вопросы
853	faq.subtitle	ru	Ответы на самые частые вопросы
854	faq.no_answer	ru	Не нашли ответ? Свяжитесь с нами
855	services.process_steps	ru	Этапы процесса диагностики
856	footer.rights	ru	© 2025 Все права защищены Keshev Plus
857	footer.clinic_desc	ru	Ведущая клиника по диагностике и лечению СДВГ у детей, подростков и взрослых.
858	footer.quick_links	ru	Быстрые ссылки
859	footer.contact_info	ru	Контактная информация
860	footer.follow_us	ru	Подписывайтесь
861	footer.privacy_policy	ru	Политика конфиденциальности
862	footer.terms_of_use	ru	Условия использования
863	footer.address	ru	ул. Игаль Алон 94, Тель-Авив
864	footer.hours	ru	Вс-Чт 09:00-19:00
865	admin.dashboard	ru	Панель управления
866	admin.welcome	ru	Добро пожаловать
867	admin.signout	ru	Выход
868	admin.language_settings	ru	Настройки языка
869	admin.multilingual_support	ru	Многоязычная поддержка
870	admin.multilingual_desc	ru	Включить или отключить выбор языка на сайте
871	admin.language_mode	ru	Языковой режим
872	admin.bilingual	ru	Двуязычный (Иврит / Английский)
873	admin.multilingual	ru	Многоязычный (Все языки)
874	admin.default_language	ru	Язык по умолчанию
875	admin.settings_saved	ru	Настройки сохранены
876	admin.settings_error	ru	Ошибка сохранения
877	nav.home	am	መነሻ
878	nav.about	am	ስለ እኛ
879	nav.services	am	አገልግሎቶች
880	nav.adhd	am	ADHD ምንድነው?
881	nav.process	am	የምርመራ ሂደት
882	nav.faq	am	በብዛት የሚጠየቁ ጥያቄዎች
883	nav.questionnaires	am	መጠይቆች
884	nav.contact	am	እየና ያግኙን
885	nav.skip_to_content	am	ወደ ዋና ይዘት ዝለል
886	nav.main_navigation	am	ዋና ናቪጌሽን
887	nav.go_home	am	ወደ መነሻ ገጽ ሂድ
888	nav.call_us	am	ደውሉልን: 055-27-399-27
889	nav.close_menu	am	ምናሌ ዝጋ
890	nav.open_menu	am	ምናሌ ክፈት
891	hero.title	am	እንዳምረጠው ወደ ክሊኒክ
892	hero.clinic	am	"Keshev Plus"
893	hero.subtitle	am	ሕጻናት • አዩመራዎች • አዋቂዎች
894	hero.description	am	በ"Keshev Plus" ትክክለኛ ምርመራ\nእና ጀመራዊ የሕክምና እቅድ ያገኛሉ
895	hero.step	am	የመጀመሪያው እርምጃ እዚህ ይጀምራል
896	hero.consultation	am	የምክር ቀጠሮ ይያዙ - ወደ ስኬት የሚወሰደውን መንገድ ያግኝ
897	hero.read_more	am	ተጨማሪ ያንብቡ
898	hero.start_diagnosis	am	ምርመራውን አሁን ይጀምሩ
899	hero.ready_title	am	ለመጀመር ዝግጁ ናችወ?
900	hero.ready_text	am	ምርመራዎን ለማቄጠር እና የመጀመሪያውን እርምጃ ለመውሰድ\nዘረ እየና ያግኙን.
901	hero.contact_now	am	አሁን እየና ያግኙን
902	hero.welcome_line1	am	እንኳን ደህና መጡ ወደ
903	hero.welcome_line2	am	"Keshev Plus" ክሊኒክ
904	hero.clinic_description	am	የADHD ምርመራ እና ሕክምና ክሊኒክ
905	hero.typing_children	am	በሕጻናት
906	hero.typing_teens	am	በአዩመራዎች
907	hero.typing_adults	am	በአዋቂዎች
908	hero.accurate_diagnosis	am	በ"Keshev Plus" ትክክለኛ ምርመራ ያገኛሉ
909	hero.personal_plan	am	እና ግላዊ የሕክምና እቅድ
910	hero.first_step	am	የመጀመሪያው እርምጃ እዚህ ይጀምራል
911	hero.schedule_consultation	am	የምክር ቀጠሮ ይያዙ - ወደ ስኬት የሚወሰደውን መንገድ ያግኙ
912	hero.start_now	am	ምርመራውን አሁን ይጀምሩ
913	hero.read_about_us	am	ስለ እኛ ተጨማሪ ያንብቡ
914	hero.ready_to_start	am	ለመጀመር ዝግጁ ናችወ?
915	hero.ready_description	am	ምርመራዎን ለማቄጠር እና ወደ ተሻለ ሕይወት የመጀመሪያውን እርምጃ ለመውሰድ ዛሬ ያግኙን.
916	hero.contact_us_now	am	አሁን ያግኙን
917	hero.doctor_alt	am	የADHD ባለሙያ ሐኪም
918	about.title	am	ስለ እኛ
919	about.subtitle	am	የADHD ምርመራ እና ሕክምና ብሉይ
920	about.text	am	በሁሉም የእድሜ ከልልዎች የADHD ምርመራ እና ሕክምና እንሰጠአለን። ቆምአችን ክህሎ የለመዱ ለያች እና ሳይኮሎጂስቶች ይይዙኩት።
921	services.title	am	አገልግሎቶችን
922	services.diagnosis	am	የADHD ምርመራ
923	services.diagnosis_desc	am	ለሕጻናት፣ አዩመራዎች እና አዋቂዎች ሙያዊ እና ትክክለኛ ምርመራ
924	services.treatment	am	የሕክምና እቅድ
925	services.treatment_desc	am	ለለይ ብጉ ፈላጎቶች የተቀናጀ የሕክምና እቅድ
926	services.counseling	am	የበተሰብ ምክር
927	services.counseling_desc	am	ለበተሰበች እና ለቁረባች ድገፍ እና ምረት
928	contact.title	am	እየና ያግኙን
929	contact.phone	am	055-27-399-27
930	contact.email	am	info@keshevplus.co.il
931	contact.address	am	ተል አቢብ፣ እስራኤል
932	contact.subtitle	am	ዝርዝሮችዎን ይተዉ እና በተቻለ ፍጥነት እናገኝዎታለን
933	contact.leave_details	am	ዝርዝሮችዎን ይተዉ
934	contact.full_name	am	ሙሉ ስም
935	contact.phone_label	am	ስልክ
936	contact.email_optional	am	ኢሜይል (አማራጭ)
937	contact.message	am	መልእክት
938	contact.name_placeholder	am	ሙሉ ስምዎን ያስገቡ
939	contact.message_placeholder	am	እንዴት ልንረዳዎ እንደምንችል ይንገሩን...
940	contact.sending	am	በመላክ ላይ...
941	contact.send_message	am	መልእክት ላክ
942	contact.success_title	am	መልእክት በተሳካ ሁኔታ ተልኳል!
943	contact.success_desc	am	በቅርቡ እናገኝዎታለን
944	contact.error_title	am	መልእክት በመላክ ላይ ስህተት
945	contact.error_desc	am	እባክዎ እንደገና ይሞክሩ
946	contact.thank_you	am	ስለ ተገናኙን እናመሰግናለን!
947	contact.will_reply	am	በተቻለ ፍጥነት እንመልሳለን
948	contact.send_another	am	ሌላ መልእክት ላክ
949	contact.privacy_note	am	መረጃዎ ደህንነቱ የተጠበቀ ነው እና ለሶስተኛ ወገኖች አይጋራም
950	contact.call_now	am	አሁን ደውሉ
951	contact.whatsapp	am	በWhatsApp መልእክት ላኩ
952	contact.whatsapp_message	am	ሰላም፣ ስለ ADHD ምርመራ መረጃ እፈልጋለሁ
953	contact.directions	am	አቅጣጫ እና ማቆሚያ
954	contact.directions_desc	am	ወደ ክሊኒኩ ስለመድረስ እና በአቅራቢያ ስለመኪና ማቆሚያ መረጃ
955	contact.clinic_address	am	የክሊኒክ አድራሻ
958	contact.parking_title	am	ማቆሚያ
959	contact.parking_desc	am	በአካባቢው ነጻ የመንገድ ላይ ማቆሚያ ይገኛል። ማቆሚያ ለማግኘት ጥቂት ደቂቃዎች ቀደም ብለው እንዲመጡ እንመክራለን.
960	contact.transport_title	am	የህዝብ ትራንስፖርት
961	contact.transport_desc	am	ክሊኒኩ ከቤር ሸቫ ማዕከላዊ ባቡር ጣቢያ በጥቂት ደቂቃዎች የእግር ጉዞ ርቀት ላይ ነው። በርካታ የአውቶቡስ መስመሮች በአቅራቢያ ያልፋሉ.
962	questionnaires.title	am	መጠይቆች
963	questionnaires.subtitle	am	ለማውረድ የ ADHD ምርመራ መጠይቆች
964	questionnaires.parent_form	am	ለወላጆች መጠይቅ
965	questionnaires.parent_form_desc	am	ይህ መጠይቅ ለወላጆች የተዘጋጀ ሲሆን ስለ ልጁ ባህሪ በቤት እና በቤተሰብ ሁኔታ ግንዛቤ ይሰጣል።
966	questionnaires.teacher_form	am	ለመምህር መጠይቅ
967	questionnaires.teacher_form_desc	am	ይህ መጠይቅ ለመምህራን የተዘጋጀ ሲሆን ስለ ልጁ ባህሪ በክፍል እና በትምህርት ሁኔታ ግንዛቤ ይሰጣል።
968	questionnaires.self_report	am	ራስ-ሪፖርት መጠይቅ
969	questionnaires.self_report_desc	am	ይህ መጠይቅ ከ18 ዓመት በላይ ለሆኑ ጎልማሶች የትኩረት ጉድለት እና ከልዩ እንቅስቃሴ ዲስኦርደር ለመገምገም የተዘጋጀ ነው።
970	questionnaires.download_files	am	ለማውረድ ፋይሎች
971	questionnaires.download_word	am	Word አውርድ
972	questionnaires.note	am	መጠይቆችን አውርደው ከቀጠሮዎ በፊት ሊሞሉ ይችላሉ
973	questionnaires.download_pdf	am	PDF አውርድ
974	adhd.subtitle	am	ADHD (የትኩረት ጉድለት ከልዩ እንቅስቃሴ ዲስኦርደር) ሁለቱንም ሕጻናትን እና አዋቂዎችን የሚጎዳ የነርቭ ሥርዓት ዕድገት ዲስኦርደር ነው
975	adhd.symptom1_title	am	ትኩረት ለማድረግ ችግር
976	adhd.symptom1_desc	am	ለረጅም ጊዜ ትኩረትን ለማቆየት ችግር፣ በቀላሉ መበታተን እና ረስተኝነት
977	adhd.symptom2_title	am	ከልዩ እንቅስቃሴ
978	adhd.symptom2_desc	am	ዘና ማለት አለመቻል፣ ቆሞ ለመቀመጥ ችግር እና የውስጥ እረፍት ማጣት ስሜት
979	adhd.symptom3_title	am	ድንገተኝነት
980	adhd.symptom3_desc	am	ራስን ለመቆጣጠር ችግር፣ ያለ ቅድመ አስተሳሰብ ፈጣን ውሳኔዎች ማድረግ
981	adhd.symptom4_title	am	ማህበራዊ ተግዳሮቶች
982	adhd.symptom4_desc	am	በማህበራዊ ግንኙነት ችግር፣ ግንኙነቶችን ለመመስረት እና ለማቆየት ችግር
983	adhd.treatable_title	am	ADHD ሊታከም ይችላል!
984	adhd.treatable_desc	am	በትክክለኛ ምርመራ እና ግላዊ የሕክምና እቅድ፣ የሕይወት ጥራት በከፍተኛ ደረጃ ሊሻሻል ይችላል። የመጀመሪያው እርምጃ ባለሙያን ማነጋገር ነው.
985	faq.title	am	በብዛት የሚጠየቁ ጥያቄዎች
986	faq.subtitle	am	ለተለመዱ ጥያቄዎች መልሶች
987	faq.no_answer	am	መልስ አላገኙም? ያግኙን
988	services.process_steps	am	የምርመራ ሂደት እርምጃዎች
989	footer.rights	am	© 2025 ሁሉም መብቶች የተጠበቁ ናችወ - Keshev Plus
990	footer.clinic_desc	am	በሕጻናት፣ በአዩመራዎች እና በአዋቂዎች የADHD ምርመራ እና ሕክምና ግንባር ቀደም ክሊኒክ.
991	footer.quick_links	am	ፈጣን ማገናኛዎች
992	footer.contact_info	am	የግንኙነት መረጃ
993	footer.follow_us	am	ተከተሉን
994	footer.privacy_policy	am	የግላዊነት ፖሊሲ
995	footer.terms_of_use	am	የአጠቃቀም ውሎች
996	footer.address	am	ይጋል አሎን ጎዳና 94፣ ቴል አቪቭ
997	footer.hours	am	እሑድ-ሐሙስ 09:00-19:00
998	admin.dashboard	am	የአስተዳደር ዳሽቦርድ
999	admin.welcome	am	እንዳምረጠው
1000	admin.signout	am	ውጣ
1001	admin.language_settings	am	የቀን ተቆም
1002	admin.multilingual_support	am	ብዙ ቀንዎች ድገፍ
1003	admin.multilingual_desc	am	የቀን መምረጫውን በዕቡ ገጽ ላይ ያብሩ ወይም ያጥፋ
1004	admin.language_mode	am	የቀን ሞድ
1005	admin.bilingual	am	ሁለት ቀንዎች (ዕብራይስጥ / እንግሊዝኛ)
1006	admin.multilingual	am	ብዙ ቀንዎች (ሁሉም ቀንዎች)
1007	admin.default_language	am	የመሰረቱ ቀን
1008	admin.settings_saved	am	ተቆም ተቀምጧል
1009	admin.settings_error	am	ተቆም ማከማቻት አልተሳካም
1010	nav.home	ar	الرئيسية
1011	nav.about	ar	عنّا
1012	nav.services	ar	الخدمات
1013	nav.adhd	ar	ما هو ADHD؟
1014	nav.process	ar	عملية التشخيص
1016	nav.questionnaires	ar	استبيانات
1017	nav.contact	ar	اتّصل بنا
1018	nav.skip_to_content	ar	انتقل إلى المحتوى الرئيسي
1019	nav.main_navigation	ar	التنقل الرئيسي
1020	nav.go_home	ar	الذهاب إلى الصفحة الرئيسية
1021	nav.call_us	ar	اتصل بنا: 055-27-399-27
1022	nav.close_menu	ar	إغلاق القائمة
1023	nav.open_menu	ar	فتح القائمة
1024	hero.title	ar	مرحباً بكم في عيادة
1025	hero.clinic	ar	"Keshev Plus"
1026	hero.subtitle	ar	أطفال • مراهقون • بالغون
1027	hero.description	ar	في "Keshev Plus" ستحصلون على تشخيص دقيق\nوخطة علاج شخصية
1028	hero.step	ar	الخطوة الأولى تبدأ هنا
1029	hero.consultation	ar	حدّد موعداً للاستشارة - اكتشف الطريق إلى النجاح
1030	hero.read_more	ar	اقرأ المزيد
1031	hero.start_diagnosis	ar	ابدأ التشخيص الآن
1032	hero.ready_title	ar	هل أنت مستعد؟
1033	hero.ready_text	ar	اتّصل بنا اليوم لتحديد موعد التشخيص واتّخاذ الخطوة الأولى\nنحو حياة أفضل.
1034	hero.contact_now	ar	اتّصل بنا الآن
1035	hero.welcome_line1	ar	مرحباً بكم في
1036	hero.welcome_line2	ar	عيادة "Keshev Plus"
1037	hero.clinic_description	ar	عيادة لتشخيص وعلاج اضطراب فرط الحركة وتشتت الانتباه
1038	hero.typing_children	ar	عند الأطفال
1039	hero.typing_teens	ar	عند المراهقين
1040	hero.typing_adults	ar	عند البالغين
1041	hero.accurate_diagnosis	ar	في "Keshev Plus" ستحصلون على تشخيص دقيق
1042	hero.personal_plan	ar	وخطة علاج شخصية
1043	hero.first_step	ar	الخطوة الأولى تبدأ هنا
1044	hero.schedule_consultation	ar	حدّد موعداً للاستشارة - اكتشف الطريق إلى النجاح
1045	hero.start_now	ar	ابدأ التشخيص الآن
1046	hero.read_about_us	ar	اقرأ المزيد عنّا
1047	hero.ready_to_start	ar	هل أنت مستعد للبدء؟
1048	hero.ready_description	ar	اتّصل بنا اليوم لتحديد موعد التشخيص واتّخاذ الخطوة الأولى نحو حياة أفضل.
1049	hero.contact_us_now	ar	اتّصل بنا الآن
1050	hero.doctor_alt	ar	طبيب متخصص في اضطراب فرط الحركة وتشتت الانتباه
1051	about.title	ar	عنّا
1052	about.subtitle	ar	متخصصون في تشخيص وعلاج ADHD
1053	about.text	ar	نحن متخصصون في تشخيص وعلاج ADHD لجميع الأعمار. يتكون فريقنا من أطباء وعلماء نفس خبراء.
1054	services.title	ar	خدماتنا
1055	services.diagnosis	ar	تشخيص ADHD
1056	services.diagnosis_desc	ar	تشخيص مهني ودقيق للأطفال والمراهقين والبالغين
1057	services.treatment	ar	خطة العلاج
1058	services.treatment_desc	ar	خطة علاج شخصية مصممة حسب الاحتياجات الفريدة
1059	services.counseling	ar	استشارة عائلية
1060	services.counseling_desc	ar	توجيه ودعم للعائلات والأقارب
1061	contact.title	ar	اتّصل بنا
1062	contact.phone	ar	055-27-399-27
1063	contact.email	ar	info@keshevplus.co.il
1064	contact.address	ar	تل أبيب، إسرائيل
1065	contact.subtitle	ar	اترك بياناتك وسنعود إليك في أقرب وقت ممكن
1066	contact.leave_details	ar	اترك بياناتك
1067	contact.full_name	ar	الاسم الكامل
1068	contact.phone_label	ar	الهاتف
1069	contact.email_optional	ar	البريد الإلكتروني (اختياري)
1070	contact.message	ar	الرسالة
1071	contact.name_placeholder	ar	أدخل اسمك الكامل
1072	contact.message_placeholder	ar	أخبرنا كيف يمكننا مساعدتك...
1073	contact.sending	ar	جارٍ الإرسال...
1074	contact.send_message	ar	إرسال الرسالة
1075	contact.success_title	ar	تم إرسال الرسالة بنجاح!
1076	contact.success_desc	ar	سنعود إليك قريباً
1077	contact.error_title	ar	خطأ في إرسال الرسالة
1078	contact.error_desc	ar	يرجى المحاولة مرة أخرى
1079	contact.thank_you	ar	شكراً لتواصلك معنا!
1080	contact.will_reply	ar	سنعود إليك في أقرب وقت ممكن
1081	contact.send_another	ar	إرسال رسالة أخرى
1082	contact.privacy_note	ar	معلوماتك آمنة ولن تتم مشاركتها مع أطراف ثالثة
1083	contact.call_now	ar	اتصل الآن
1084	contact.whatsapp	ar	رسالة عبر واتساب
1085	contact.whatsapp_message	ar	مرحباً، أريد معلومات عن تشخيص ADHD
1086	contact.directions	ar	الاتجاهات ومواقف السيارات
1087	contact.directions_desc	ar	معلومات حول الوصول إلى العيادة ومواقف السيارات القريبة
1088	contact.clinic_address	ar	عنوان العيادة
1091	contact.parking_title	ar	مواقف السيارات
1092	contact.parking_desc	ar	تتوفر مواقف مجانية في الشارع في المنطقة. ننصح بالوصول قبل بضع دقائق لإيجاد موقف.
1093	contact.transport_title	ar	المواصلات العامة
1166	hero.ready_text	yi	רופט אונדז אָן הײַנט אום צו באַשטעלן אײַער דיאַגנאָז\nאון נעמט דעם ערשטן טריט צו אַ בעסערן לעבן.
1094	contact.transport_desc	ar	تقع العيادة على بعد دقائق سيراً على الأقدام من محطة قطار بئر السبع المركزية. تمر عدة خطوط حافلات بالقرب.
1095	questionnaires.title	ar	استبيانات
1096	questionnaires.subtitle	ar	استبيانات فحص وتشخيص ADHD للتحميل
1097	questionnaires.parent_form	ar	استبيان للوالدين
1098	questionnaires.parent_form_desc	ar	هذا الاستبيان مخصص للوالدين ويوفر رؤى حول سلوك الطفل في المنزل وفي البيئة العائلية.
1099	questionnaires.teacher_form	ar	استبيان للمعلم
1100	questionnaires.teacher_form_desc	ar	هذا الاستبيان مخصص للمعلمين ويوفر رؤى حول سلوك الطفل في الصف وفي البيئة التعليمية.
1101	questionnaires.self_report	ar	استبيان تقرير ذاتي
1102	questionnaires.self_report_desc	ar	هذا الاستبيان مخصص للبالغين فوق 18 عامًا لتقييم اضطرابات نقص الانتباه وفرط النشاط.
1103	questionnaires.download_files	ar	ملفات للتحميل
1104	questionnaires.download_word	ar	تحميل Word
1105	questionnaires.note	ar	يمكنك تحميل الاستبيانات وتعبئتها قبل موعدك في العيادة
1106	questionnaires.download_pdf	ar	تحميل PDF
1107	adhd.subtitle	ar	اضطراب فرط الحركة وتشتت الانتباه (ADHD) هو اضطراب في النمو العصبي يؤثر على الأطفال والبالغين على حد سواء
1108	adhd.symptom1_title	ar	صعوبة في التركيز
1109	adhd.symptom1_desc	ar	صعوبة في الحفاظ على التركيز لفترة طويلة، سهولة التشتت والنسيان
1110	adhd.symptom2_title	ar	فرط الحركة
1111	adhd.symptom2_desc	ar	القلق، صعوبة الجلوس بهدوء والشعور بعدم الراحة الداخلية
1112	adhd.symptom3_title	ar	الاندفاعية
1113	adhd.symptom3_desc	ar	صعوبة في ضبط النفس، اتخاذ قرارات سريعة دون تفكير مسبق
1114	adhd.symptom4_title	ar	تحديات اجتماعية
1115	adhd.symptom4_desc	ar	صعوبة في التواصل الاجتماعي، بناء العلاقات والحفاظ عليها
1116	adhd.treatable_title	ar	ADHD قابل للعلاج!
1117	adhd.treatable_desc	ar	مع التشخيص الدقيق وخطة العلاج الشخصية، يمكن تحسين جودة الحياة بشكل كبير. الخطوة الأولى هي التواصل مع متخصص.
1118	faq.title	ar	أسئلة شائعة
1119	faq.subtitle	ar	إجابات على الأسئلة الأكثر شيوعاً
1120	faq.no_answer	ar	لم تجد إجابة؟ تواصل معنا
1121	services.process_steps	ar	خطوات عمليخ التشخيص
1122	footer.rights	ar	© 2025 جميع الحقوق محفوظة لـ Keshev Plus
1123	footer.clinic_desc	ar	عيادة رائدة في تشخيص وعلاج ADHD عند الأطفال والمراهقين والبالغين.
1124	footer.quick_links	ar	روابط سريعة
1125	footer.contact_info	ar	معلومات الاتصال
1126	footer.follow_us	ar	تابعونا
1127	footer.privacy_policy	ar	سياسة الخصوصية
1128	footer.terms_of_use	ar	شروط الاستخدام
1129	footer.address	ar	شارع يغال ألون 94، تل أبيب
1130	footer.hours	ar	الأحد-الخميس 09:00-19:00
1131	admin.dashboard	ar	لوحة التحكم
1132	admin.welcome	ar	مرحباً بعودتك
1133	admin.signout	ar	تسجيل الخروج
1134	admin.language_settings	ar	إعدادات اللغة
1135	admin.multilingual_support	ar	دعم متعدد اللغات
1136	admin.multilingual_desc	ar	تفعيل أو تعطيل محدد اللغة على الموقع
1137	admin.language_mode	ar	وضع اللغة
1138	admin.bilingual	ar	ثنائي اللغة (العبرية / الإنجليزية)
1139	admin.multilingual	ar	متعدد اللغات (جميع اللغات)
1140	admin.default_language	ar	اللغة الافتراضية
1141	admin.settings_saved	ar	تم حفظ الإعدادات
1142	admin.settings_error	ar	فشل في حفظ الإعدادات
1143	nav.home	yi	היים
1144	nav.about	yi	וועגן אונדז
1145	nav.services	yi	דינסטן
1146	nav.adhd	yi	וואס איז ADHD?
1147	nav.process	yi	דיאַגנאָז פּראָצעס
1148	nav.faq	yi	אפט געפרעגטע פראַגן
1149	nav.questionnaires	yi	פראַגעבויגנס
1150	nav.contact	yi	קאָנטאַקט
1151	nav.skip_to_content	yi	שפּרינג צום הויפּט אינהאַלט
1152	nav.main_navigation	yi	הויפּט נאַוויגאַציע
1153	nav.go_home	yi	גיי צום היים בלאַט
1154	nav.call_us	yi	רופט אונדז: 055-27-399-27
1155	nav.close_menu	yi	פאַרמאַכן מעניו
1156	nav.open_menu	yi	עפענען מעניו
1157	hero.title	yi	ברוכים הבאים אין דער קליניק
1158	hero.clinic	yi	"Keshev Plus"
1159	hero.subtitle	yi	קינדער • יוגנטלעכע • דערוואַקסענע
1160	hero.description	yi	אין "Keshev Plus" וועט איר באַקומען אַ גענויע דיאַגנאָז\nאון אַ פּערזענלעכען באַהאַנדלונג פּלאַן
1161	hero.step	yi	דער ערשטער טריט הויבט אָן דאָ
1162	hero.consultation	yi	באַשטעלט אַ באַראָטונג - אנטדעקט דעם וועג צו הצלחה
1163	hero.read_more	yi	ליינט מער
1164	hero.start_diagnosis	yi	אנהויבן די דיאַגנאָז
1165	hero.ready_title	yi	גרייט אנצוהויבן?
1167	hero.contact_now	yi	רופט אונדז איצט
1168	hero.welcome_line1	yi	ברוכים הבאים צו
1169	hero.welcome_line2	yi	דער קליניק "Keshev Plus"
1170	hero.clinic_description	yi	קליניק פֿאַר דיאַגנאָז און באַהאַנדלונג פֿון ADHD
1171	hero.typing_children	yi	ביי קינדער
1172	hero.typing_teens	yi	ביי יוגנטלעכע
1173	hero.typing_adults	yi	ביי דערוואַקסענע
1174	hero.accurate_diagnosis	yi	אין "Keshev Plus" וועט איר באַקומען אַ גענויע דיאַגנאָז
1175	hero.personal_plan	yi	און אַ פּערזענלעכען באַהאַנדלונג פּלאַן
1176	hero.first_step	yi	דער ערשטער טריט הויבט אָן דאָ
1177	hero.schedule_consultation	yi	באַשטעלט אַ באַראָטונג - אנטדעקט דעם וועג צו הצלחה
1178	hero.start_now	yi	הויבט אָן די דיאַגנאָז איצט
1179	hero.read_about_us	yi	ליינט מער וועגן אונדז
1180	hero.ready_to_start	yi	גרייט אָנצוהויבן?
1181	hero.ready_description	yi	רופט אונדז אָן הײַנט אום צו באַשטעלן אײַער דיאַגנאָז און נעמט דעם ערשטן טריט צו אַ בעסערן לעבן.
1182	hero.contact_us_now	yi	רופט אונדז איצט
1183	hero.doctor_alt	yi	ADHD מומחה דאָקטער
1184	about.title	yi	וועגן אונדז
1185	about.subtitle	yi	מומחים אין ADHD דיאַגנאָז און באַהאַנדלונג
1186	about.text	yi	מיר ספּעציאַליזירן אין ADHD דיאַגנאָז און באַהאַנדלונג פֿאַר אַלע עלטערן. אונדזער טים באַשטייט פֿון דערפֿאַרענע דאָקטוירן און פּסיכאָלאָגן.
1187	services.title	yi	אונדזערע דינסטן
1188	services.diagnosis	yi	ADHD דיאַגנאָז
1189	services.diagnosis_desc	yi	פּראָפעסיאָנעלע און גענויע דיאַגנאָז פֿאַר קינדער, יוגנטלעכע און דערוואַקסענע
1190	services.treatment	yi	באַהאַנדלונג פּלאַן
1191	services.treatment_desc	yi	פּערזענלעכער באַהאַנדלונג פּלאַן אָנגעפּאַסט צו איינציקע באַדערפֿנישן
1192	services.counseling	yi	משפּחה באַראָטונג
1193	services.counseling_desc	yi	אנלייטונג און הילף פֿאַר משפּחות און נאָענטע
1194	contact.title	yi	קאָנטאַקט
1195	contact.phone	yi	055-27-399-27
1196	contact.email	yi	info@keshevplus.co.il
1197	contact.address	yi	תל אביב, ישראל
1198	contact.subtitle	yi	לאָזט אײַערע פּרטים און מיר וועלן זיך צוריק מעלדן ווי שנעל ווי מעגלעך
1199	contact.leave_details	yi	לאָזט אײַערע פּרטים
1200	contact.full_name	yi	פֿולער נאָמען
1201	contact.phone_label	yi	טעלעפֿאָן
1202	contact.email_optional	yi	אימעיל (אָפּציאָנאַל)
1203	contact.message	yi	מעסעדזש
1204	contact.name_placeholder	yi	שרײַבט אײַער פֿולן נאָמען
1205	contact.message_placeholder	yi	דערציילט אונדז ווי מיר קענען העלפֿן...
1206	contact.sending	yi	שיקט...
1207	contact.send_message	yi	שיקט מעסעדזש
1208	contact.success_title	yi	מעסעדזש איז הצלחהדיק געשיקט געוואָרן!
1209	contact.success_desc	yi	מיר וועלן זיך באַלד צוריק מעלדן
1210	contact.error_title	yi	טעות בײַם שיקן מעסעדזש
1211	contact.error_desc	yi	ביטע פּרובירט נאָכאַמאָל
1212	contact.thank_you	yi	אַ דאַנק פֿאַר קאָנטאַקטירן אונדז!
1213	contact.will_reply	yi	מיר וועלן זיך צוריק מעלדן ווי שנעל ווי מעגלעך
1214	contact.send_another	yi	שיקט נאָך אַ מעסעדזש
1215	contact.privacy_note	yi	אײַער אינפֿאָרמאַציע איז זיכער און וועט נישט געטיילט ווערן מיט דריטע צדדים
1216	contact.call_now	yi	רופט איצט
1217	contact.whatsapp	yi	מעסעדזש אויף וואָטסאַפּ
1218	contact.whatsapp_message	yi	שלום, איך וואָלט געוואָלט אינפֿאָרמאַציע וועגן ADHD דיאַגנאָז
1219	contact.directions	yi	ריכטונגען און פּאַרקירונג
1220	contact.directions_desc	yi	אינפֿאָרמאַציע וועגן אָנקומען צו דער קליניק און פּאַרקירונג אין דער נאָענט
1221	contact.clinic_address	yi	קליניק אַדרעס
1224	contact.parking_title	yi	פּאַרקירונג
1225	contact.parking_desc	yi	פֿרײַע גאַס פּאַרקירונג איז פֿאַראַנען אין דער געגנט. מיר רעקאָמענדירן צו קומען אַ פּאָר מינוט פֿריער צו געפֿינען פּאַרקירונג.
1226	contact.transport_title	yi	עפֿנטלעכער טראַנספּאָרט
1227	contact.transport_desc	yi	די קליניק איז אַ קורצער שפּאַציר פֿון באר שבע צענטראַלע באַן סטאַציע. עטלעכע אויטאָבוס ליניעס פֿאָרן אין דער נאָענט.
1228	questionnaires.title	yi	פראַגעבויגנס
1229	questionnaires.subtitle	yi	ADHD סקרירונג און דיאַגנאָז פראַגעבויגנס צום אַראָפּלאָדן
1230	questionnaires.parent_form	yi	פראַגעבויגן פֿאַר עלטערן
1231	questionnaires.parent_form_desc	yi	דער פראַגעבויגן איז באַשטימט פֿאַר עלטערן און גיט אײַנבליקן אין דעם קינדס באַנעמען אין דער הײם און אין דער משפּחה סביבה.
1232	questionnaires.teacher_form	yi	פראַגעבויגן פֿאַר לערער
215	contact.leave_details	he	השאירו פרטים
216	contact.full_name	he	שם מלא
1233	questionnaires.teacher_form_desc	yi	דער פראַגעבויגן איז באַשטימט פֿאַר לערערס און גיט אײַנבליקן אין דעם קינדס באַנעמען אין כיתה און אין דער חינוך סביבה.
1234	questionnaires.self_report	yi	זעלבסט-באַריכט פראַגעבויגן
1235	questionnaires.self_report_desc	yi	דער פראַגעבויגן איז באַשטימט פֿאַר דערוואַקסענע איבער 18 יאָר צו אָפּשאַצן אויפֿמערקזאַמקייט דעפֿיציט און היפּעראַקטיוויטעט סטערונגען.
1236	questionnaires.download_files	yi	טעקעס צום אַראָפּלאָדן
1237	questionnaires.download_word	yi	אַראָפּלאָדן Word
1238	questionnaires.note	yi	איר קענט אַראָפּלאָדן די פראַגעבויגנס און אויספֿילן זיי פֿאַר אייער באַזוך
1239	questionnaires.download_pdf	yi	אַראָפּלאָדן PDF
1240	adhd.subtitle	yi	ADHD (אויפֿמערקזאַמקייט דעפֿיציט היפּעראַקטיוויטעט סטערונג) איז אַ נײַראָ-אַנטוויקלונג סטערונג וואָס באַטרעפֿט סײַ קינדער סײַ דערוואַקסענע
1241	adhd.symptom1_title	yi	שוועריקייט צו קאָנצענטרירן
1242	adhd.symptom1_desc	yi	שוועריקייט צו האַלטן פֿאָקוס מיט דער צײַט, לײַכטע אָפּלענקונג און פֿאַרגעסלעכקייט
1243	adhd.symptom2_title	yi	היפּעראַקטיוויטעט
1244	adhd.symptom2_desc	yi	אומרויקייט, שוועריקייט שטיל צו זיצן און אַ געפֿיל פֿון אינערלעכער אומרו
1245	adhd.symptom3_title	yi	אימפּולסיוויטעט
1246	adhd.symptom3_desc	yi	שוועריקייט מיט זעלבסט-קאָנטראָל, שנעלע באַשלוסן אָן פֿאָראויסטראַכטן
1247	adhd.symptom4_title	yi	סאָציאַלע שוועריקייטן
1248	adhd.symptom4_desc	yi	שוועריקייט מיט סאָציאַלער קאָמוניקאַציע, בויען און האַלטן באַציונגען
1249	adhd.treatable_title	yi	ADHD איז באַהאַנדלבאַר!
1250	adhd.treatable_desc	yi	מיט אַ גענויער דיאַגנאָז און אַ פּערזענלעכן באַהאַנדלונג פּלאַן, קען די קוואַליטעט פֿון לעבן באַדײַטנד פֿאַרבעסערט ווערן. דער ערשטער שריט איז זיך ווענדן צו אַ מומחה.
1251	faq.title	yi	אָפט געפרעגטע פֿראַגן
1252	faq.subtitle	yi	ענטפֿערס אויף די מערסט פֿאַרשפּרייטע פֿראַגן
1253	faq.no_answer	yi	נישט געפֿונען אַן ענטפֿער? קאָנטאַקט אונדז
1254	services.process_steps	yi	דיאַגנאָז פּראָצעס טריט
1255	footer.rights	yi	© 2025 אַלע רעכטן רעזערווירט פֿאַר Keshev Plus
1256	footer.clinic_desc	yi	פֿירנדע קליניק פֿאַר ADHD דיאַגנאָז און באַהאַנדלונג ביי קינדער, יוגנטלעכע און דערוואַקסענע.
1257	footer.quick_links	yi	שנעלע לינקס
1258	footer.contact_info	yi	קאָנטאַקט אינפֿאָרמאַציע
1259	footer.follow_us	yi	פֿאָלגט אונדז
1260	footer.privacy_policy	yi	פּריוואַטקייט פּאָליטיק
1261	footer.terms_of_use	yi	באַדינגונגען פֿון באַניצונג
1262	footer.address	yi	יגאל אלון גאַס 94, תל אביב
1263	footer.hours	yi	זונטיק-דאָנערשטיק 09:00-19:00
1264	admin.dashboard	yi	אדמין דאַשבאָרד
1265	admin.welcome	yi	ברוכים הבאים
1266	admin.signout	yi	אַרויס
1267	admin.language_settings	yi	שפּראַך איינשטעלונגען
1268	admin.multilingual_support	yi	מערשפּראַכיק שטיצע
1269	admin.multilingual_desc	yi	אָנצינדן אדער אָפּשטעלן דעם שפּראַך וויילער אויפֿן וועבזייטל
1270	admin.language_mode	yi	שפּראַך מאָדע
1271	admin.bilingual	yi	צוויישפּראַכיק (העבריש / ענגליש)
1272	admin.multilingual	yi	מערשפּראַכיק (אַלע שפּראַכן)
1273	admin.default_language	yi	דעפֿאָלט שפּראַך
1274	admin.settings_saved	yi	איינשטעלונגען געראָטעוועט
1275	admin.settings_error	yi	פֿעלער בײַם ראָטעוון
192	hero.welcome_line1	he	ברוכים הבאים למרפאת
193	hero.welcome_line2	he	"קשב פלוס"
194	hero.clinic_description	he	מרפאה לאבחון וטיפול של הפרעות קשב וריכוז
195	hero.typing_children	he	בילדים
196	hero.typing_teens	he	בבני נוער
197	hero.typing_adults	he	במבוגרים
198	hero.accurate_diagnosis	he	ב"קשב פלוס" תקבלו אבחון מדויק
199	hero.personal_plan	he	ותוכנית טיפול אישית
200	hero.first_step	he	הצעד הראשון מתחיל כאן
201	hero.schedule_consultation	he	קבעו פגישת ייעוץ - בואו לגלות את הדרך להצלחה
202	hero.start_now	he	התחל/י את האבחון עכשיו
203	hero.read_about_us	he	קראו עוד עלינו
204	hero.ready_to_start	he	מוכנים להתחיל?
205	hero.ready_description	he	פנה/י אלינו היום כדי לקבוע את האבחון שלך ולקחת את הצעד הראשון לקראת חיים טובים יותר.
206	hero.contact_us_now	he	צרו קשר עכשיו
207	hero.doctor_alt	he	רופאה מומחית באבחון ADHD
208	nav.skip_to_content	he	דלג לתוכן הראשי
209	nav.main_navigation	he	ניווט ראשי
210	nav.go_home	he	חזרה לדף הבית
211	nav.call_us	he	התקשרו אלינו: 055-27-399-27
212	nav.close_menu	he	סגור תפריט
213	nav.open_menu	he	פתח תפריט
214	contact.subtitle	he	השאירו פרטים ונחזור אליכם בהקדם האפשרי
241	contact.parking_desc	he	ישנה חניה חינמית ברחוב ובסביבה. מומלץ להגיע מספר דקות לפני הפגישה לצורך מציאת חניה.
243	contact.transport_desc	he	המרפאה נמצאת במרחק הליכה קצר מתחנת הרכבת באר שבע מרכז. קווי אוטובוס רבים עוברים בסמוך.
244	footer.clinic_desc	he	מרפאה מובילה לאבחון וטיפול בהפרעות קשב וריכוז בילדים, בני נוער ומבוגרים.
245	footer.quick_links	he	ניווט מהיר
246	footer.contact_info	he	פרטי התקשרות
247	footer.follow_us	he	עקבו אחרינו
248	footer.privacy_policy	he	מדיניות פרטיות
249	footer.terms_of_use	he	תנאי שימוש
250	footer.address	he	יגאל אלון 94, תל אביב
251	footer.hours	he	א'-ה' 09:00-19:00
20	hero.welcome_line1	en	Welcome to
21	hero.welcome_line2	en	"Keshev Plus" Clinic
22	hero.clinic_description	en	Clinic for Diagnosis and Treatment of ADHD
23	hero.typing_children	en	in Children
24	hero.typing_teens	en	in Teens
25	hero.typing_adults	en	in Adults
26	hero.accurate_diagnosis	en	At "Keshev Plus" you will receive accurate diagnosis
27	hero.personal_plan	en	and a personalized treatment plan
28	hero.first_step	en	The first step starts here
29	hero.schedule_consultation	en	Schedule a consultation - discover the path to success
30	hero.start_now	en	Start Diagnosis Now
31	hero.read_about_us	en	Read More About Us
32	hero.ready_to_start	en	Ready to Start?
33	hero.ready_description	en	Contact us today to schedule your diagnosis and take the first step towards a better life.
34	hero.contact_us_now	en	Contact Us Now
35	hero.doctor_alt	en	Expert ADHD specialist doctor
36	nav.skip_to_content	en	Skip to main content
37	nav.main_navigation	en	Main navigation
38	nav.go_home	en	Go to homepage
39	nav.call_us	en	Call us: 055-27-399-27
40	nav.close_menu	en	Close menu
41	nav.open_menu	en	Open menu
42	contact.subtitle	en	Leave your details and we'll get back to you as soon as possible
43	contact.leave_details	en	Leave Your Details
44	contact.full_name	en	Full Name
45	contact.phone_label	en	Phone
46	contact.email_optional	en	Email (optional)
47	contact.message	en	Message
48	contact.name_placeholder	en	Enter your full name
49	contact.message_placeholder	en	Tell us how we can help...
50	contact.sending	en	Sending...
51	contact.send_message	en	Send Message
52	contact.success_title	en	Message sent successfully!
53	contact.success_desc	en	We'll get back to you soon
54	contact.error_title	en	Error sending message
55	contact.error_desc	en	Please try again
56	contact.thank_you	en	Thank you for contacting us!
57	contact.will_reply	en	We'll get back to you as soon as possible
58	contact.send_another	en	Send another message
59	contact.privacy_note	en	Your information is secure and will not be shared with third parties
60	contact.call_now	en	Call Now
61	contact.whatsapp	en	Message on WhatsApp
62	contact.whatsapp_message	en	Hello, I would like information about ADHD diagnosis
63	contact.directions	en	Directions & Parking
64	contact.directions_desc	en	Information about arriving at the clinic and parking nearby
65	contact.clinic_address	en	Clinic Address
68	contact.parking_title	en	Parking
69	contact.parking_desc	en	Free street parking is available in the area. We recommend arriving a few minutes early to find parking.
70	contact.transport_title	en	Public Transport
71	contact.transport_desc	en	The clinic is a short walk from Beer Sheva Central train station. Multiple bus lines pass nearby.
72	footer.clinic_desc	en	Leading clinic for ADHD diagnosis and treatment in children, teens, and adults.
73	footer.quick_links	en	Quick Links
74	footer.contact_info	en	Contact Info
75	footer.follow_us	en	Follow Us
76	footer.privacy_policy	en	Privacy Policy
77	footer.terms_of_use	en	Terms of Use
78	footer.address	en	94 Yigal Alon St., Tel Aviv
79	footer.hours	en	Sun-Thu 09:00-19:00
66	contact.address_line1	en	Alon Towers 1, Floor 12, Office 1202
67	contact.address_line2	en	Yigal Alon 94, Tel Aviv
1454	contact.address_label	de	Adresse:
1455	contact.email_label	de	E-Mail:
1456	contact.details_title	de	Kontaktdaten
1457	contact.directions_title	de	Anfahrt und Parken
1458	contact.clear_form	de	Formular löschen
690	contact.address_line1	de	Alon Towers 1, Etage 12, Büro 1202
691	contact.address_line2	de	Yigal Alon 94, Tel Aviv
1461	contact.email_placeholder	ru	Электронная почта
1462	contact.phone_placeholder	ru	Номер телефона
1463	contact.topic_label	ru	Выберите тему
1464	contact.topic_option1	ru	Диагностика СДВГ
1465	contact.topic_option2	ru	Тест MOXO
1466	contact.topic_option3	ru	Другое
1467	contact.address_label	ru	Адрес:
1468	contact.email_label	ru	Эл. почта:
1469	contact.details_title	ru	Контактная информация
1470	contact.directions_title	ru	Как добраться и парковка
1471	contact.clear_form	ru	Очистить форму
1521	contact.details_title	it	Dettagli di contatto
1522	contact.directions_title	it	Indicazioni e parcheggio
1523	contact.clear_form	it	Cancella modulo
1524	contact.address_line1	it	Alon Towers 1, Piano 12, Ufficio 1202
1525	contact.address_line2	it	Yigal Alon 94, Tel Aviv
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, role, must_change_password, reset_token) FROM stdin;
2	dr@keshevplus.co.il	$2a$10$UvFTDi6SoDDUSeKuSwph8uWEZZV6n5B6XjPWgSC8yy2f7.i8fzSAq	admin	f	\N
3	drkeshevplus@gmail.com	$2a$10$jRB5jug7wdWId1nkj/lJFeaTpzVKud5.x2wMQuyjr24ZFXwFiRmEy	admin	f	\N
\.


--
-- Data for Name: whatsapp_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_messages (id, client_id, wa_message_id, phone, direction, content, media_url, status, raw_payload, created_at) FROM stdin;
\.


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.appointments_id_seq', 2, true);


--
-- Name: client_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.client_activities_id_seq', 2, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clients_id_seq', 9, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contacts_id_seq', 13, true);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversations_id_seq', 296, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 30, true);


--
-- Name: questionnaire_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.questionnaire_submissions_id_seq', 3, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 2, true);


--
-- Name: sms_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sms_verifications_id_seq', 1, false);


--
-- Name: translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.translations_id_seq', 1525, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.whatsapp_messages_id_seq', 1, false);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: client_activities client_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_activities
    ADD CONSTRAINT client_activities_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: questionnaire_submissions questionnaire_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questionnaire_submissions
    ADD CONSTRAINT questionnaire_submissions_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_unique UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: sms_verifications sms_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_verifications
    ADD CONSTRAINT sms_verifications_pkey PRIMARY KEY (id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_messages whatsapp_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id);


--
-- Name: translations_key_language_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX translations_key_language_idx ON public.translations USING btree (key, language);


--
-- Name: messages messages_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict a6EwMjPhZCrhytk6fJ1vnlj85mZd1Z9UbbzcI13ESMRJeAtRtxbRePHohP41mN0

