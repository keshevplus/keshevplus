import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import doctorHero from "@/assets/doctor-hero.png";
import { useLanguage } from "@/hooks/useLanguage";
import MobileNavigation from "./MobileNavigation";
import { SiteImage } from "./SiteImage";
import { AccessibleButton } from "./ui/accessible-button";
import { useContactModal } from "@/contexts/ContactModalContext";

const MedicalHero: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { openModal } = useContactModal();

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
          <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-8 sm:gap-10 items-center justify-between pt-24 sm:pt-28 pb-10 sm:pb-14">

            {/* ── Text column — bottom half in DOM order, right-aligned in RTL ── */}
            <motion.div
              className="flex flex-col w-full sm:w-[55%] order-2 sm:order-1 text-center sm:text-right"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
                {t("hero.welcome_line1")} {t("hero.welcome_line2")}
              </h1>

              <p className="text-lg mb-2 text-foreground leading-relaxed">
                {t("hero.clinic_description")}
              </p>
              <p className="text-lg mb-4 text-foreground leading-relaxed">
                {t("hero.accurate_diagnosis")}
                <br />
                {t("hero.personal_plan")}
              </p>

              {/* Rotating "+" joined list, staggered fade-in like keshev-web */}
              <div className="mb-6 flex flex-wrap justify-center sm:justify-end gap-2">
                {typingItems.map((item, idx) => (
                  <span
                    key={item}
                    className="opacity-0 animate-typing inline-flex items-center"
                    style={{ animationDelay: `${idx * 400}ms`, animationFillMode: "forwards" }}
                  >
                    <span className="text-lg font-semibold text-foreground">{item}</span>
                    {idx < typingItems.length - 1 && (
                      <span className="text-primary font-bold mx-2">+</span>
                    )}
                  </span>
                ))}
              </div>

              {/* CTA buttons — pill shape with leaf icon, matching keshev-web */}
              <div className="flex flex-wrap justify-center sm:justify-end gap-4">
                <AccessibleButton
                  variant="primary"
                  className="rounded-full gap-2 shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                  onClick={openModal}
                  data-testid="button-contact-cta"
                >
                  {t("hero.contact_us_now")}
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
              <SiteImage
                slot="hero.image"
                fallback={doctorHero}
                alt={t("hero.doctor_alt")}
                className="w-full h-auto rounded-lg shadow-xl transition-shadow duration-300 hover:shadow-2xl"
                loading="eager"
                fetchPriority="high"
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
