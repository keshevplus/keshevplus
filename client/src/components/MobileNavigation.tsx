import { useState, useEffect, useCallback } from "react";
import { Phone, Menu, X, CalendarCheck, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { AccessibleButton } from "@/components/ui/accessible-button";
import BookingModal from "@/components/BookingModal";
import logo from "@/assets/logo.png";
import { SiteImage } from "@/components/SiteImage";
import { cn } from "@/lib/utils";
import { useContactModal } from "@/contexts/ContactModalContext";

interface NavItem {
  href: string;
  label: string;
}

const MobileNavigation: React.FC = () => {
  const { openModal } = useContactModal();
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const isScrolled = scrollProgress > 0.1;
  const { t, isRTL, dir } = useLanguage();

  const navItems: NavItem[] = [
    { href: "#about", label: t("nav.about") },
    { href: "#services", label: t("nav.services") },
    { href: "#adhd", label: t("nav.adhd") },
    { href: "#questionnaires", label: t("nav.questionnaires") },
    { href: "#contact", label: t("nav.contact") },
  ];

  useEffect(() => {
    const sectionIds = ['home', 'about', 'services', 'adhd', 'questionnaires', 'contact'];

    const handleScroll = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / 150));
      setScrollProgress(progress);

      const scrollY = window.scrollY + 120;
      let current = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          current = `#${id}`;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isOpen) setIsOpen(false);
        if (moreOpen) setMoreOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, moreOpen]);

  useEffect(() => {
    if (isOpen || moreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, moreOpen]);

  const scrollToSection = useCallback(
    (href: string) => {
      if (href === "#contact") {
        openModal();
        setIsOpen(false);
        return;
      }
      if (href === "#home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.querySelector(href);
        if (element) {
          const navHeight = 80;
          const elementPosition =
            element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - navHeight,
            behavior: "smooth",
          });
        }
      }
      setIsOpen(false);
    },
    [openModal],
  );

  const logoOpacity = Math.min(1, scrollProgress * 3);
  const logoHeight = scrollProgress > 0.05 ? 40 : 0;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md"
      >
        {t("nav.skip_to_content")}
      </a>

      {/* Sticky white nav bar with pill-style links, mirroring keshev-web's Navbar */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        role="navigation"
        aria-label={t("nav.main_navigation")}
        className={cn(
          "fixed top-0 left-0 right-0 z-[9990] transition-shadow duration-300",
          isScrolled
            ? "shadow-md bg-white/95 backdrop-blur-lg dark:bg-background/95"
            : "bg-white/70 backdrop-blur-sm dark:bg-background/70",
        )}
        dir={dir}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2 py-3">

            {/* Logo — fades in once the page is scrolled, like keshev-web's homepage logo */}
            <button
              onClick={() => scrollToSection("#home")}
              className={cn(
                "flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md overflow-hidden",
                "transition-all duration-300",
                logoHeight > 0 ? "visible" : "invisible",
              )}
              style={{
                opacity: logoOpacity,
                pointerEvents: logoHeight > 0 ? 'auto' : 'none',
              }}
              aria-label={t("nav.go_home")}
              aria-hidden={logoHeight === 0}
              tabIndex={logoHeight === 0 ? -1 : 0}
            >
              <SiteImage
                slot="logo"
                fallback={logo}
                alt={isRTL ? "קשב פלוס" : "Keshev Plus"}
                className="h-10 sm:h-12 w-auto"
              />
            </button>

            {/* Desktop nav — solid pill links (green background when active) */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => {
                const active = activeSection === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      "min-h-[40px] flex items-center",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-primary hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop right-side controls */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <Button
                size="sm"
                className="flex items-center gap-1.5 font-bold rounded-full"
                data-testid="button-nav-booking"
                onClick={() => setBookingOpen(true)}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{t("nav.book_now")}</span>
              </Button>

              <a
                href="tel:055-27-399-27"
                className={cn(
                  "flex items-center gap-1.5 text-primary font-bold whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md",
                )}
                aria-label={t("nav.call_us")}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span dir="ltr">055-27-399-27</span>
              </a>

              <AccessibleButton
                variant="ghost"
                size="icon"
                onClick={() => setMoreOpen(true)}
                aria-expanded={moreOpen}
                aria-controls="more-options-panel"
                aria-label={t("nav.more_options")}
                data-testid="button-more-options"
              >
                <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
              </AccessibleButton>
            </div>

            {/* Mobile right area */}
            <div className="lg:hidden flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />

              <AccessibleButton
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label={isOpen ? t("nav.close_menu") : t("nav.open_menu")}
                data-testid="button-mobile-menu"
              >
                {isOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </AccessibleButton>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Desktop "more" drawer - holds language + theme controls so the main row never wraps */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="hidden lg:block fixed inset-0 z-[9995]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMoreOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="more-options-panel"
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.more_options")}
              dir={dir}
              initial={{ x: isRTL ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "absolute top-0 h-full w-72 bg-background shadow-xl p-6 flex flex-col gap-6",
                isRTL ? "left-0" : "right-0",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{t("nav.more_options")}</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                  aria-label={t("nav.close_menu")}
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-col gap-3 items-start">
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen green overlay menu (mobile), mirroring keshev-web's mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-[9995]"
            role="menu"
            dir={dir}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm -z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            <div className="flex flex-col h-full">
              <div className="bg-primary py-4 px-6 flex justify-between items-center">
                <span className="text-primary-foreground text-2xl font-bold">
                  {t("nav.menu")}
                </span>
                <button
                  className="text-primary-foreground p-2"
                  onClick={() => setIsOpen(false)}
                  aria-label={t("nav.close_menu")}
                >
                  <X size={28} />
                </button>
              </div>

              <div className="flex-grow bg-primary/95 overflow-y-auto px-6 py-4">
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const active = activeSection === item.href;
                    return (
                      <button
                        key={item.href}
                        onClick={() => scrollToSection(item.href)}
                        className={cn(
                          "text-xl font-semibold py-3 px-4 rounded-lg transition-colors duration-200",
                          isRTL ? "text-right" : "text-left",
                          "min-h-[48px] flex items-center",
                          active
                            ? "bg-white/25 text-primary-foreground"
                            : "text-primary-foreground/90 hover:bg-white/10",
                        )}
                        role="menuitem"
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-primary-foreground/20 space-y-3">
                  <Button
                    className="w-full flex items-center justify-center gap-2 rounded-full"
                    variant="secondary"
                    data-testid="button-mobile-booking"
                    onClick={() => { setIsOpen(false); setBookingOpen(true); }}
                  >
                    <CalendarCheck className="w-5 h-5" />
                    <span>{t("nav.book_now")}</span>
                  </Button>
                  <div className="flex items-center justify-center gap-4">
                    <LanguageSelector />
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              {/* Darker green footer bar with phone, matching keshev-web's mobile menu */}
              <div
                className="py-4 px-6 text-center"
                style={{ background: "hsl(var(--keshev-green-dark))" }}
              >
                <a
                  href="tel:055-27-399-27"
                  className="text-primary-foreground text-lg font-semibold"
                >
                  {t("nav.call_us")}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </>
  );
};

export default MobileNavigation;
