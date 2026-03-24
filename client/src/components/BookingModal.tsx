import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, CheckCircle, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'

const APPOINTMENT_TYPES = [
  { value: 'consultation', he: 'ייעוץ ראשוני', en: 'Initial Consultation' },
  { value: 'diagnosis', he: 'אבחון', en: 'Diagnosis' },
  { value: 'followup', he: 'מעקב', en: 'Follow-up' },
  { value: 'treatment', he: 'טיפול', en: 'Treatment' },
]

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
]

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange }) => {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    childName: '',
    date: '',
    time: '',
    type: 'consultation',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName || !form.clientEmail || !form.clientPhone || !form.date || !form.time) {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'אנא מלאו את כל השדות הנדרשים' : 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    try {
      await apiRequest('POST', '/api/appointments', form)
      setSubmitted(true)
      toast({
        title: isHe ? 'הפגישה נקבעה!' : 'Appointment Booked!',
        description: isHe ? 'נחזור אליכם לאישור בהקדם' : 'We will confirm your appointment shortly',
      })
    } catch (err: any) {
      const msg = err?.message || '';
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: msg.includes('תור פעיל') ? msg : (isHe ? 'קביעת הפגישה נכשלה. נסו שוב.' : 'Failed to book appointment. Please try again.'),
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setSubmitted(false)
      setForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        childName: '',
        date: '',
        time: '',
        type: 'consultation',
        notes: '',
      })
    }, 300)
  }

  const today = new Date().toISOString().split('T')[0]

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      data-testid="booking-modal-overlay"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border-2 border-primary bg-background shadow-2xl pt-2 sm:pt-4"
        dir={isHe ? 'rtl' : 'ltr'}
        data-testid="booking-modal-content"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-4 pb-4 border-b border-border bg-background rounded-t-xl">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {isHe ? 'קביעת פגישה' : 'Book an Appointment'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            data-testid="button-close-booking"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h3 className="text-2xl font-bold text-foreground">
              {isHe ? 'הפגישה נקבעה בהצלחה!' : 'Appointment Booked Successfully!'}
            </h3>
            <p className="text-muted-foreground">
              {isHe
                ? 'נחזור אליכם בהקדם לאשר את הפגישה. תודה!'
                : 'We will get back to you shortly to confirm your appointment. Thank you!'}
            </p>
            <Button onClick={handleClose} data-testid="button-close-booking-success">
              {isHe ? 'סגירה' : 'Close'}
            </Button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground mb-4">
              {isHe
                ? 'מלאו את הפרטים ונחזור אליכם לאישור הפגישה. שדות עם * הם חובה.'
                : 'Fill in your details and we will confirm your appointment. Fields with * are required.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-name">{isHe ? 'שם מלא' : 'Full Name'} *</Label>
                  <Input
                    id="booking-name"
                    value={form.clientName}
                    onChange={(e) => setForm(f => ({ ...f, clientName: e.target.value }))}
                    placeholder={isHe ? 'הכניסו את שמכם' : 'Enter your name'}
                    required
                    data-testid="input-booking-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-phone">{isHe ? 'טלפון' : 'Phone'} *</Label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    value={form.clientPhone}
                    onChange={(e) => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                    placeholder={isHe ? 'מספר הטלפון שלכם' : 'Your phone number'}
                    required
                    data-testid="input-booking-phone"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-email">{isHe ? 'דוא"ל' : 'Email'} *</Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                  placeholder={isHe ? 'כתובת הדוא"ל שלכם' : 'Your email address'}
                  required
                  data-testid="input-booking-email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-child">{isHe ? 'שם הילד/ה' : 'Child Name'}</Label>
                <Input
                  id="booking-child"
                  value={form.childName}
                  onChange={(e) => setForm(f => ({ ...f, childName: e.target.value }))}
                  placeholder={isHe ? 'שם הילד/ה (אם רלוונטי)' : 'Child name (if applicable)'}
                  data-testid="input-booking-child-name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-type">{isHe ? 'סוג הפגישה' : 'Appointment Type'} *</Label>
                <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger data-testid="select-booking-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {isHe ? t.he : t.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-date" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {isHe ? 'תאריך' : 'Date'} *
                  </Label>
                  <Input
                    id="booking-date"
                    type="date"
                    value={form.date}
                    min={today}
                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                    data-testid="input-booking-date"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-time" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {isHe ? 'שעה' : 'Time'} *
                  </Label>
                  <Select value={form.time} onValueChange={(v) => setForm(f => ({ ...f, time: v }))}>
                    <SelectTrigger data-testid="select-booking-time">
                      <SelectValue placeholder={isHe ? 'בחרו שעה' : 'Select time'} />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-notes">{isHe ? 'הערות (אופציונלי)' : 'Notes (optional)'}</Label>
                <Textarea
                  id="booking-notes"
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={isHe ? 'מידע נוסף שתרצו לשתף...' : 'Any additional information...'}
                  data-testid="textarea-booking-notes"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting} data-testid="button-submit-booking">
                {submitting
                  ? (isHe ? 'שולח...' : 'Submitting...')
                  : (isHe ? 'קביעת פגישה' : 'Book Appointment')}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingModal
