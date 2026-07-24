import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { Leaf } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import MobileNavigation from "./MobileNavigation";
import RotatingWord from "./RotatingWord";
import { AccessibleButton } from "./ui/accessible-button";
import { useContactModal } from "@/contexts/ContactModalContext";

const doctorHero = "/images/doctor-hero.png";
const logo = "/images/logo.png";

interface HeroLayoutSettings {
  logoHeightMobile: number;
  logoHeightDesktop: number;
}

const DEFAULT_HERO_LAYOUT: HeroLayoutSettings = {
  logoHeightMobile: 128,
  logoHeightDesktop: 180,
};

const MedicalHero: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { openModal } = useContactModal();
  const { data: heroLayout = DEFAULT_HERO_LAYOUT } = useQuery<HeroLayoutSettings>({
    queryKey: ["/api/settings/hero-layout"],
    placeholderData: DEFAULT_HERO_LAYOUT,
  });
  const logoWidthMobile = Math.max(180, Math.round(heroLayout.logoHeightMobile * 2.55));
  const logoWidthDesktop = Math.max(240, Math.round(heroLayout.logoHeightDesktop * 2.55));

  const typingItems = [
    t("hero.typing_children"),
    t("hero.typing_teens"),
    t("hero.typing_adults"),
  ];

  return (
    <>
      <MobileNavigation />

      <main id="main-content">
        <section
          id="home"
          className="relative bg-background overflow-x-hidden"
          dir={isRTL ? "rtl" : "ltr"}
          aria-label={t("hero.welcome_line1") + " " + t("hero.welcome_line2")}
        >
          <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-8 sm:gap-10 items-center justify-between pb-10 sm:pb-14">

            {/* ── Text column — bottom half in DOM order ── */}
            <motion.div
              className="flex flex-col w-full sm:w-[55%] order-2 sm:order-1 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
                {t("hero.welcome_line1")} {t("hero.welcome_line2")}
              </h1>

              <img
                src={logo}
                alt={isRTL ? "קשב פלוס" : "Keshev Plus"}
                className="hero-logo-image mx-auto mb-4"
                style={{
                  "--hero-logo-max-height-mobile": `${heroLayout.logoHeightMobile}px`,
                  "--hero-logo-max-height-desktop": `${heroLayout.logoHeightDesktop}px`,
                  "--hero-logo-max-width-mobile": `${logoWidthMobile}px`,
                  "--hero-logo-max-width-desktop": `${logoWidthDesktop}px`,
                } as CSSProperties}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />

              <p className="text-lg mb-2 text-foreground leading-relaxed">
                {t("hero.clinic_description")}{" "}
                <RotatingWord words={typingItems} className="font-semibold text-primary" />
              </p>
              <p className="text-lg mb-4 text-foreground leading-relaxed">
                {t("hero.accurate_diagnosis")} {t("hero.personal_plan")}
              </p>

              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {t("hero.first_step")}
              </h2>
              <p className="text-base mb-6 text-muted-foreground leading-relaxed">
                {t("hero.schedule_consultation")}
              </p>

              {/* CTA buttons — pill shape with leaf icon, matching keshev-web */}
              <div className="flex flex-wrap justify-center gap-4">
                <AccessibleButton
                  variant="primary"
                  className="rounded-full gap-2 shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                  onClick={openModal}
                  data-testid="button-contact-cta"
                >
                  {t("hero.start_now")}
                  <Leaf className="h-4 w-4" aria-hidden="true" />
                </AccessibleButton>

                <AccessibleButton
                  variant="secondary"
                  className="rounded-full gap-2 shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                  onClick={() =>
                    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
                  }
                  data-testid="button-read-more"
                >
                  {t("hero.read_about_us")}
                  <Leaf className="h-4 w-4" aria-hidden="true" />
                </AccessibleButton>
              </div>
            </motion.div>

            {/* ── Doctor image column — top half in DOM order ── */}
            <motion.div
              className="w-full sm:w-[45%] flex justify-center sm:justify-start order-1 sm:order-2"
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <img
                src={doctorHero}
                alt={t("hero.doctor_alt")}
                className="w-full h-auto rounded-lg"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width="800"
                height="1000"
              />
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default MedicalHero;
