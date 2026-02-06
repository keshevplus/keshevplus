import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import logo from '@/assets/logo.png';

const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const isRTL = language === 'he';

  const navigationLinks = [
    { key: 'nav.about', href: '#about' },
    { key: 'nav.services', href: '#services' },
    { key: 'nav.adhd', href: '#adhd' },
    { key: 'nav.faq', href: '#faq' },
    { key: 'nav.contact', href: '#contact' },
  ];

  const contactInfo = {
    phone: '055-27-399-27',
    email: 'dr@keshevplus.co.il',
    address: isRTL ? 'יגאל אלון 94, תל אביב' : '94 Yigal Alon St., Tel Aviv',
    hours: isRTL ? 'א\'-ה\' 09:00-19:00' : 'Sun-Thu 09:00-19:00',
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/keshevplus', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/keshevplus', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/keshevplus', label: 'LinkedIn' },
  ];

  return (
    <footer 
      className="bg-green-900 text-white"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo & About */}
          <div className="space-y-4">
            <img 
              src={logo} 
              alt="Keshev Plus Logo" 
              className="h-16 w-auto brightness-0 invert"
            />
            <p className="text-green-100 text-sm leading-relaxed">
              {isRTL 
                ? 'מרפאה מובילה לאבחון וטיפול בהפרעות קשב וריכוז בילדים, בני נוער ומבוגרים.'
                : 'Leading clinic for ADHD diagnosis and treatment in children, teens, and adults.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {isRTL ? 'ניווט מהיר' : 'Quick Links'}
            </h3>
            <nav>
              <ul className="space-y-2">
                {navigationLinks.map((link) => (
                  <li key={link.key}>
                    <a 
                      href={link.href}
                      className="text-green-100 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {t(link.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {isRTL ? 'פרטי התקשרות' : 'Contact Info'}
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href={`tel:${contactInfo.phone.replace(/-/g, '')}`}
                  className="flex items-center gap-3 text-green-100 hover:text-white transition-colors text-sm"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span dir="ltr">{contactInfo.phone}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-3 text-green-100 hover:text-white transition-colors text-sm"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{contactInfo.email}</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-green-100 text-sm">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-3 text-green-100 text-sm">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{contactInfo.hours}</span>
              </li>
            </ul>
          </div>

          {/* Social & CTA */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {isRTL ? 'עקבו אחרינו' : 'Follow Us'}
            </h3>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-green-800 hover:bg-green-700 flex items-center justify-center transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <a
              href={`https://wa.me/972552739927?text=${encodeURIComponent(
                isRTL ? 'שלום, אשמח לקבל פרטים נוספים על אבחון ADHD' : 'Hello, I would like more information about ADHD diagnosis'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>{isRTL ? 'WhatsApp' : 'WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>

      <Separator className="bg-green-800" />

      {/* Bottom Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-green-200">
          <p>{t('footer.rights')}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">
              {isRTL ? 'מדיניות פרטיות' : 'Privacy Policy'}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {isRTL ? 'תנאי שימוש' : 'Terms of Use'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
