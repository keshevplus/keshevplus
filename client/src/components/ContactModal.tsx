import { useState } from 'react';
import { Phone, Mail, Send, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { AccessibleButton } from '@/components/ui/accessible-button';
import { contentApi } from '@/lib/content';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).max(100),
  phone: z.string().trim().min(9, { message: 'Please enter a valid phone number' }).max(20),
  email: z.string().trim().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  message: z.string().trim().min(10, { message: 'Message must be at least 10 characters' }).max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ open, onOpenChange }) => {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
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
          title: language === 'he' ? 'הודעה נשלחה בהצלחה!' : 'Message sent successfully!',
          description: language === 'he' ? 'נחזור אליכם בהקדם' : "We'll get back to you soon",
        });
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: language === 'he' ? 'שגיאה בשליחה' : 'Error sending message',
        description: language === 'he' ? 'אנא נסו שוב' : 'Please try again',
        variant: 'destructive',
      });
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
      <DialogContent
        className="max-w-md sm:max-w-lg"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {language === 'he' ? 'צרו קשר' : 'Contact Us'}
          </DialogTitle>
          <DialogDescription>
            {language === 'he'
              ? 'השאירו פרטים ונחזור אליכם בהקדם האפשרי'
              : "Leave your details and we'll get back to you as soon as possible"}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              {language === 'he' ? 'תודה שפניתם אלינו!' : 'Thank you for contacting us!'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'he' ? 'נחזור אליכם בהקדם האפשרי' : "We'll get back to you as soon as possible"}
            </p>
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
            <div>
              <Label htmlFor="modal-name" className="text-sm font-medium text-foreground">
                {language === 'he' ? 'שם מלא' : 'Full Name'} *
              </Label>
              <Input
                id="modal-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={language === 'he' ? 'הזינו שם מלא' : 'Enter your full name'}
                className={cn("mt-1", errors.name && "border-destructive")}
                data-testid="input-modal-name"
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="modal-phone" className="text-sm font-medium text-foreground">
                {language === 'he' ? 'טלפון' : 'Phone'} *
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
                {language === 'he' ? 'דוא"ל (אופציונלי)' : 'Email (optional)'}
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
              <Label htmlFor="modal-message" className="text-sm font-medium text-foreground">
                {language === 'he' ? 'הודעה' : 'Message'} *
              </Label>
              <Textarea
                id="modal-message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={language === 'he' ? 'ספרו לנו איך נוכל לעזור' : 'Tell us how we can help'}
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
                {language === 'he' ? 'שלחו הודעה' : 'Send Message'}
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
