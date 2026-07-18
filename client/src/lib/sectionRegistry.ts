import type { HomeSection, HomeSectionType } from "@shared/schema";

export interface SectionTypeInfo {
  type: HomeSectionType;
  labelHe: string;
  labelEn: string;
}

// Generic templates an admin can add freely. Legacy types render the
// existing hardcoded business components instead (see LEGACY_SECTION_LABELS)
// and aren't offered in the "add section" picker.
export const GENERIC_SECTION_TYPES: SectionTypeInfo[] = [
  { type: "richText", labelHe: "טקסט עשיר", labelEn: "Rich Text" },
  { type: "cards", labelHe: "כרטיסיות", labelEn: "Cards Grid" },
  { type: "faq", labelHe: "שאלות נפוצות", labelEn: "FAQ" },
  { type: "testimonials", labelHe: "המלצות", labelEn: "Testimonials" },
  { type: "gallery", labelHe: "גלריית תמונות", labelEn: "Image Gallery" },
  { type: "cta", labelHe: "קריאה לפעולה", labelEn: "Call to Action" },
];

export const LEGACY_SECTION_LABELS: Partial<Record<HomeSectionType, { he: string; en: string }>> = {
  "legacy:about": { he: "אודות (מובנה)", en: "About (built-in)" },
  "legacy:services": { he: "שירותים (מובנה)", en: "Services (built-in)" },
  "legacy:adhdInfo": { he: "מידע ADHD (מובנה)", en: "ADHD Info (built-in)" },
  "legacy:questionnaires": { he: "שאלונים (מובנה)", en: "Questionnaires (built-in)" },
  "legacy:contact": { he: "יצירת קשר (מובנה)", en: "Contact (built-in)" },
};

export function sectionTypeLabel(type: HomeSectionType, isHe: boolean): string {
  const generic = GENERIC_SECTION_TYPES.find((t) => t.type === type);
  if (generic) return isHe ? generic.labelHe : generic.labelEn;
  const legacy = LEGACY_SECTION_LABELS[type];
  if (legacy) return isHe ? legacy.he : legacy.en;
  return type;
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultSection(type: HomeSectionType): HomeSection {
  const id = randomId(type.replace(/[^a-zA-Z0-9]/g, "-"));
  const base = { id, type, enabled: true };
  switch (type) {
    case "cards":
      return { ...base, config: { items: [{ id: randomId("item"), icon: "Star" }] } };
    case "faq":
      return { ...base, config: { items: [{ id: randomId("item") }] } };
    case "testimonials":
      return { ...base, config: { items: [{ id: randomId("item") }] } };
    case "gallery":
      return { ...base, config: { items: [{ id: randomId("item") }] } };
    case "cta":
      return { ...base, config: { ctaHref: "#contact" } };
    case "richText":
      return { ...base, config: { ctaHref: "" } };
    default:
      return { ...base, config: {} };
  }
}

export function createDefaultItem(): { id: string; icon?: string } {
  return { id: randomId("item"), icon: "Star" };
}
