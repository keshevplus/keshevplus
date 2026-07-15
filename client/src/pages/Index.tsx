import { lazy, Suspense } from "react";
import MedicalHero from "@/components/MedicalHero";
import StickySectionTitle from "@/components/StickySectionTitle";
import { useLanguage } from "@/hooks/useLanguage";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const ADHDInfoSection = lazy(() => import("@/components/ADHDInfoSection"));
const QuestionnairesSection = lazy(() => import("@/components/QuestionnairesSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));

function SectionFallback() {
  return <div className="py-32" />;
}

const Index = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      <a
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:fixed focus:top-2 ${isRTL ? "focus:right-2" : "focus:left-2"} focus:z-[10000] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md`}
      >
        {isRTL ? "דילוג לתוכן הראשי" : "Skip to main content"}
      </a>
      <StickySectionTitle />
      <MedicalHero />
      <main id="main-content">
        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ServicesSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ADHDInfoSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <QuestionnairesSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ContactSection />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
