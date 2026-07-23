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
  const { t, language, isRTL } = useLanguage();
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
              {t("privacy.title")}
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
            <p>{t("privacy.intro")}</p>
          </CardContent>
        </Card>

        <Section title={t("privacy.data_collected_title")}>
          <ul className={listClass}>
            <li>{t("privacy.data_collected_1")}</li>
            <li>{t("privacy.data_collected_2")}</li>
            <li>{t("privacy.data_collected_3")}</li>
            <li>{t("privacy.data_collected_4")}</li>
          </ul>
        </Section>

        <Section title={t("privacy.purposes_title")}>
          <ul className={listClass}>
            <li>{t("privacy.purpose_1")}</li>
            <li>{t("privacy.purpose_2")}</li>
            <li>{t("privacy.purpose_3")}</li>
            <li>{t("privacy.purpose_4")}</li>
            <li>{t("privacy.purpose_5")}</li>
          </ul>
        </Section>

        <Section title={t("privacy.sharing_title")}>
          <p>{t("privacy.sharing_body")}</p>
        </Section>

        <Section title={t("privacy.security_title")}>
          <p>{t("privacy.security_body")}</p>
        </Section>

        <Section title={t("privacy.rights_title")}>
          <p>{t("privacy.rights_body")}</p>
        </Section>

        <Section title={t("privacy.contact_title")}>
          <a href="tel:0552739927" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-privacy-phone">
            <Phone className="w-4 h-4 shrink-0" />
            <span dir="ltr">055-27-399-27</span>
          </a>
          <a href="mailto:office@keshevplus.co.il" className="flex items-center gap-2 hover:text-primary transition-colors" data-testid="link-privacy-email">
            <Mail className="w-4 h-4 shrink-0" />
            <span>office@keshevplus.co.il</span>
          </a>
        </Section>

        <p className="text-xs text-muted-foreground text-center pt-2" data-testid="text-privacy-updated">
          {t("privacy.updated_date")}
        </p>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
