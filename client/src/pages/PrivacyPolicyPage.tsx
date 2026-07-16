import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, ArrowRight, Mail, Phone } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="text-sm leading-relaxed text-foreground/90 space-y-2">
      {children}
    </CardContent>
  </Card>
);

const PrivacyPolicyPage = () => {
  const { language, isRTL } = useLanguage();
  const isHe = language === "he";
  const dir = isRTL ? "rtl" : "ltr";
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const listClass = isHe ? "space-y-1.5 pr-5 list-disc" : "space-y-1.5 pl-5 list-disc";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20" dir={dir}>
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <BackArrow className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold truncate" data-testid="text-privacy-title">
              {isHe ? "מדיניות פרטיות" : "Privacy Policy"}
            </h1>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardContent className="pt-6 text-sm leading-relaxed text-foreground/90">
            <p>
              {isHe
                ? 'קשב פלוס ("אנחנו", "המרפאה") מכבדת את פרטיותכם. מדיניות זו מסבירה אילו נתונים אנו אוספים דרך האתר, לשם מה אנו משתמשים בהם וכיצד ניתן לפנות אלינו בנושא. המדיניות פועלת בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, ותקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017.'
                : 'Keshev Plus ("we", "the clinic") respects your privacy. This policy explains what data we collect through the site, what we use it for, and how to contact us about it. It operates in accordance with Israel\'s Privacy Protection Law, 1981, and the Privacy Protection (Data Security) Regulations, 2017.'}
            </p>
          </CardContent>
        </Card>

        <Section title={isHe ? "המידע שאנו אוספים" : "Information we collect"}>
          <ul className={listClass}>
            <li>
              {isHe
                ? "פרטי יצירת קשר: שם, כתובת דוא\"ל ומספר טלפון, כאשר אתם פונים אלינו, קובעים תור או משתמשים בטופס יצירת קשר."
                : "Contact details: name, email address, and phone number, when you contact us, book an appointment, or use the contact form."}
            </li>
            <li>
              {isHe
                ? "נתוני שאלוני סינון ADHD: שם הילד/ה, גיל, מין וקרבה למשיב, יחד עם התשובות לשאלון. מדובר במידע רגיש הקשור להערכה קלינית ראשונית, ואנו מטפלים בו בזהירות מוגברת."
                : "ADHD screening questionnaire data: the child's name, age, gender, and relationship to the respondent, together with the questionnaire answers. This is sensitive information related to an initial clinical assessment, and we handle it with additional care."}
            </li>
            <li>
              {isHe
                ? "עוגיות (cookies) הכרחיות, סטטיסטיות ולהעדפות, כמפורט בבאנר העוגיות באתר."
                : "Essential, statistical, and preference cookies, as detailed in the site's cookie banner."}
            </li>
            <li>
              {isHe
                ? "נתוני שימוש טכניים בסיסיים (כגון סוג דפדפן ומכשיר) הנאספים באופן אוטומטי לצורך תפעול האתר."
                : "Basic technical usage data (such as browser and device type) collected automatically to operate the site."}
            </li>
          </ul>
        </Section>

        <Section title={isHe ? "מטרות השימוש במידע" : "Purposes of use"}>
          <ul className={listClass}>
            <li>{isHe ? "תיאום וניהול פגישות ותורים." : "Scheduling and managing appointments."}</li>
            <li>{isHe ? "עיבוד שאלוני הסינון לצורך הערכה קלינית ראשונית על ידי הצוות המטפל." : "Processing screening questionnaires for an initial clinical evaluation by our clinical staff."}</li>
            <li>{isHe ? "מענה לפניות ולבקשות מידע." : "Responding to inquiries and information requests."}</li>
            <li>{isHe ? "שיפור השירות והאתר וניתוח שימוש סטטיסטי כללי." : "Improving the service and site, and general statistical usage analysis."}</li>
            <li>{isHe ? "עמידה בחובות חוקיות ורגולטוריות החלות עלינו." : "Meeting legal and regulatory obligations that apply to us."}</li>
          </ul>
        </Section>

        <Section title={isHe ? "שיתוף מידע" : "Sharing information"}>
          <p>
            {isHe
              ? 'איננו מוכרים את המידע האישי שלכם. המידע נגיש לצוות המרפאה לצורך מתן הטיפול בלבד, ועשוי להיחשף לפי דרישת הדין או רשות מוסמכת. פנייה בוואטסאפ מפנה לאפליקציית WhatsApp החיצונית, הכפופה למדיניות הפרטיות שלה.'
              : "We do not sell your personal information. Data is accessible to clinic staff solely for providing care, and may be disclosed if required by law or a competent authority. The WhatsApp contact link opens the external WhatsApp application, which is governed by its own privacy policy."}
          </p>
        </Section>

        <Section title={isHe ? "אבטחת מידע ושמירתו" : "Data security and retention"}>
          <p>
            {isHe
              ? "אנו נוקטים באמצעים טכניים וארגוניים סבירים להגנה על המידע שנאסף. המידע נשמר למשך הזמן הנדרש למתן השירות ולעמידה בחובות שמירת רשומות רפואיות/עסקיות החלות עלינו, ולאחר מכן נמחק או הופך לאנונימי."
              : "We take reasonable technical and organizational measures to protect the information we collect. Information is retained for as long as needed to provide the service and to meet applicable medical/business record-keeping obligations, after which it is deleted or anonymized."}
          </p>
        </Section>

        <Section title={isHe ? "הזכויות שלכם" : "Your rights"}>
          <p>
            {isHe
              ? 'בהתאם לחוק הגנת הפרטיות, זכותכם לעיין במידע שנשמר עליכם, לבקש את תיקונו, ובנסיבות מסוימות את מחיקתו. לצורך מימוש זכויות אלה, פנו אלינו בפרטי הקשר המפורטים למטה.'
              : "In accordance with the Privacy Protection Law, you have the right to review the information held about you, request its correction, and in certain circumstances request its deletion. To exercise these rights, please contact us using the details below."}
          </p>
        </Section>

        <Section title={isHe ? "יצירת קשר בנושא פרטיות" : "Privacy contact"}>
          <a href="tel:0552739927" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-privacy-phone">
            <Phone className="w-4 h-4 shrink-0" />
            <span dir="ltr">055-27-399-27</span>
          </a>
          <a href="mailto:dr@keshevplus.co.il" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-privacy-email">
            <Mail className="w-4 h-4 shrink-0" />
            <span>dr@keshevplus.co.il</span>
          </a>
        </Section>

        <p className="text-xs text-muted-foreground text-center pt-2" data-testid="text-privacy-updated">
          {isHe ? "מדיניות זו עודכנה לאחרונה בתאריך: 15 ביולי 2026." : "This policy was last updated on: July 15, 2026."}
        </p>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
