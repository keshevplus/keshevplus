import { useState, useEffect, useCallback } from 'react';
import { Phone, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AccessibleButton } from '@/components/ui/accessible-button';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
}

const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, isRTL, dir } = useLanguage();

  const navItems: NavItem[] = [
    { href: '#home', label: t('nav.home') },
    { href: '#about', label: t('nav.about') },
    { href: '#services', label: t('nav.services') },
    { href: '#adhd', label: t('nav.adhd') },
    { href: '#faq', label: t('nav.faq') },
    { href: '#contact', label: t('nav.contact') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const scrollToSection = useCallback((href: string) => {
    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(href);
      if (element) {
        const navHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ 
          top: elementPosition - navHeight, 
          behavior: 'smooth' 
        });
      }
    }
    setIsOpen(false);
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-green-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        {isRTL ? '\u05d3\u05dc\u05d2 \u05dc\u05ea\u05d5\u05db\u05df \u05d4\u05e8\u05d0\u05e9\u05d9' : 'Skip to main content'}
      </a>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        role="navigation"
        aria-label={isRTL ? '\u05e0\u05d9\u05d5\u05d5\u05d8 \u05e8\u05d0\u05e9\u05d9' : 'Main navigation'}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md' 
            : 'bg-white/80 backdrop-blur-sm'
        )}
        dir={dir}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
              onClick={() => scrollToSection('#home')}
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded-lg"
              aria-label={isRTL ? '\u05d7\u05d6\u05e8\u05d4 \u05dc\u05d3\u05e3 \u05d4\u05d1\u05d9\u05ea' : 'Go to homepage'}
            >
              <img 
                src={logo} 
                alt={isRTL ? '\u05e7\u05e9\u05d1 \u05e4\u05dc\u05d5\u05e1' : 'Keshev Plus'}
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
              />
            </button>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    "text-gray-700 hover:text-green-800 hover:bg-green-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2",
                    "min-h-[44px] flex items-center"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <a 
                href="tel:055-27-399-27"
                className={cn(
                  "flex items-center gap-2 text-green-800 font-medium",
                  "bg-green-50 px-4 py-2 rounded-full",
                  "hover:bg-green-100 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2",
                  "min-h-[44px]"
                )}
                aria-label={isRTL ? '\u05d4\u05ea\u05e7\u05e9\u05e8\u05d5 \u05d0\u05dc\u05d9\u05e0\u05d5: 055-27-399-27' : 'Call us: 055-27-399-27'}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>055-27-399-27</span>
              </a>

              <LanguageSelector />
            </div>

            <div className="lg:hidden flex items-center gap-2">
              <LanguageSelector />
              
              <AccessibleButton
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label={isOpen 
                  ? (isRTL ? '\u05e1\u05d2\u05d5\u05e8 \u05ea\u05e4\u05e8\u05d9\u05d8' : 'Close menu')
                  : (isRTL ? '\u05e4\u05ea\u05d7 \u05ea\u05e4\u05e8\u05d9\u05d8' : 'Open menu')
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
                className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />

              <motion.div
                id="mobile-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg lg:hidden"
                role="menu"
              >
                <div className="container mx-auto px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {navItems.map((item, index) => (
                      <motion.button
                        key={item.href}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => scrollToSection(item.href)}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg text-base font-medium",
                          "text-gray-700 hover:text-green-800 hover:bg-green-50",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700",
                          "min-h-[48px] flex items-center",
                          isRTL ? 'text-right' : 'text-left'
                        )}
                        role="menuitem"
                      >
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a 
                      href="tel:055-27-399-27"
                      className={cn(
                        "flex items-center justify-center gap-2",
                        "w-full py-3 rounded-lg",
                        "bg-green-700 text-white font-medium",
                        "hover:bg-green-800 transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2",
                        "min-h-[48px]"
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
    </>
  );
};

export default MobileNavigation;
