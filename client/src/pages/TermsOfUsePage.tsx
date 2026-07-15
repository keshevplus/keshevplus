import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const TermsOfUsePage = () => {
  const { language, isRTL } = useLanguage();
  const isHe = language === "he";
  const dir = isRTL ? "rtl" : "ltr";
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20" dir={dir}>
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <BackArrow className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold" data-testid="text-terms-title">
            {isHe ? "תנאי שימוש" : "Terms of Use"}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardContent className="pt-6 text-sm leading-relaxed text-foreground/90">
            <p>
              {isHe
                ? 'השימוש באתר קשב פלוס ("האתר") כפוף לתנאים המפורטים להלן. גלישה באתר ו/או שימוש בשירותיו מהווים הסכמה לתנאים אלה.'
                : 'Use of the Keshev Plus website ("the Site") is subject to the terms below. Browsing the Site and/or using its services constitutes agreement to these terms.'}
            </p>
          </CardContent>
        </Card>

        <Section title={isHe ? "אופי השירות" : "Nature of the service"}>
          <p>
            {isHe
              ? 'האתר מספק מידע כללי על אבחון וטיפול בהפרעת קשב וריכוז (ADHD), וכן כלים מקוונים לתיאום פגישות ולמילוי שאלוני סינון ראשוניים.'
              : "The Site provides general information about the diagnosis and treatment of ADHD, along with online tools for scheduling appointments and completing initial screening questionnaires."}
          </p>
          <p className="font-medium">
            {isHe
              ? "שאלוני הסינון המקוונים אינם מהווים אבחון רפואי ואינם תחליף לייעוץ, אבחון או טיפול על ידי איש מקצוע מוסמך. תוצאות השאלון מיועדות לסייע לצוות המרפאה בהערכה הראשונית בלבד, ואבחון סופי ניתן אך ורק במסגרת בדיקה קלינית."
              : "The online screening questionnaires do not constitute a medical diagnosis and are not a substitute for consultation, diagnosis, or treatment by a qualified professional. Questionnaire results are intended only to assist our clinical staff in an initial assessment; a final diagnosis is given only through a clinical evaluation."}
          </p>
        </Section>

        <Section title={isHe ? "שימוש הוגן באתר" : "Fair use of the site"}>
          <p>
            {isHe
              ? "אין להשתמש באתר לכל מטרה בלתי חוקית, ואין לנסות לפגוע בפעילותו התקינה, לרבות ניסיונות פריצה, גישה לא מורשית למידע, או שימוש אוטומטי לאיסוף תוכן (scraping) ללא אישור מראש."
              : "The Site may not be used for any unlawful purpose, and no attempt may be made to interfere with its proper operation, including hacking attempts, unauthorized access to data, or automated scraping without prior consent."}
          </p>
        </Section>

        <Section title={isHe ? "קניין רוחני" : "Intellectual property"}>
          <p>
            {isHe
              ? "כל הזכויות בתכני האתר, לרבות טקסטים, עיצוב, לוגו ותמונות, שייכות לקשב פלוס או לצדדים שלישיים שהעניקו לה רישיון שימוש, ואין להעתיקם או להשתמש בהם ללא אישור בכתב."
              : "All rights in the Site's content, including text, design, logo, and images, belong to Keshev Plus or to third parties who have licensed their use to it, and may not be copied or used without written permission."}
          </p>
        </Section>

        <Section title={isHe ? "הגבלת אחריות" : "Limitation of liability"}>
          <p>
            {isHe
              ? "המידע באתר מוצג לצרכי מידע כללי בלבד ואינו מהווה ייעוץ רפואי. קשב פלוס אינה אחראית לכל נזק שייגרם כתוצאה מהסתמכות על תוכן האתר ללא ייעוץ מקצועי מתאים. קישורים לאתרים ולשירותים חיצוניים (כגון WhatsApp ורשתות חברתיות) כפופים לתנאי השימוש ומדיניות הפרטיות של אותם צדדים שלישיים, ואיננו אחראים לתוכנם."
              : "Information on the Site is provided for general informational purposes only and does not constitute medical advice. Keshev Plus is not liable for any damage arising from reliance on the Site's content without appropriate professional consultation. Links to external sites and services (such as WhatsApp and social media) are subject to the terms of use and privacy policies of those third parties, and we are not responsible for their content."}
          </p>
        </Section>

        <Section title={isHe ? "דין וסמכות שיפוט" : "Governing law and jurisdiction"}>
          <p>
            {isHe
              ? "על תנאים אלה יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית בכל עניין הנוגע להם נתונה לבתי המשפט המוסמכים במחוז תל אביב."
              : "These terms are governed by the laws of the State of Israel, and the courts of the Tel Aviv district shall have exclusive jurisdiction over any matter relating to them."}
          </p>
        </Section>

        <Section title={isHe ? "שינויים בתנאים" : "Changes to these terms"}>
          <p>
            {isHe
              ? "אנו רשאים לעדכן תנאים אלה מעת לעת. המשך השימוש באתר לאחר פרסום שינויים מהווה הסכמה לתנאים המעודכנים."
              : "We may update these terms from time to time. Continued use of the Site after changes are posted constitutes acceptance of the updated terms."}
          </p>
        </Section>

        <Section title={isHe ? "יצירת קשר" : "Contact"}>
          <a href="tel:0552739927" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-terms-phone">
            <Phone className="w-4 h-4 shrink-0" />
            <span dir="ltr">055-27-399-27</span>
          </a>
          <a href="mailto:dr@keshevplus.co.il" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-terms-email">
            <Mail className="w-4 h-4 shrink-0" />
            <span>dr@keshevplus.co.il</span>
          </a>
        </Section>

        <p className="text-xs text-muted-foreground text-center pt-2" data-testid="text-terms-updated">
          {isHe ? "תנאים אלה עודכנו לאחרונה בתאריך: 15 ביולי 2026." : "These terms were last updated on: July 15, 2026."}
        </p>
      </main>
    </div>
  );
};

export default TermsOfUsePage;
