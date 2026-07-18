import { lazy, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MedicalHero from "@/components/MedicalHero";
import StickySectionTitle from "@/components/StickySectionTitle";
import { useLanguage } from "@/hooks/useLanguage";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { DEFAULT_HOME_SECTIONS, type HomeSection } from "@shared/schema";

const Footer = lazy(() => import("@/components/Footer"));

function SectionFallback() {
  return <div className="py-32" />;
}

const Index = () => {
  const { isRTL } = useLanguage();
  const { data: sections } = useQuery<HomeSection[]>({
    queryKey: ["/api/home-sections"],
    placeholderData: DEFAULT_HOME_SECTIONS,
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryScroll, 100);
      }
    };
    tryScroll();
  }, []);

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
        <SectionRenderer sections={sections} />
      </main>
      <Suspense fallback={<SectionFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
