import { Leaf } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { AccessibleButton } from "@/components/ui/accessible-button";
import { useContactModal } from "@/contexts/ContactModalContext";
import { cn } from "@/lib/utils";

/**
 * Repeated leaf-icon CTA button pair shown at the end of each front-page
 * section, mirroring keshev-web's per-section "contact us" / "read more" row.
 *
 * `fullWidth` wraps the same buttons in a full-bleed green band instead of
 * leaving them centered on the section's own background -- opt-in per call
 * site so the other sections keep their current look.
 */
export function SectionCtaButtons({ className, fullWidth }: { className?: string; fullWidth?: boolean }) {
  const { t } = useLanguage();
  const { openModal } = useContactModal();

  const buttons = (
    <div className={cn("flex flex-wrap justify-center gap-4", !fullWidth && "mt-10 sm:mt-12", className)}>
      <AccessibleButton
        variant="primary"
        className="rounded-full gap-2 shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
        onClick={openModal}
        data-testid="button-section-contact-cta"
      >
        {t("hero.contact_us_now")}
        <Leaf className="h-4 w-4" aria-hidden="true" />
      </AccessibleButton>

      <AccessibleButton
        variant="secondary"
        className="rounded-full gap-2 shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
        onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
        data-testid="button-section-read-more"
      >
        {t("hero.read_about_us")}
        <Leaf className="h-4 w-4" aria-hidden="true" />
      </AccessibleButton>
    </div>
  );

  if (!fullWidth) return buttons;

  return (
    <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] green-section-bg py-8 sm:py-10 mt-10 sm:mt-12">
      {buttons}
    </div>
  );
}
