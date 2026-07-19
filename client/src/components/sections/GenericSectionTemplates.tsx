import { useState } from "react";
import * as Icons from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccessibleButton } from "@/components/ui/accessible-button";
import type { HomeSection } from "@shared/schema";

interface TemplateProps {
  section: HomeSection;
}

interface SectionItem {
  id: string;
  icon?: string;
  hidden?: boolean;
}

// A dynamic `section.<id>.<field>` key falls back to the raw key itself when
// untranslated (see i18n/config.ts). That's a useful "something's missing"
// signal in the admin tools, but would leak as visible garbage text on the
// public site for a freshly-added, not-yet-filled-in section — so treat an
// untranslated dynamic key as empty here instead.
function textFor(t: (key: string) => string, key: string): string {
  const val = t(key);
  return val === key ? "" : val;
}

function sectionItems(section: HomeSection): SectionItem[] {
  const items = section.config?.items;
  return Array.isArray(items) ? items.filter((item) => !item.hidden) : [];
}

function resolveIcon(name?: string): Icons.LucideIcon {
  const IconComp = name ? (Icons as unknown as Record<string, Icons.LucideIcon>)[name] : undefined;
  return IconComp ?? Icons.Star;
}

function SectionImage({ slot, alt, className }: { slot: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={`/api/images/${encodeURIComponent(slot)}`}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function RichTextSectionTemplate({ section }: TemplateProps) {
  const { t, isRTL } = useLanguage();
  const id = section.id;
  const heading = textFor(t, `section.${id}.heading`);
  const subtitle = textFor(t, `section.${id}.subtitle`);
  const body = textFor(t, `section.${id}.body`);
  const ctaLabel = textFor(t, `section.${id}.ctaLabel`);
  const ctaHref = typeof section.config?.ctaHref === "string" ? section.config.ctaHref : "";

  return (
    <Section
      id={id}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby={`${id}-heading`}
      header={heading ? <SectionHeader title={heading} subtitle={subtitle || undefined} titleId={`${id}-heading`} /> : undefined}
    >
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
        <SectionImage
          slot={`section.${id}.image`}
          alt={heading}
          className="rounded-xl shadow-lg w-full object-cover aspect-video"
        />
        <div>
          {!heading && <h2 className="sr-only">{id}</h2>}
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
          {ctaHref && ctaLabel && (
            <AccessibleButton asChild className="mt-6">
              <a href={ctaHref}>{ctaLabel}</a>
            </AccessibleButton>
          )}
        </div>
      </div>
    </Section>
  );
}

export function CardsSectionTemplate({ section }: TemplateProps) {
  const { t, isRTL } = useLanguage();
  const id = section.id;
  const heading = textFor(t, `section.${id}.heading`);
  const subtitle = textFor(t, `section.${id}.subtitle`);
  const items = sectionItems(section);

  return (
    <Section
      id={id}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby={`${id}-heading`}
      header={heading ? <SectionHeader title={heading} subtitle={subtitle || undefined} titleId={`${id}-heading`} /> : undefined}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const Icon = resolveIcon(item.icon);
          const title = textFor(t, `section.${id}.items.${item.id}.title`);
          const body = textFor(t, `section.${id}.items.${item.id}.body`);
          return (
            <Card key={item.id} className="h-full border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

export function FaqSectionTemplate({ section }: TemplateProps) {
  const { t, isRTL } = useLanguage();
  const id = section.id;
  const heading = textFor(t, `section.${id}.heading`);
  const items = sectionItems(section);

  return (
    <Section
      id={id}
      background="muted"
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby={`${id}-heading`}
      header={heading ? <SectionHeader title={heading} titleId={`${id}-heading`} /> : undefined}
    >
      <Accordion type="single" collapsible className="max-w-3xl mx-auto space-y-3">
        {items.map((item) => {
          const question = textFor(t, `section.${id}.items.${item.id}.question`);
          const answer = textFor(t, `section.${id}.items.${item.id}.answer`);
          return (
            <AccordionItem key={item.id} value={item.id} className="bg-card rounded-lg border px-4 sm:px-6">
              <AccordionTrigger className="text-left">{question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Section>
  );
}

export function TestimonialsSectionTemplate({ section }: TemplateProps) {
  const { t, isRTL } = useLanguage();
  const id = section.id;
  const heading = textFor(t, `section.${id}.heading`);
  const items = sectionItems(section);

  return (
    <Section
      id={id}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby={`${id}-heading`}
      header={heading ? <SectionHeader title={heading} titleId={`${id}-heading`} /> : undefined}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const quote = textFor(t, `section.${id}.items.${item.id}.quote`);
          const name = textFor(t, `section.${id}.items.${item.id}.name`);
          const role = textFor(t, `section.${id}.items.${item.id}.role`);
          return (
            <Card key={item.id} className="h-full border-0 shadow-md">
              <CardContent className="p-6">
                <p className="text-muted-foreground italic leading-relaxed mb-4">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <SectionImage
                    slot={`section.${id}.items.${item.id}.image`}
                    alt={name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{name}</p>
                    {role && <p className="text-muted-foreground text-xs">{role}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

export function GallerySectionTemplate({ section }: TemplateProps) {
  const { t, isRTL } = useLanguage();
  const id = section.id;
  const heading = textFor(t, `section.${id}.heading`);
  const items = sectionItems(section);

  return (
    <Section
      id={id}
      dir={isRTL ? "rtl" : "ltr"}
      aria-labelledby={`${id}-heading`}
      header={heading ? <SectionHeader title={heading} titleId={`${id}-heading`} /> : undefined}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <SectionImage
            key={item.id}
            slot={`section.${id}.items.${item.id}.image`}
            alt={heading}
            className="rounded-lg shadow w-full aspect-square object-cover"
          />
        ))}
      </div>
    </Section>
  );
}

export function CtaSectionTemplate({ section }: TemplateProps) {
  const { t, isRTL } = useLanguage();
  const id = section.id;
  const heading = textFor(t, `section.${id}.heading`);
  const subtitle = textFor(t, `section.${id}.subtitle`);
  const buttonLabel = textFor(t, `section.${id}.buttonLabel`);
  const ctaHref = typeof section.config?.ctaHref === "string" ? section.config.ctaHref : "";

  return (
    <Section id={id} background="primary" dir={isRTL ? "rtl" : "ltr"} aria-labelledby={`${id}-heading`}>
      <div className="text-center max-w-2xl mx-auto py-4">
        {heading && (
          <h2 id={`${id}-heading`} className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">
            {heading}
          </h2>
        )}
        {subtitle && <p className="text-primary-foreground/90 mb-6">{subtitle}</p>}
        {ctaHref && buttonLabel && (
          <AccessibleButton asChild variant="secondary">
            <a href={ctaHref}>{buttonLabel}</a>
          </AccessibleButton>
        )}
      </div>
    </Section>
  );
}
