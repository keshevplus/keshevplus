import { useState, useEffect } from 'react';
import { Phone, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
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
    { href: '#process', label: t('nav.process') },
    { href: '#faq', label: t('nav.faq') },
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
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
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
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}
      dir={dir}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection('#home')}
          >
            <img 
              src={logo} 
              alt={isRTL ? '\u05e7\u05e9\u05d1 \u05e4\u05dc\u05d5\u05e1' : 'Keshev Plus'}
              className="h-12 md:h-14 w-auto"
            />
          </motion.div>

          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <motion.button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-green-800 font-medium transition-all duration-300 relative group text-sm"
                whileHover={{ y: -2 }}
              >
                {item.label}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-800 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
            
            <a 
              href="tel:055-27-399-27"
              className="flex items-center gap-2 text-green-800 font-semibold bg-green-50 px-4 py-2 rounded-full hover:bg-green-100 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>055-27-399-27</span>
            </a>

            <LanguageSelector />
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <LanguageSelector />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-green-800"
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
              className="lg:hidden mt-4 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(item.href)}
                    className={`block w-full px-4 py-3 rounded-lg text-gray-700 hover:text-green-800 hover:bg-green-50 transition-all duration-300 font-medium ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {item.label}
                  </motion.button>
                ))}
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <a 
                    href="tel:055-27-399-27"
                    className="flex items-center justify-center gap-2 text-green-800 font-semibold bg-green-50 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors"
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
