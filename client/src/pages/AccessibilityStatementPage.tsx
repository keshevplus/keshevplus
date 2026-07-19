import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, ArrowRight, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

const ACCOMMODATION_KEYS = [
  "a11y_statement.accommodation_1",
  "a11y_statement.accommodation_2",
  "a11y_statement.accommodation_3",
  "a11y_statement.accommodation_4",
  "a11y_statement.accommodation_5",
  "a11y_statement.accommodation_6",
  "a11y_statement.accommodation_7",
  "a11y_statement.accommodation_8",
  "a11y_statement.accommodation_9",
  "a11y_statement.accommodation_10",
  "a11y_statement.accommodation_11",
  "a11y_statement.accommodation_12",
  "a11y_statement.accommodation_13",
  "a11y_statement.accommodation_14",
];

const AccessibilityStatementPage = () => {
  const { t, language, isRTL } = useLanguage();
  const isHe = language === "he";
  const dir = isRTL ? "rtl" : "ltr";
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

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
            <h1 className="text-lg font-semibold truncate" data-testid="text-accessibility-title">
              {t("a11y_statement.title")}
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
          <CardContent className="pt-6 space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>{t("a11y_statement.intro")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {t("a11y_statement.accommodations_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={isHe ? "space-y-2 pr-5 list-disc text-sm" : "space-y-2 pl-5 list-disc text-sm"}>
              {ACCOMMODATION_KEYS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("a11y_statement.limitations_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-foreground/90">
            <p>{t("a11y_statement.limitations_body")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("a11y_statement.coordinator_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground mb-2">
              {t("a11y_statement.coordinator_intro")}
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
              <span>{t("a11y_statement.address")}</span>
            </div>
            <p className="text-muted-foreground pt-2">
              {t("a11y_statement.response_time")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("a11y_statement.further_recourse_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-foreground/90">
            <p>{t("a11y_statement.further_recourse_body")}</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center pt-2" data-testid="text-a11y-updated">
          {t("a11y_statement.updated_date")}
        </p>
      </main>
    </div>
  );
};

export default AccessibilityStatementPage;
