import { useState, useEffect } from 'react';
import { Phone, Mail, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { AccessibleButton } from '@/components/ui/accessible-button';
import { contentApi } from '@/lib/content';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const getContactSchema = (requireMessage: boolean) => z.object({
  firstName: z.string().trim().min(2, { message: 'First name must be at least 2 characters' }).max(50),
  lastName: z.string().trim().min(2, { message: 'Last name must be at least 2 characters' }).max(50),
  phone: z.string().trim().min(9, { message: 'Please enter a valid phone number' }).max(20),
  email: z.string().trim().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  topic: z.string().optional(),
  message: requireMessage
    ? z.string().trim().min(10, { message: 'Message must be at least 10 characters' }).max(1000)
    : z.string().trim().max(1000),
});

type ContactFormData = z.infer<ReturnType<typeof getContactSchema>>;

const joinName = (firstName: string, lastName: string) => `${firstName.trim()} ${lastName.trim()}`.trim();

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ open, onOpenChange }) => {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const firstNameLabel = language === 'he' ? 'שם פרטי' : 'First name';
  const lastNameLabel = language === 'he' ? 'שם משפחה' : 'Last name';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requireMessage, setRequireMessage] = useState(true);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    topic: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  useEffect(() => {
    fetch('/api/settings/contact-form')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data.requireMessage === 'boolean') setRequireMessage(data.requireMessage);
      })
      .catch(() => {});
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = getContactSchema(requireMessage).safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await contentApi.submitContactForm({
        name: joinName(result.data.firstName, result.data.lastName),
        phone: result.data.phone,
        email: result.data.email,
        message: result.data.message,
      });
      if (response.success) {
        setIsSubmitted(true);
        toast({ title: t('contact.success_title'), description: t('contact.success_desc') });
        setFormData({ firstName: '', lastName: '', phone: '', email: '', topic: '', message: '' });
      } else {
        throw new Error(response.message);
      }
    } catch {
      toast({ title: t('contact.error_title'), description: t('contact.error_desc'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setIsSubmitted(false);
        setErrors({});
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t('nav.contact')}
          </DialogTitle>
          <DialogDescription>
            {t('contact.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">{t('contact.thank_you')}</h3>
            <p className="text-muted-foreground">{t('contact.will_reply')}</p>
            <AccessibleButton
              variant="outline"
              className="mt-4"
              onClick={() => handleClose(false)}
              data-testid="button-close-success"
            >
              {language === 'he' ? 'סגור' : 'Close'}
            </AccessibleButton>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="modal-first-name" className="text-sm font-medium text-foreground">
                  {firstNameLabel} *
                </Label>
                <Input
                  id="modal-first-name"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder={firstNameLabel}
                  className={cn("mt-1", errors.firstName && "border-destructive")}
                  data-testid="input-modal-first-name"
                />
                {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <Label htmlFor="modal-last-name" className="text-sm font-medium text-foreground">
                  {lastNameLabel} *
                </Label>
                <Input
                  id="modal-last-name"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder={lastNameLabel}
                  className={cn("mt-1", errors.lastName && "border-destructive")}
                  data-testid="input-modal-last-name"
                />
                {errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="modal-phone" className="text-sm font-medium text-foreground">
                {t('contact.phone_label')} *
              </Label>
              <Input
                id="modal-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={language === 'he' ? 'הזינו מספר טלפון' : 'Enter your phone number'}
                className={cn("mt-1", errors.phone && "border-destructive")}
                dir="ltr"
                data-testid="input-modal-phone"
              />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="modal-email" className="text-sm font-medium text-foreground">
                {t('contact.email_optional')}
              </Label>
              <Input
                id="modal-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={language === 'he' ? 'הזינו כתובת דוא"ל' : 'Enter your email'}
                className={cn("mt-1", errors.email && "border-destructive")}
                dir="ltr"
                data-testid="input-modal-email"
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">
                {t('contact.topic_label')}
              </Label>
              <Select onValueChange={handleSelectChange} value={formData.topic}>
                <SelectTrigger className="mt-1" data-testid="select-modal-topic">
                  <SelectValue placeholder={t('contact.topic_label')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagnosis">{t('contact.topic_option1')}</SelectItem>
                  <SelectItem value="moxo">{t('contact.topic_option2')}</SelectItem>
                  <SelectItem value="other">{t('contact.topic_option3')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modal-message" className="text-sm font-medium text-foreground">
                {t('contact.message')}{requireMessage ? ' *' : ''}
              </Label>
              <Textarea
                id="modal-message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={t('contact.message_placeholder')}
                rows={3}
                className={cn("mt-1 resize-none", errors.message && "border-destructive")}
                data-testid="input-modal-message"
              />
              {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <AccessibleButton
                type="submit"
                variant="primary"
                className="flex-1"
                loading={isSubmitting}
                data-testid="button-modal-submit"
              >
                <Send className="w-4 h-4" />
                {t('contact.send_message')}
              </AccessibleButton>

              <a
                href="tel:055-27-399-27"
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "bg-secondary text-secondary-foreground font-medium",
                  "rounded-md px-6 min-h-[44px]",
                  "hover:bg-secondary/90 transition-colors"
                )}
                data-testid="link-modal-call"
              >
                <Phone className="w-4 h-4" />
                055-27-399-27
              </a>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
