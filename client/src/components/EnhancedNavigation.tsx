import { useState, useEffect } from 'react';
import { Phone, Menu, X, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import logo from '@/assets/logo.png';

const EnhancedNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, t, isRTL, dir } = useLanguage();

  const navItems = [
    { href: '#home', label: t('nav.home') },
    { href: '#about', label: t('nav.about') },
    { href: '#services', label: t('nav.services') },
    { href: '#adhd', label: t('nav.adhd') },
    { href: '#questionnaires', label: t('nav.questionnaires') },
    { href: '#contact', label: t('nav.contact') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const id = href.substring(1);
      const element = document.getElementById(id);
      if (element) {
        const offset = 100; // Adjust for navbar height
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border py-6' 
          : 'bg-transparent py-6'
      }`}
      dir={dir}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection('#home')}
          >
            <img 
              src={logo} 
              alt={isRTL ? '\u05e7\u05e9\u05d1 \u05e4\u05dc\u05d5\u05e1' : 'Keshev Plus'}
              className="h-24 md:h-28 w-auto transition-all duration-300 object-contain"
            />
          </motion.div>

          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <motion.button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={`font-semibold transition-all duration-300 relative group text-sm whitespace-nowrap ${
                  isScrolled ? 'text-foreground/80 hover:text-primary' : 'text-foreground hover:text-primary drop-shadow-md'
                }`}
                whileHover={{ y: -2 }}
              >
                {item.label}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
            
            <Link href="/booking">
              <Button
                size="sm"
                className={`flex items-center gap-1.5 font-bold rounded-full whitespace-nowrap ${
                  isScrolled ? '' : 'shadow-md'
                }`}
                data-testid="button-nav-booking"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{isRTL ? 'קביעת תור' : 'Book'}</span>
              </Button>
            </Link>

            <LanguageSelector />
            <ThemeToggle />
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary"
              data-testid="button-mobile-menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: -90 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-2 bg-card rounded-lg border border-border shadow-lg overflow-hidden"
            >
            <div className="p-4 space-y-1 bg-background/95 backdrop-blur-md border-t border-border">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(item.href)}
                    className={`block w-full px-4 py-3 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/10 transition-all duration-300 font-medium ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {item.label}
                  </motion.button>
                ))}
                
                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <Link href="/booking" onClick={() => setIsOpen(false)}>
                    <Button className="w-full flex items-center justify-center gap-2" data-testid="button-mobile-booking">
                      <CalendarCheck className="w-5 h-5" />
                      <span>{isRTL ? 'קביעת תור' : 'Book Now'}</span>
                    </Button>
                  </Link>
                  <a 
                    href="tel:055-27-399-27"
                    className="flex items-center justify-center gap-2 text-primary font-semibold bg-primary/10 px-4 py-3 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>055-27-399-27</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default EnhancedNavigation;
