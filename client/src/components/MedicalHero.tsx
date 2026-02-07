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

  const typingTexts =
    language === "he"
      ? ["בילדים", "בבני נוער", "במבוגרים"]
      : ["in Children", "in Teens", "in Adults"];

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
          aria-label={
            language === "he"
              ? "ברוכים הבאים לקשב פלוס"
              : "Welcome to Keshev Plus"
          }
        >
          <div className="relative z-10">
            <div className="flex flex-row items-end pt-20 sm:pt-24 md:pt-28">
              <motion.div
                className="w-1/2 px-3 sm:px-6 lg:px-8 xl:px-12 pb-4 sm:pb-8 md:pb-12 lg:pb-16 flex flex-col items-center text-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <motion.h1
                  className="font-bold text-primary leading-tight"
                  style={{
                    fontSize: "clamp(1.1rem, 2.5vw + 0.5rem, 3.5rem)",
                    marginBottom: "clamp(0.15rem, 0.5vw, 0.5rem)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {language === "he" ? "ברוכים הבאים למרפאת" : "Welcome to"}
                  <br />
                  {language === "he" ? '"קשב פלוס"' : '"Keshev Plus" Clinic'}
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
                  {language === "he"
                    ? 'ברוכים הבאים למרפאת "קשב פלוס"'
                    : 'Welcome to "Keshev Plus" Clinic'}
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
                  {language === "he" ? (
                    <>
                      ב"קשב פלוס" תקבלו אבחון מדויק
                      <br />
                      ותוכנית טיפול אישית
                    </>
                  ) : (
                    'At "Keshev Plus" you will receive accurate diagnosis and a personalized treatment plan'
                  )}
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
                    {language === "he"
                      ? "הצעד הראשון מתחיל כאן"
                      : "The first step starts here"}
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: "clamp(0.6rem, 1vw + 0.1rem, 1.1rem)",
                    }}
                  >
                    {language === "he"
                      ? "קבעו פגישת ייעוץ - בואו לגלות את הדרך להצלחה"
                      : "Schedule a consultation - discover the path to success"}
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
                    {language === "he"
                      ? "התחל/י את האבחון עכשיו"
                      : "Start Diagnosis Now"}
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
                    {language === "he"
                      ? "קראו עוד עלינו"
                      : "Read More About Us"}
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
                  alt={
                    language === "he"
                      ? "רופאה מומחית באבחון ADHD"
                      : "Expert ADHD specialist doctor"
                  }
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
                {language === "he" ? "מוכנים להתחיל?" : "Ready to Start?"}
              </motion.h2>

              <motion.p
                className="text-sm sm:text-base md:text-lg text-primary-foreground/90 mb-4 md:mb-6 max-w-xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                {language === "he"
                  ? "פנה/י אלינו היום כדי לקבוע את האבחון שלך ולקחת את הצעד הראשון לקראת חיים טובים יותר."
                  : "Contact us today to schedule your diagnosis and take the first step towards a better life."}
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
                  {language === "he" ? "צרו קשר עכשיו" : "Contact Us Now"}
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
