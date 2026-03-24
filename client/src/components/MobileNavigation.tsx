import { useState, useEffect, useCallback } from "react";
import { Phone, Menu, X, CalendarCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccessibleButton } from "@/components/ui/accessible-button";
import { Button } from "@/components/ui/button";
import BookingModal from "@/components/BookingModal";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useContactModal } from "@/contexts/ContactModalContext";

interface NavItem {
  href: string;
  label: string;
}

const MobileNavigation: React.FC = () => {
  const { openModal } = useContactModal();
  const [isOpen, setIsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const isScrolled = scrollProgress > 0.1;
  const { t, isRTL, dir } = useLanguage();

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop, { passive: true });
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const navItems: NavItem[] = [
    { href: "#home", label: t("nav.home") },
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
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
        {isRTL ? "דלג לתוכן הראשי" : "Skip to main content"}
      </a>

      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        role="navigation"
        aria-label={isRTL ? "ניווט ראשי" : "Main navigation"}
        style={{
          paddingTop: `${10 - scrollProgress * 6}px`,
          paddingBottom: `${10 - scrollProgress * 6}px`,
          transition: 'background-color 0.3s, box-shadow 0.3s',
        }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[9990]",
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-md"
            : "bg-background/80 backdrop-blur-sm",
        )}
        dir={dir}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2">

            {/* Logo — hidden at top, fades in on scroll */}
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
              aria-label={isRTL ? "חזרה לדף הבית" : "Go to homepage"}
              aria-hidden={logoHeight === 0}
              tabIndex={logoHeight === 0 ? -1 : 0}
            >
              <img
                src={logo}
                alt={isRTL ? "קשב פלוס" : "Keshev Plus"}
                className="h-14 w-auto"
              />
            </button>

            {/* Desktop nav links — centered */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = activeSection === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      "min-h-[40px] flex items-center",
                      isActive
                        ? "text-primary"
                        : "text-foreground/70 hover:text-primary hover:bg-primary/10",
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desktop right/left utility area */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                className="flex items-center gap-1.5 font-bold rounded-full"
                data-testid="button-nav-booking"
                onClick={() => setBookingOpen(true)}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{isRTL ? "קביעת תור" : "Book Now"}</span>
              </Button>

              <a
                href="tel:055-27-399-27"
                className={cn(
                  "flex items-center gap-1.5 text-primary font-semibold whitespace-nowrap",
                  "bg-primary/10 px-3 py-2 rounded-full text-sm",
                  "hover:bg-primary/20 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "min-h-[40px]",
                )}
                aria-label={
                  isRTL
                    ? "התקשרו אלינו: 055-27-399-27"
                    : "Call us: 055-27-399-27"
                }
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>055-27-399-27</span>
              </a>

              <LanguageSelector />
              <ThemeToggle />
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
                aria-label={
                  isOpen
                    ? isRTL
                      ? "סגור תפריט"
                      : "Close menu"
                    : isRTL
                      ? "פתח תפריט"
                      : "Open menu"
                }
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

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm lg:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />

              <motion.div
                id="mobile-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-card border-t border-border shadow-lg lg:hidden"
                role="menu"
              >
                <div className="container mx-auto px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {navItems.map((item, index) => {
                      const isActive = activeSection === item.href;
                      return (
                        <motion.button
                          key={item.href}
                          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => scrollToSection(item.href)}
                          className={cn(
                            "w-full px-4 py-3 rounded-md text-base font-medium",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            "min-h-[48px] flex items-center",
                            isRTL ? "text-right" : "text-left",
                            isActive
                              ? "text-primary bg-primary/10 font-semibold"
                              : "text-foreground/70 hover:text-primary hover:bg-primary/10",
                          )}
                          role="menuitem"
                        >
                          {item.label}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    <Button
                      className="w-full flex items-center justify-center gap-2"
                      data-testid="button-mobile-booking"
                      onClick={() => { setIsOpen(false); setBookingOpen(true); }}
                    >
                      <CalendarCheck className="w-5 h-5" />
                      <span>{isRTL ? "קביעת תור" : "Book Now"}</span>
                    </Button>
                    <a
                      href="tel:055-27-399-27"
                      className={cn(
                        "flex items-center justify-center gap-2",
                        "w-full py-3 rounded-md",
                        "bg-primary/10 text-primary font-medium",
                        "hover:bg-primary/20 transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "min-h-[48px]",
                      )}
                    >
                      <Phone className="w-5 h-5" aria-hidden="true" />
                      <span>055-27-399-27</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </>
  );
};

export default MobileNavigation;
