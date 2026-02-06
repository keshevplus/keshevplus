import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Car, Navigation, Train } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Section, SectionHeader } from '@/components/layout/Section';
import { AccessibleButton } from '@/components/ui/accessible-button';
import { contentApi, useContent, type ContactInfo } from '@/lib/content';
import { cn } from '@/lib/utils';
import { z } from 'zod';

/**
 * ContactSection - Accessible, mobile-first contact form
 * 
 * UX Improvements:
 * - Single-column form on mobile
 * - Large input fields with proper labels
 * - Clear validation messages
 * - Touch-friendly buttons (min 44px)
 * - Progressive disclosure
 * - Data-driven contact info from API
 */

// Validation schema
const contactSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100),
  phone: z.string().trim().min(9, { message: 'Please enter a valid phone number' }).max(20),
  email: z.string().trim().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  message: z.string().trim().min(10, { message: 'Message must be at least 10 characters' }).max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Arrival & Parking Modal Component
const ArrivalParkingModal: React.FC<{ isRTL: boolean }> = ({ isRTL }) => {
  const [open, setOpen] = useState(false);
  
  const clinicAddress = 'יגאל אלון 94, תל אביב';
  const wazeLink = `https://waze.com/ul?q=${encodeURIComponent(clinicAddress)}&navigate=yes`;
  const googleMapsLink = `https://maps.google.com/?q=${encodeURIComponent(clinicAddress)}`;
  
  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center justify-center gap-3 w-full",
          "py-4 px-6 rounded-xl",
          "bg-primary text-primary-foreground font-semibold text-lg",
          "hover:bg-primary/90 transition-colors",
          "shadow-md hover:shadow-lg",
          "min-h-[56px]"
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <Car className="w-5 h-5" aria-hidden="true" />
        <span>{isRTL ? 'דרכי הגעה ואפשרויות חניה' : 'Directions & Parking'}</span>
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="max-w-md sm:max-w-lg"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <DialogHeader>
            <DialogTitle className="text-xl text-primary flex items-center gap-2">
              <Car className="w-5 h-5" />
              {isRTL ? 'דרכי הגעה ואפשרויות חניה' : 'Directions & Parking'}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'מידע על הגעה למרפאה וחניה באזור'
                : 'Information about arriving at the clinic and parking nearby'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {isRTL ? 'כתובת המרפאה' : 'Clinic Address'}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {isRTL ? 'יגאל אלון 94, תל אביב' : '94 Yigal Alon St., Tel Aviv'}
                  <br />
                  <span className="text-xs">
                    {isRTL ? 'מגדלי אלון 1, קומה 12, משרד 1202' : 'Alon Towers 1, Floor 12, Office 1202'}
                  </span>
                </p>
              </div>
            </div>

            {/* Parking Info */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {isRTL ? 'חניה' : 'Parking'}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {isRTL 
                    ? 'ישנה חניה חינמית ברחוב ובסביבה. מומלץ להגיע מספר דקות לפני הפגישה לצורך מציאת חניה.'
                    : 'Free street parking is available in the area. We recommend arriving a few minutes early to find parking.'}
                </p>
              </div>
            </div>

            {/* Public Transport */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Train className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {isRTL ? 'תחבורה ציבורית' : 'Public Transport'}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {isRTL 
                    ? 'המרפאה נמצאת במרחק הליכה קצר מתחנת הרכבת באר שבע מרכז. קווי אוטובוס רבים עוברים בסמוך.'
                    : 'The clinic is a short walk from Beer Sheva Central train station. Multiple bus lines pass nearby.'}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={wazeLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-lg",
                  "bg-[#33CCFF] text-white font-medium",
                  "hover:bg-[#2bb8e8] transition-colors",
                  "min-h-[48px]"
                )}
              >
                <Navigation className="w-4 h-4" />
                Waze
              </a>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-lg",
                  "bg-[#4285F4] text-white font-medium",
                  "hover:bg-[#3574d4] transition-colors",
                  "min-h-[48px]"
                )}
              >
                <MapPin className="w-4 h-4" />
                Google Maps
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Icon mapping
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  phone: Phone,
  email: Mail,
  address: MapPin,
  hours: Clock,
};

const ContactSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === 'he';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  // Fetch contact info from API
  const { data: contactInfo } = useContent(
    () => contentApi.getContactInfo(),
    []
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
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
      const validData = {
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email,
        message: result.data.message,
      };
      const response = await contentApi.submitContactForm(validData);
      
      if (response.success) {
        setIsSubmitted(true);
        toast({
          title: isRTL ? 'הודעה נשלחה בהצלחה!' : 'Message sent successfully!',
          description: isRTL ? 'נחזור אליכם בהקדם' : "We'll get back to you soon",
        });
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: isRTL ? 'שגיאה בשליחה' : 'Error sending message',
        description: isRTL ? 'אנא נסו שוב' : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section 
      id="contact" 
      background="muted"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-labelledby="contact-heading"
    >
      <SectionHeader 
        title={isRTL ? 'צור קשר' : 'Contact Us'} 
        subtitle={isRTL 
          ? 'השאירו פרטים ונחזור אליכם בהקדם האפשרי'
          : "Leave your details and we'll get back to you as soon as possible"
        }
        titleId="contact-heading"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">
              {isRTL ? 'דרכי התקשרות' : 'Get in Touch'}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {isRTL 
                ? 'ניתן לפנות אלינו בטלפון, במייל או להשאיר פרטים בטופס ונחזור אליכם בהקדם.'
                : 'You can reach us by phone, email, or leave your details in the form and we\'ll contact you soon.'}
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactInfo?.map((info, index) => {
              const IconComponent = iconMap[info.type] || Phone;
              
              return (
                <motion.div
                  key={info.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-border/50 hover:shadow-md transition-shadow bg-background">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <IconComponent className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            {info.label[language]}
                          </h4>
                          {info.type === 'phone' ? (
                            <a 
                              href={`tel:${info.value.replace(/-/g, '')}`}
                              className="font-semibold text-primary hover:text-primary/80 transition-colors block"
                              dir="ltr"
                            >
                              {info.value}
                            </a>
                          ) : info.type === 'email' ? (
                            <a 
                              href={`mailto:${info.value}`}
                              className="font-semibold text-primary hover:text-primary/80 transition-colors block break-all"
                              dir="ltr"
                            >
                              {info.value}
                            </a>
                          ) : info.type === 'address' ? (
                            <a 
                              href={`https://maps.google.com/?q=${encodeURIComponent(info.value)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-foreground hover:text-primary transition-colors block"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="font-semibold text-foreground">
                              {info.value}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Direct Call CTA - Prominent on mobile */}
          <motion.a
            href="tel:0552739927"
            className={cn(
              "flex items-center justify-center gap-3 w-full",
              "py-4 px-6 rounded-xl",
              "bg-primary text-primary-foreground font-semibold text-lg",
              "hover:bg-primary/90 transition-colors",
              "shadow-md hover:shadow-lg",
              "min-h-[56px]",
              "lg:hidden" // Only show prominently on mobile
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Phone className="w-5 h-5" aria-hidden="true" />
            <span>{isRTL ? 'התקשרו עכשיו' : 'Call Now'}</span>
          </motion.a>

          {/* WhatsApp CTA */}
          <motion.a
            href={`https://wa.me/972552739927?text=${encodeURIComponent(isRTL ? 'שלום, אשמח לקבל מידע על אבחון ADHD' : 'Hello, I would like information about ADHD diagnosis')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-center gap-3 w-full",
              "py-4 px-6 rounded-xl",
              "bg-[#25D366] text-white font-semibold text-lg",
              "hover:bg-[#20bd5a] transition-colors",
              "shadow-md hover:shadow-lg",
              "min-h-[56px]"
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>{isRTL ? 'שלחו הודעה בוואטסאפ' : 'Message on WhatsApp'}</span>
          </motion.a>

          {/* Arrival & Parking Button */}
          <ArrivalParkingModal isRTL={isRTL} />
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="border-gray-100 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-primary">
                {isRTL ? 'השאירו פרטים' : 'Leave Your Details'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {isRTL ? 'תודה שפניתם אלינו!' : 'Thank you for contacting us!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isRTL ? 'נחזור אליכם בהקדם האפשרי' : "We'll get back to you as soon as possible"}
                  </p>
                  <AccessibleButton
                    variant="outline"
                    className="mt-6"
                    onClick={() => setIsSubmitted(false)}
                  >
                    {isRTL ? 'שליחת הודעה נוספת' : 'Send another message'}
                  </AccessibleButton>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">
                      {isRTL ? 'שם מלא' : 'Full Name'} *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={isRTL ? 'הכניסו את שמכם המלא' : 'Enter your full name'}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={cn(
                        "h-12 text-base",
                        errors.name && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-sm text-red-600" role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-medium">
                      {isRTL ? 'טלפון' : 'Phone'} *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={isRTL ? '050-000-0000' : '050-000-0000'}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      className={cn(
                        "h-12 text-base",
                        errors.phone && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-sm text-red-600" role="alert">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email Field - Optional */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      {isRTL ? 'דוא"ל (אופציונלי)' : 'Email (optional)'}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={isRTL ? 'your@email.com' : 'your@email.com'}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={cn(
                        "h-12 text-base",
                        errors.email && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-600" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-base font-medium">
                      {isRTL ? 'הודעה' : 'Message'} *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={isRTL ? 'ספרו לנו במה נוכל לעזור...' : 'Tell us how we can help...'}
                      rows={4}
                      required
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                      className={cn(
                        "text-base resize-none",
                        errors.message && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.message && (
                      <p id="message-error" className="text-sm text-red-600" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <AccessibleButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    loadingText={isRTL ? 'שולח...' : 'Sending...'}
                    className="mt-6"
                  >
                    <Send className="w-5 h-5" aria-hidden="true" />
                    {isRTL ? 'שליחת הודעה' : 'Send Message'}
                  </AccessibleButton>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {isRTL 
                      ? 'המידע שלכם מאובטח ולא ישותף עם צדדים שלישיים'
                      : 'Your information is secure and will not be shared with third parties'}
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Section>
  );
};

export default ContactSection;
