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

const ContactSection: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const isDemo = useIsDemo();
  const { toast } = useToast();
  
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
          className="order-2 lg:order-1"
        >
          <Card className="border-border shadow-lg">
            <CardContent className="pt-6">
              {isSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('contact.thank_you')}</h3>
                  <p className="text-muted-foreground">{t('contact.will_reply')}</p>
                  <AccessibleButton variant="outline" className="mt-6" onClick={() => setIsSubmitted(false)}>
                    {t('contact.send_another')}
                  </AccessibleButton>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="name">{t('contact.full_name')} *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={cn(errors.name && "border-destructive")}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone">{t('contact.phone_label')} *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={cn(errors.phone && "border-destructive")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email">{t('contact.email_optional')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  {isDemo && (
                    <div className="space-y-1">
                      <Label>{t('contact.topic_label')}</Label>
                      <Select onValueChange={handleSelectChange} value={formData.topic}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('contact.topic_label')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diagnosis">{t('contact.topic_option1')}</SelectItem>
                          <SelectItem value="moxo">{t('contact.topic_option2')}</SelectItem>
                          <SelectItem value="other">{t('contact.topic_option3')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="message">{t('contact.message')} *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className={cn("resize-none", errors.message && "border-destructive")}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <AccessibleButton type="submit" variant="primary" loading={isSubmitting} className="flex-1 min-h-[48px]">
                      <Send className="w-4 h-4 mr-2" />
                      {t('contact.send_message')}
                    </AccessibleButton>
                    {isDemo && (
                      <AccessibleButton type="button" variant="outline" onClick={handleClear} className="flex-1 min-h-[48px]">
                        <RotateCcw className="w-4 h-4 mr-2" />
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
            <h3 className="text-2xl font-bold text-primary">{t('contact.details_title')}</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-lg">{t('contact.address_label')}</p>
                  <p className="text-muted-foreground">{t('contact.address_line1')}</p>
                  <p className="text-muted-foreground">{t('contact.address_line2')}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-lg">{t('contact.email_label')}</p>
                  <a href="mailto:dr@keshevplus.co.il" className="text-primary hover:underline">dr@keshevplus.co.il</a>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-lg">{t('contact.phone_label')}</p>
                  <a href="tel:055-27-399-27" className="text-primary hover:underline">055-27-399-27</a>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <p className="font-bold text-lg">{t('contact.directions_title')}</p>
              <div className="flex flex-wrap gap-3">
                <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#4285F4] text-white rounded-lg hover:bg-opacity-90 transition-opacity">
                  <MapPin className="w-4 h-4" />
                  {t('contact.navigate_google')}
                </a>
                <a href={wazeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#33CCFF] text-white rounded-lg hover:bg-opacity-90 transition-opacity">
                  <Navigation className="w-4 h-4" />
                  {t('contact.navigate_waze')}
                </a>
              </div>
            </div>
          </div>
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
