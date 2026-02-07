import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import doctorHero from "@/assets/doctor-hero.png";
import logo from "@/assets/logo.png";
import { useLanguage } from "@/hooks/useLanguage";
import MobileNavigation from "./MobileNavigation";
import ContactModal from "./ContactModal";
import { AccessibleButton } from "./ui/accessible-button";
import { cn } from "@/lib/utils";

const MedicalHero: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const typingTexts = [t("hero.typing_children"), t("hero.typing_teens"), t("hero.typing_adults")];

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
          className="relative bg-background"
          dir={isRTL ? "rtl" : "ltr"}
          aria-label={t("hero.welcome_line1") + " " + t("hero.welcome_line2")}
        >
          <div className="relative z-10">
            <div className="flex flex-row items-end pt-28 sm:pt-32 md:pt-36 lg:pt-40">
              <motion.div
                className="w-1/2 px-3 sm:px-6 lg:px-8 xl:px-12 pb-4 sm:pb-8 md:pb-12 lg:pb-16 flex flex-col items-center text-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <motion.h1
                  className="font-bold text-primary leading-tight"
                  style={{
                    fontSize: "clamp(1rem, 4vw + 0.25rem, 3.5rem)",
                    marginBottom: "clamp(0.15rem, 0.5vw, 0.5rem)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {t("hero.welcome_line1")}
                  <br />
                  {t("hero.welcome_line2")}
                </motion.h1>

                {/* <motion.img
                  src={logo}
                  alt={language === 'he' ? 'קשב פלוס' : 'Keshev Plus'}
                  className="w-auto mx-auto"
                  style={{ height: 'clamp(40px, 8vw + 10px, 100px)', marginBottom: 'clamp(0.25rem, 0.8vw, 0.75rem)' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                /> */}

                <motion.p
                  className="text-foreground leading-relaxed"
                  style={{
                    fontSize: "clamp(0.7rem, 1.2vw + 0.15rem, 1.35rem)",
                    marginBottom: "clamp(0.1rem, 0.3vw, 0.25rem)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {t("hero.clinic_description")}
                </motion.p>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentTextIndex}
                    className="font-bold text-primary"
                    style={{
                      fontSize: "clamp(0.9rem, 2vw + 0.2rem, 2rem)",
                      marginBottom: "clamp(0.15rem, 0.5vw, 0.5rem)",
                    }}
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

                <motion.p
                  className="text-muted-foreground leading-relaxed"
                  style={{
                    fontSize: "clamp(0.65rem, 1.1vw + 0.1rem, 1.2rem)",
                    marginBottom: "clamp(0.25rem, 0.8vw, 0.75rem)",
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {t("hero.accurate_diagnosis")}
                  <br />
                  {t("hero.personal_plan")}
                </motion.p>

                <motion.div
                  className="mb-1 sm:mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                >
                  <p
                    className="font-semibold text-foreground"
                    style={{
                      fontSize: "clamp(0.7rem, 1.2vw + 0.1rem, 1.35rem)",
                      marginBottom: "clamp(0.1rem, 0.3vw, 0.25rem)",
                    }}
                  >
                    {t("hero.first_step")}
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: "clamp(0.6rem, 1vw + 0.1rem, 1.1rem)",
                    }}
                  >
                    {t("hero.schedule_consultation")}
                  </p>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <AccessibleButton
                    variant="primary"
                    size="sm"
                    className="sm:size-md text-xs sm:text-sm md:text-base flex-1"
                    onClick={() => setContactModalOpen(true)}
                    data-testid="button-start-diagnosis"
                  >
                    {t("hero.start_now")}
                  </AccessibleButton>

                  <AccessibleButton
                    variant="secondary"
                    size="sm"
                    className="sm:size-md text-xs sm:text-sm md:text-base flex-1"
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

              <motion.div
                className="w-1/2 self-end flex items-end justify-center"
                initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <img
                  src={doctorHero}
                  alt={t("hero.doctor_alt")}
                  className="w-full max-h-[65vh] sm:max-h-[70vh] md:max-h-[75vh] h-auto object-contain object-bottom drop-shadow-xl block"
                  loading="eager"
                />
              </motion.div>
            </div>
          </div>

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
