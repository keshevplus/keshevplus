import React, { useState, useEffect, useCallback } from 'react';
import { Phone, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { AccessibleButton } from '@/components/ui/accessible-button';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

/**
 * MobileNavigation - Accessible, mobile-first navigation
 * 
 * Features:
 * - Collapsible mobile menu with proper focus management
 * - Skip to content link for keyboard users
 * - Minimum 44px touch targets
 * - ARIA labels and roles
 * - Reduced motion support
 * - RTL support
 */

interface NavItem {
  href: string;
  label: string;
}

const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems: NavItem[] = [
    { href: '#home', label: language === 'he' ? 'בית' : 'Home' },
    { href: '#about', label: t('nav.about') },
    { href: '#services', label: t('nav.services') },
    { href: '#adhd', label: language === 'he' ? 'הפרעות קשב' : 'ADHD' },
    { href: '#faq', label: t('nav.faq') },
    { href: '#contact', label: t('nav.contact') },
  ];

  // Handle scroll for sticky nav styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when menu is open
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
        // Account for fixed nav height
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

  const toggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  return (
    <>
      {/* Skip to content link - visible on focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-green-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        {language === 'he' ? 'דלג לתוכן הראשי' : 'Skip to main content'}
      </a>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        role="navigation"
        aria-label={language === 'he' ? 'ניווט ראשי' : 'Main navigation'}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md' 
            : 'bg-white/80 backdrop-blur-sm'
        )}
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Larger on desktop */}
            <button
              onClick={() => scrollToSection('#home')}
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 rounded-lg"
              aria-label={language === 'he' ? 'חזרה לדף הבית' : 'Go to homepage'}
            >
              <img 
                src={logo} 
                alt={language === 'he' ? 'קשב פלוס' : 'Keshev Plus'}
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
              />
            </button>

            {/* Desktop Navigation */}
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

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Phone */}
              <a 
                href="tel:055-27-399-27"
                className={cn(
                  "flex items-center gap-2 text-green-800 font-medium",
                  "bg-green-50 px-4 py-2 rounded-full",
                  "hover:bg-green-100 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2",
                  "min-h-[44px]"
                )}
                aria-label={language === 'he' ? 'התקשרו אלינו: 055-27-399-27' : 'Call us: 055-27-399-27'}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>055-27-399-27</span>
              </a>

              {/* Language Toggle */}
              <AccessibleButton
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                aria-label={language === 'he' ? 'Switch to English' : 'עבור לעברית'}
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span>{language === 'he' ? 'EN' : 'עב'}</span>
              </AccessibleButton>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Language Toggle - Mobile */}
              <AccessibleButton
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                aria-label={language === 'he' ? 'Switch to English' : 'עבור לעברית'}
              >
                <Globe className="w-5 h-5" aria-hidden="true" />
              </AccessibleButton>
              
              {/* Menu Toggle */}
              <AccessibleButton
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label={isOpen 
                  ? (language === 'he' ? 'סגור תפריט' : 'Close menu')
                  : (language === 'he' ? 'פתח תפריט' : 'Open menu')
                }
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />

              {/* Menu Panel */}
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
                        initial={{ opacity: 0, x: language === 'he' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => scrollToSection(item.href)}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg text-base font-medium",
                          "text-gray-700 hover:text-green-800 hover:bg-green-50",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700",
                          "min-h-[48px] flex items-center",
                          language === 'he' ? 'text-right' : 'text-left'
                        )}
                        role="menuitem"
                      >
                        {item.label}
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Phone CTA */}
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
