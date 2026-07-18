import { lazy, Suspense } from "react";
import type { HomeSection } from "@shared/schema";
import {
  RichTextSectionTemplate,
  CardsSectionTemplate,
  FaqSectionTemplate,
  TestimonialsSectionTemplate,
  GallerySectionTemplate,
  CtaSectionTemplate,
} from "./GenericSectionTemplates";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const ADHDInfoSection = lazy(() => import("@/components/ADHDInfoSection"));
const QuestionnairesSection = lazy(() => import("@/components/QuestionnairesSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));

function SectionFallback() {
  return <div className="py-32" />;
}

// Renders the admin-managed, orderable list of home page sections. "legacy:*"
// types are the original hardcoded business components; the rest are the
// generic CMS templates defined in GenericSectionTemplates.
export function SectionRenderer({ sections }: { sections: HomeSection[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "legacy:about":
            return (
              <Suspense key={section.id} fallback={<SectionFallback />}>
                <AboutSection />
              </Suspense>
            );
          case "legacy:services":
            return (
              <Suspense key={section.id} fallback={<SectionFallback />}>
                <ServicesSection />
              </Suspense>
            );
          case "legacy:adhdInfo":
            return (
              <Suspense key={section.id} fallback={<SectionFallback />}>
                <ADHDInfoSection />
              </Suspense>
            );
          case "legacy:questionnaires":
            return (
              <Suspense key={section.id} fallback={<SectionFallback />}>
                <QuestionnairesSection />
              </Suspense>
            );
          case "legacy:contact":
            return (
              <Suspense key={section.id} fallback={<SectionFallback />}>
                <ContactSection />
              </Suspense>
            );
          case "richText":
            return <RichTextSectionTemplate key={section.id} section={section} />;
          case "cards":
            return <CardsSectionTemplate key={section.id} section={section} />;
          case "faq":
            return <FaqSectionTemplate key={section.id} section={section} />;
          case "testimonials":
            return <TestimonialsSectionTemplate key={section.id} section={section} />;
          case "gallery":
            return <GallerySectionTemplate key={section.id} section={section} />;
          case "cta":
            return <CtaSectionTemplate key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}
