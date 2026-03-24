import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';
import { AccessibleButton } from '@/components/ui/accessible-button';
import { useContactModal } from '@/contexts/ContactModalContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const ContactSection: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { openModal } = useContactModal();
  const [directionsModalOpen, setDirectionsModalOpen] = useState(false);

  const clinicAddress = 'יגאל אלון 94, תל אביב';
  const wazeLink = `https://waze.com/ul?q=${encodeURIComponent(clinicAddress)}&navigate=yes`;
  const googleMapsLink = `https://maps.google.com/?q=${encodeURIComponent(clinicAddress)}`;

  return (
    <Section
      id="contact"
      background="muted"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="contact-heading"
      header={<SectionHeader title={t('nav.contact')} subtitle={t('contact.subtitle')} titleId="contact-heading" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

        {/* Contact form teaser — clicking any field opens the modal */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="order-1"
        >
          <Card
            className="border-0 shadow-lg cursor-pointer group"
            onClick={openModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openModal()}
            aria-label={isRTL ? 'לחצו לפתיחת טופס יצירת קשר' : 'Click to open contact form'}
            data-testid="card-contact-teaser"
          >
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground text-center pb-1">
                {isRTL ? 'לחצו לפתיחת הטופס' : 'Click to open the form'}
              </p>

              {/* Teaser fields — visual only, clicking opens modal */}
              {[
                t('contact.name_placeholder'),
                isRTL ? 'הזינו מספר טלפון' : 'Phone number',
                isRTL ? 'הזינו כתובת דוא"ל' : 'Email (optional)',
              ].map((placeholder) => (
                <div
                  key={placeholder}
                  className="h-12 rounded-md border border-input bg-white dark:bg-gray-800 flex items-center px-3 text-muted-foreground text-sm select-none group-hover:border-primary transition-colors"
                >
                  {placeholder}
                </div>
              ))}

              <div className="h-24 rounded-md border border-input bg-white dark:bg-gray-800 flex items-start px-3 pt-3 text-muted-foreground text-sm select-none group-hover:border-primary transition-colors">
                {t('contact.message_placeholder')}
              </div>

              <AccessibleButton
                variant="primary"
                className="w-full min-h-[48px] bg-[#25D366] hover:bg-[#20bd5a] border-0 text-white font-bold"
                onClick={(e) => { e.stopPropagation(); openModal(); }}
                data-testid="button-open-contact-modal"
              >
                {t('contact.send_message')}
              </AccessibleButton>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2 space-y-6"
        >
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary text-center dark:text-orange-400">{t('contact.details_title')}</h3>

            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <p className="font-bold text-xl text-foreground">{t('contact.address_label')}</p>
                <p className="text-primary font-bold text-lg leading-tight dark:text-orange-300">{t('contact.address_line1')}</p>
                <p className="text-primary font-bold text-lg leading-tight dark:text-orange-300">{t('contact.address_line2')}</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <p className="font-bold text-xl text-foreground">{t('contact.email_label')}</p>
                <a href="mailto:dr@keshevplus.co.il" className="text-[#25D366] font-bold text-lg hover:underline dark:text-green-400">dr@keshevplus.co.il</a>
              </div>

              <div className="flex flex-col items-center gap-1">
                <p className="font-bold text-xl text-foreground">{t('contact.phone_label')}</p>
                <a href="tel:055-27-399-27" className="text-foreground font-bold text-lg hover:underline dark:text-white">055-27-399-27</a>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <AccessibleButton
                variant="primary"
                className="w-full max-w-sm bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold h-12 text-lg rounded-lg"
                onClick={() => setDirectionsModalOpen(true)}
                data-testid="button-directions"
              >
                {t('contact.directions_title')}
              </AccessibleButton>

              <div className="flex flex-wrap justify-center gap-3 w-full">
                <a href={wazeLink} target="_blank" rel="noopener noreferrer" className="flex-1 max-w-[180px] flex items-center justify-center gap-2 px-4 py-2 bg-[#33CCFF] text-white rounded-lg font-bold hover:bg-opacity-90 transition-opacity min-h-[44px]">
                  נווט עם Waze
                </a>
                <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex-1 max-w-[180px] flex items-center justify-center gap-2 px-4 py-2 bg-[#4285F4] text-white rounded-lg font-bold hover:bg-opacity-90 transition-opacity min-h-[44px]">
                  נווט עם Google Maps
                </a>
              </div>
            </div>
          </div>

          <Dialog open={directionsModalOpen} onOpenChange={setDirectionsModalOpen}>
            <DialogContent className="max-w-sm w-[85vw] p-0 overflow-hidden rounded-2xl z-[9995]" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="bg-white dark:bg-gray-900 p-4 space-y-3 pt-8">
                <h2 className="text-lg font-bold text-[#1B4332] dark:text-green-300 text-center border-b pb-3">
                  דרכי הגעה ואפשרויות חניה
                </h2>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-[#1B4332] dark:text-green-300 flex items-center gap-1.5">
                      <MapPin className="w-5 h-5 shrink-0" /> אפשרויות חניה באזור:
                    </h3>
                    <div className="space-y-3.5 text-[#1B4332] dark:text-green-200">
                      <div>
                        <p className="font-bold text-sm">חניון אורחים מגדלי אלון - <span className="font-normal">כניסה דרך מגדל אלון 1 בצד הצפוני</span></p>
                        <p className="text-xs text-muted-foreground">חניות אורחים מסומנות באור ירוק ושלט מגדל "הראל"</p>
                        <a href="https://waze.com/ul?q=מגדלי+אלון+כניסה+צפונית" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-xs hover:underline">מגדלי אלון- כניסה צפונית Waze</a>
                      </div>
                      <div>
                        <p className="font-bold text-sm">חניון "אושר עד" - <span className="font-normal">ממש ברחוב המקביל אלינו</span></p>
                        <a href="https://waze.com/ul?q=חניון+אושר+עד+תל+אביב" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-xs hover:underline">Waze לחניון אושר עד</a>
                      </div>
                      <div>
                        <p className="font-bold text-sm">חניון אחוזת חוף - <span className="font-normal">ליד מגדל טויוטה (חניון הסינרמה, יגאל אלון 63)</span></p>
                        <p className="text-xs text-muted-foreground">כניסה מהצד הדרומי</p>
                        <a href="https://waze.com/ul?q=חניון+אחוזת+חוף+יגאל+אלון+63" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-xs hover:underline">Waze לחניון אחוזות חוף</a>
                      </div>
                      <div>
                        <p className="font-bold text-sm">כחול לבן באזור <span className="font-normal">(זמין בעיקר בבוקר ובערב)</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 shrink-0 text-[#1B4332] dark:text-green-300" />
                      <div className="font-bold text-[#1B4332] dark:text-green-300">
                        <p className="text-sm leading-tight">לבאי ברכבת</p>
                      </div>
                    </div>
                    <p className="text-[#1B4332] dark:text-green-200 text-sm font-medium">מרחק הליכה מתחנת השלום (עזריאלי)</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      <div className="mt-12 aspect-video w-full rounded-2xl overflow-hidden border shadow-inner">
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent('יגאל אלון 94, תל אביב')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Clinic Location Map"
        />
      </div>
    </Section>
  );
};

export default ContactSection;
