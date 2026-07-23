import React from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/hooks/useLanguage';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import logo from '@/assets/logo.png';
import { SiteImage } from '@/components/SiteImage';

const Footer: React.FC = () => {
  const { isRTL, t } = useLanguage();

  const navigationLinks = [
    { key: 'nav.about', href: '#about' },
    { key: 'nav.services', href: '#services' },
    { key: 'nav.adhd', href: '#adhd' },
    { key: 'nav.questionnaires', href: '#questionnaires' },
    { key: 'nav.contact', href: '#contact' },
  ];

  const contactInfo = {
    phone: '055-27-399-27',
    email: 'office@keshevplus.co.il',
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/keshevplus', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/keshevplus', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/keshevplus', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-800 text-white py-8 sm:py-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Column 1: logo, copyright and credits */}
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right gap-3">
            <SiteImage
              slot="logo"
              fallback={logo}
              alt="Keshev Plus"
              className="h-12 w-auto brightness-0 invert"
              loading="lazy"
              width="120"
              height="48"
              decoding="async"
            />
            <p className="text-lg font-semibold" data-testid="text-footer-rights">
              {t('footer.rights').replace('2025', new Date().getFullYear().toString())}
            </p>
            <p className="text-sm text-gray-300">נבנה על ידי aloncode</p>
          </div>

          {/* Column 2: quick links */}
          <div className="text-center sm:text-right">
            <h3 className="text-xl font-bold mb-3">{t('footer.quick_links')}</h3>
            <nav aria-label={t('footer.quick_links')}>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 justify-items-center sm:justify-items-end">
                {navigationLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    className="text-sm md:text-base text-white hover:text-secondary transition-colors py-1 min-h-[32px] inline-flex items-center"
                    data-testid={`link-footer-${link.key.split('.')[1]}`}
                  >
                    {t(link.key)}
                  </a>
                ))}
              </div>
            </nav>
          </div>

          {/* Column 3: contact info */}
          <div className="text-center sm:text-right">
            <h3 className="text-xl font-bold mb-3">{t('footer.contact_info')}</h3>
            <div className="flex flex-col items-center sm:items-end gap-2">
              <a
                href={`tel:${contactInfo.phone.replace(/-/g, '')}`}
                className="text-sm md:text-base text-white hover:text-secondary transition-colors"
                dir="ltr"
                data-testid="link-footer-phone"
              >
                {contactInfo.phone}
              </a>
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-sm md:text-base text-white hover:text-secondary transition-colors"
                data-testid="link-footer-email"
              >
                {contactInfo.email}
              </a>

              <div className="flex items-center gap-2 mt-1">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    data-testid={`link-social-${social.label.toLowerCase()}`}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
                <a
                  href={`https://wa.me/972552739927?text=${encodeURIComponent(t('contact.whatsapp_message'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar: legal links (accessibility statement is required by Israeli law) */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-center gap-6 text-xs sm:text-sm text-gray-400">
          <Link href="/accessibility" className="hover:text-white transition-colors" data-testid="link-footer-accessibility">
            {t('footer.accessibility_statement')}
          </Link>
          <Link href="/privacy-policy" className="hover:text-white transition-colors" data-testid="link-footer-privacy">
            {t('footer.privacy_policy')}
          </Link>
          <Link href="/terms-of-use" className="hover:text-white transition-colors" data-testid="link-footer-terms">
            {t('footer.terms_of_use')}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
