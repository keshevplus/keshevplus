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

const TermsOfUsePage = () => {
  const { t, isRTL } = useLanguage();
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
            <h1 className="text-lg font-semibold truncate" data-testid="text-terms-title">
              {t("terms.title")}
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
            <p>{t("terms.intro")}</p>
          </CardContent>
        </Card>

        <Section title={t("terms.service_nature_title")}>
          <p>{t("terms.service_nature_p1")}</p>
          <p className="font-medium">{t("terms.service_nature_p2")}</p>
        </Section>

        <Section title={t("terms.fair_use_title")}>
          <p>{t("terms.fair_use_body")}</p>
        </Section>

        <Section title={t("terms.ip_title")}>
          <p>{t("terms.ip_body")}</p>
        </Section>

        <Section title={t("terms.liability_title")}>
          <p>{t("terms.liability_body")}</p>
        </Section>

        <Section title={t("terms.jurisdiction_title")}>
          <p>{t("terms.jurisdiction_body")}</p>
        </Section>

        <Section title={t("terms.changes_title")}>
          <p>{t("terms.changes_body")}</p>
        </Section>

        <Section title={t("terms.contact_title")}>
          <a href="tel:0552739927" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-terms-phone">
            <Phone className="w-4 h-4 shrink-0" />
            <span dir="ltr">055-27-399-27</span>
          </a>
          <a href="mailto:office@keshevplus.co.il" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-terms-email">
            <Mail className="w-4 h-4 shrink-0" />
            <span>office@keshevplus.co.il</span>
          </a>
        </Section>

        <p className="text-xs text-muted-foreground text-center pt-2" data-testid="text-terms-updated">
          {t("terms.updated_date")}
        </p>
      </main>
    </div>
  );
};

export default TermsOfUsePage;
