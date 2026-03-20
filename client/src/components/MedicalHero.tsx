import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import doctorHero from "@/assets/doctor-hero.png";
import logoImg from "@/assets/logo.png";
import { useLanguage } from "@/hooks/useLanguage";
import MobileNavigation from "./MobileNavigation";
import ContactModal from "./ContactModal";
import { AccessibleButton } from "./ui/accessible-button";
import { cn } from "@/lib/utils";

const MedicalHero: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const typingTexts = [
    t("hero.typing_children"),
    t("hero.typing_teens"),
    t("hero.typing_adults"),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % typingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [typingTexts.length]);

  return (
    <>
      <MobileNavigation onContactClick={() => setContactModalOpen(true)} />
      <ContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
      />

      <main id="main-content">
        <section
          id="home"
          className="relative bg-background overflow-x-hidden"
          dir={isRTL ? "rtl" : "ltr"}
          aria-label={t("hero.welcome_line1") + " " + t("hero.welcome_line2")}
        >
          <div className="relative z-10">
            {/*
              Nav at top is ~60px (10px padding × 2 + 40px items).
              pt-16 (64px) gives just enough clearance on all breakpoints.
              On mobile the hero switches to a single column; image goes below text.
            */}
            <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end pt-16 sm:pt-16 md:pt-16 lg:pt-16 gap-4 sm:gap-8 lg:gap-12 min-h-[88vh] sm:min-h-[85vh]">

              {/* ── Text content column ─────────────────────────────── */}
              <motion.div
                className={cn(
                  "w-full sm:w-[48%] py-6 sm:py-8 md:py-10 lg:py-14 flex flex-col",
                  "items-center text-center sm:items-start sm:text-start",
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* H1 welcome */}
                <motion.h1
                  className="font-bold text-primary leading-tight"
                  style={{ fontSize: "clamp(1.25rem, 3.5vw, 2.8rem)", marginBottom: "clamp(0.6rem, 1.5vw, 1rem)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {t("hero.welcome_line1")} {t("hero.welcome_line2")}
                </motion.h1>

                {/* Logo — displayed in the hero just like the production site */}
                <motion.div
                  className="flex justify-center sm:justify-start mb-3 sm:mb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <img
                    src={logoImg}
                    alt={isRTL ? "קשב פלוס" : "Keshev Plus"}
                    className="h-24 sm:h-28 md:h-32 lg:h-36 w-auto"
                  />
                </motion.div>

                {/* Clinic description */}
                <motion.p
                  className="text-foreground leading-relaxed"
                  style={{ fontSize: "clamp(0.9rem, 2vw, 1.4rem)", marginBottom: "clamp(0.25rem, 0.6vw, 0.5rem)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {t("hero.clinic_description")}
                </motion.p>

                {/* Animated cycling audience text */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentTextIndex}
                    className="font-bold text-primary"
                    style={{ fontSize: "clamp(1.1rem, 2.8vw, 2.2rem)", marginBottom: "clamp(0.25rem, 0.6vw, 0.5rem)" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {typingTexts[currentTextIndex]}
                  </motion.p>
                </AnimatePresence>

                {/* Accurate diagnosis + personal plan */}
                <motion.p
                  className="text-muted-foreground leading-relaxed"
                  style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)", marginBottom: "clamp(0.4rem, 1vw, 0.75rem)" }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {t("hero.accurate_diagnosis")}
                  <br />
                  {t("hero.personal_plan")}
                </motion.p>

                {/* First step CTA text */}
                <motion.div
                  className="mb-2 sm:mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                >
                  <p
                    className="font-semibold text-foreground"
                    style={{ fontSize: "clamp(1rem, 2.2vw, 1.6rem)", marginBottom: "clamp(0.1rem, 0.3vw, 0.2rem)" }}
                  >
                    {t("hero.first_step")}
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "clamp(0.85rem, 1.8vw, 1.3rem)" }}
                  >
                    {t("hero.schedule_consultation")}
                  </p>
                </motion.div>

                {/* CTA buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <AccessibleButton
                    variant="primary"
                    className="text-sm sm:text-base md:text-lg py-3 sm:py-4 flex-1"
                    onClick={() => {
                      const el = document.getElementById("questionnaires");
                      if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top, behavior: "smooth" });
                      }
                    }}
                    data-testid="button-start-diagnosis"
                  >
                    {t("hero.start_now")}
                  </AccessibleButton>

                  <AccessibleButton
                    variant="secondary"
                    className="text-sm sm:text-base md:text-lg py-3 sm:py-4 flex-1"
                    onClick={() =>
                      document
                        .getElementById("about")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    data-testid="button-read-more"
                  >
                    {t("hero.read_about_us")}
                  </AccessibleButton>
                </motion.div>
              </motion.div>

              {/* ── Doctor image column ──────────────────────────────── */}
              <motion.div
                className="w-full sm:w-[52%] self-end flex items-end justify-center"
                initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <img
                  src={doctorHero}
                  alt={t("hero.doctor_alt")}
                  className="w-full max-h-[55vh] sm:max-h-none sm:h-[70vh] md:h-[78vh] lg:h-[84vh] object-contain object-bottom drop-shadow-2xl block"
                  loading="eager"
                  fetchPriority="high"
                  width="800"
                  height="1000"
                />
              </motion.div>
            </div>
          </div>

          {/* ── Green CTA band ───────────────────────────────────────── */}
          <section
            className="relative z-10 green-section-bg py-6 sm:py-10 md:py-14"
            dir={isRTL ? "rtl" : "ltr"}
            aria-labelledby="cta-heading"
          >
            <div className="container mx-auto px-4 sm:px-6 text-center">
              <motion.h2
                id="cta-heading"
                className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-2 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {t("hero.ready_to_start")}
              </motion.h2>

              <motion.p
                className="text-sm sm:text-base md:text-lg text-primary-foreground/90 mb-4 md:mb-6 max-w-xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                {t("hero.ready_description")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <AccessibleButton
                  variant="secondary"
                  size="lg"
                  onClick={() => setContactModalOpen(true)}
                  data-testid="button-contact-cta"
                >
                  {t("hero.contact_us_now")}
                </AccessibleButton>
              </motion.div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
};

export default MedicalHero;
