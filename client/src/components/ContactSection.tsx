import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, CheckCircle, Navigation, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, useIsDemo } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';
import { AccessibleButton } from '@/components/ui/accessible-button';
import { contentApi } from '@/lib/content';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100),
  phone: z.string().trim().min(9, { message: 'Please enter a valid phone number' }).max(20),
  email: z.string().trim().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  topic: z.string().optional(),
  message: z.string().trim().min(10, { message: 'Message must be at least 10 characters' }).max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

import { Dialog, DialogContent } from '@/components/ui/dialog';

const ContactSection: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const isDemo = useIsDemo();
  const { toast } = useToast();
  
  const [directionsModalOpen, setDirectionsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    topic: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, topic: value }));
  };

  const handleClear = () => {
    setFormData({ name: '', phone: '', email: '', topic: '', message: '' });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await contentApi.submitContactForm(result.data);
      if (response.success) {
        setIsSubmitted(true);
        toast({ title: t('contact.success_title'), description: t('contact.success_desc') });
        handleClear();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({ title: t('contact.error_title'), description: t('contact.error_desc'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clinicAddress = 'יגאל אלון 94, תל אביב';
  const wazeLink = `https://waze.com/ul?q=${encodeURIComponent(clinicAddress)}&navigate=yes`;
  const googleMapsLink = `https://maps.google.com/?q=${encodeURIComponent(clinicAddress)}`;

  return (
    <Section 
      id="contact" 
      background="muted"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="contact-heading"
    >
      <SectionHeader 
        title={isDemo ? t('contact.title') : t('nav.contact')} 
        subtitle={t('contact.subtitle')}
        titleId="contact-heading"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="order-1"
        >
          <Card className={cn("border-0 shadow-lg", isDemo && "bg-[#FFB37B] dark:bg-orange-900/40 dark:border dark:border-orange-500/30")}>
            <CardContent className="pt-6">
              {isSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{t('contact.thank_you')}</h3>
                  <p className="text-muted-foreground">{t('contact.will_reply')}</p>
                  <AccessibleButton variant="outline" className="mt-6" onClick={() => setIsSubmitted(false)}>
                    {t('contact.send_another')}
                  </AccessibleButton>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t('contact.name_placeholder')}
                        className={cn("bg-white dark:bg-gray-800 dark:text-white h-12 text-lg text-right", errors.name && "border-destructive")}
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('contact.email_placeholder')}
                        className="bg-white dark:bg-gray-800 dark:text-white h-12 text-lg text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t('contact.phone_placeholder')}
                        className={cn("bg-white dark:bg-gray-800 dark:text-white h-12 text-lg text-right", errors.phone && "border-destructive")}
                      />
                    </div>

                    <div className="space-y-1">
                      <Select onValueChange={handleSelectChange} value={formData.topic}>
                        <SelectTrigger className="bg-[#E9ECEF] dark:bg-gray-700 h-12 text-lg text-right border-0 dark:text-white">
                          <SelectValue placeholder={t('contact.topic_label')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diagnosis">{t('contact.topic_option1')}</SelectItem>
                          <SelectItem value="moxo">{t('contact.topic_option2')}</SelectItem>
                          <SelectItem value="other">{t('contact.topic_option3')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder={t('contact.message_placeholder')}
                        rows={4}
                        className={cn("bg-white dark:bg-gray-800 dark:text-white text-lg text-right resize-none", errors.message && "border-destructive")}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <AccessibleButton type="submit" variant="primary" loading={isSubmitting} className="flex-1 min-h-[48px] bg-[#25D366] hover:bg-[#20bd5a] border-0 text-white font-bold">
                      {t('contact.send_message')}
                    </AccessibleButton>
                    {isDemo && (
                      <AccessibleButton type="button" variant="outline" onClick={handleClear} className="flex-1 min-h-[48px] bg-[#E0E0E0] dark:bg-gray-600 hover:bg-[#D0D0D0] dark:hover:bg-gray-500 border-0 text-foreground dark:text-white font-bold">
                        {t('contact.clear_form')}
                      </AccessibleButton>
                    )}
                  </div>
                </form>
              )}
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
