import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, ArrowRight, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

const AccessibilityStatementPage = () => {
  const { language, isRTL } = useLanguage();
  const isHe = language === "he";
  const dir = isRTL ? "rtl" : "ltr";
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const accommodations = isHe
    ? [
        "תפריט נגישות ייעודי (סמל כיסא הגלגלים בפינת המסך) המאפשר לכל מבקר להתאים את תצוגת האתר לצרכיו האישיים.",
        "הגדלה והקטנה של גודל הטקסט.",
        "שינוי גובה השורה והמרווח בין האותיות והמילים, לנוחות קוראים עם קשיי קריאה.",
        "מצב ניגודיות גבוהה ומצב גווני אפור.",
        "הדגשת קישורים באתר.",
        "מעבר לגופן קריא במיוחד.",
        "סמן עכבר מוגדל.",
        "מדריך קריאה נייד העוקב אחר תנועת העכבר.",
        "עצירת אנימציות ומעברים גרפיים.",
        "מצב תצוגה כהה (Dark Mode).",
        "תיאורי טקסט חלופיים (alt) לתמונות באתר.",
        "אפשרות דילוג ישיר לתוכן המרכזי עבור משתמשי מקלדת וקוראי מסך.",
        "תמיכה בניווט באמצעות מקלדת ותאימות לתוכנות קוראות מסך נפוצות.",
        "עיצוב רספונסיבי המותאם לצפייה בטלפון נייד, בטאבלט ובמחשב.",
      ]
    : [
        "A dedicated accessibility menu (wheelchair icon in the corner of the screen) that lets every visitor adjust the site to their needs.",
        "Increasing and decreasing text size.",
        "Adjusting line height and letter/word spacing for readers with reading difficulties.",
        "High-contrast mode and grayscale mode.",
        "Link highlighting.",
        "Switching to a highly legible font.",
        "An enlarged mouse cursor.",
        "A moving reading guide that follows the cursor.",
        "Stopping animations and transitions.",
        "Dark mode.",
        "Descriptive alt text for images on the site.",
        "A direct skip-to-content link for keyboard and screen-reader users.",
        "Keyboard navigation support and compatibility with common screen readers.",
        "A responsive design suited for mobile, tablet, and desktop viewing.",
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20" dir={dir}>
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <BackArrow className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold" data-testid="text-accessibility-title">
            {isHe ? "הצהרת נגישות" : "Accessibility Statement"}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              {isHe
                ? 'קשב פלוס פועלת להנגשת השירותים הדיגיטליים שלה לכלל הציבור, כולל אנשים עם מוגבלות, מתוך אמונה שלכל אדם מגיע שירות שוויוני ונגיש. ההנגשה מבוצעת מתוך מחויבות לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998, ולתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013, ותוך שאיפה לעמידה בדרישות תקן ישראלי ת"י 5568 ובהנחיות הנגישות הבינלאומיות WCAG 2.0 ברמה AA.'
                : "Keshev Plus works to make its digital services accessible to the general public, including people with disabilities, out of a belief that everyone deserves equal and accessible service. This work is carried out in accordance with Israel's Equal Rights for Persons with Disabilities Law, 1998, the Equal Rights for Persons with Disabilities Regulations (Service Accessibility Adjustments), 2013, and in line with Israeli Standard 5568 and the international WCAG 2.0 Level AA guidelines."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {isHe ? "התאמות הנגישות שבוצעו באתר" : "Accessibility accommodations on this site"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={isHe ? "space-y-2 pr-5 list-disc text-sm" : "space-y-2 pl-5 list-disc text-sm"}>
              {accommodations.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isHe ? "מגבלות ידועות" : "Known limitations"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-foreground/90">
            <p>
              {isHe
                ? "אנו פועלים באופן שוטף לשיפור הנגישות של האתר. חרף מאמצינו, ייתכן שיימצאו חלקים באתר שטרם הונגשו במלואם. אם נתקלתם בתוכן, עמוד או רכיב שאינו נגיש כראוי, נשמח שתיידעו אותנו כדי שנוכל לטפל בכך בהקדם האפשרי."
                : "We continuously work to improve the site's accessibility. Despite our efforts, some parts of the site may not yet be fully accessible. If you encounter content, a page, or a component that is not properly accessible, please let us know so we can address it as soon as possible."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isHe ? "רכז/ת נגישות ופנייה בנושא נגישות" : "Accessibility coordinator & contact"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground mb-2">
              {isHe
                ? "פניות, הערות והצעות בנושא נגישות האתר ניתן להפנות אלינו בדרכים הבאות:"
                : "Questions, comments, and suggestions about the site's accessibility can be sent to us via:"}
            </p>
            <a href="tel:0552739927" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-a11y-phone">
              <Phone className="w-4 h-4 shrink-0" />
              <span dir="ltr">055-27-399-27</span>
            </a>
            <a href="mailto:dr@keshevplus.co.il" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-a11y-email">
              <Mail className="w-4 h-4 shrink-0" />
              <span>dr@keshevplus.co.il</span>
            </a>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{isHe ? "יגאל אלון 94, תל אביב" : "94 Yigal Alon St., Tel Aviv"}</span>
            </div>
            <p className="text-muted-foreground pt-2">
              {isHe
                ? "נשתדל להשיב לכל פנייה בעניין נגישות בתוך זמן סביר."
                : "We aim to respond to accessibility inquiries within a reasonable time."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isHe ? "פנייה לגורמים נוספים" : "Further recourse"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-foreground/90">
            <p>
              {isHe
                ? "אם לא קיבלתם מענה מספק מאיתנו, ניתן לפנות לנציבות שוויון זכויות לאנשים עם מוגבלות במשרד המשפטים, האחראית על אכיפת חוק שוויון זכויות לאנשים עם מוגבלות."
                : "If you did not receive a satisfactory response from us, you may contact the Commission for Equal Rights of Persons with Disabilities at the Ministry of Justice, which is responsible for enforcing the Equal Rights for Persons with Disabilities Law."}
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center pt-2" data-testid="text-a11y-updated">
          {isHe ? "הצהרת הנגישות עודכנה לאחרונה בתאריך: 15 ביולי 2026." : "This accessibility statement was last updated on: July 15, 2026."}
        </p>
      </main>
    </div>
  );
};

export default AccessibilityStatementPage;
