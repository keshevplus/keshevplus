import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { Link } from 'wouter'
import { AppointmentForFields, type AppointmentFor } from '@/components/AppointmentForFields'
import {
  APPOINTMENT_TIME_SLOTS,
  type AppointmentAvailability,
  fetchAppointmentAvailability,
  getAppointmentSubmitError,
  getLocalDateInputValue,
} from '@/lib/appointmentAvailability'

const APPOINTMENT_TYPES = [
  { value: 'consultation', he: 'ייעוץ ראשוני', en: 'Initial Consultation' },
  { value: 'diagnosis', he: 'אבחון', en: 'Diagnosis' },
  { value: 'followup', he: 'מעקב', en: 'Follow-up' },
  { value: 'treatment', he: 'טיפול', en: 'Treatment' },
]

const BookingPage = () => {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const isRTL = language === 'he' || language === 'ar' || language === 'yi'
  const { toast } = useToast()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [availability, setAvailability] = useState<AppointmentAvailability | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    appointmentFor: 'self' as AppointmentFor,
    childName: '',
    childAge: 6,
    date: '',
    time: '',
    type: 'consultation',
    notes: '',
  })

  const loadAvailability = async (date?: string) => {
    setAvailabilityLoading(true)
    try {
      const nextAvailability = await fetchAppointmentAvailability(date)
      setAvailability(nextAvailability)
      return nextAvailability
    } finally {
      setAvailabilityLoading(false)
    }
  }

  useEffect(() => {
    loadAvailability().catch(() => undefined)
  }, [])

  const handleDatePickerOpen = async () => {
    dateInputRef.current?.showPicker?.()

    try {
      const currentAvailability = availability || await loadAvailability()
      if (!form.date && currentAvailability.nextAvailableDate) {
        const nextAvailability = await loadAvailability(currentAvailability.nextAvailableDate)
        setForm(f => ({
          ...f,
          date: currentAvailability.nextAvailableDate || '',
          time: nextAvailability.availableTimes.includes(f.time) ? f.time : '',
        }))
      }
    } catch {
      // The server still validates availability during submission.
    }
  }

  const handleDateChange = async (date: string) => {
    setForm(f => ({ ...f, date, time: '' }))

    try {
      const nextAvailability = await loadAvailability(date)
      if (nextAvailability.availableTimes.length === 0 && nextAvailability.nextAvailableDate && nextAvailability.nextAvailableDate !== date) {
        const nearestAvailability = await loadAvailability(nextAvailability.nextAvailableDate)
        setForm(f => ({
          ...f,
          date: nextAvailability.nextAvailableDate || f.date,
          time: nearestAvailability.availableTimes.includes(f.time) ? f.time : '',
        }))
        toast({
          title: isHe ? 'המועד אינו פנוי' : 'Date unavailable',
          description: isHe ? 'בחרנו עבורך את התאריך הפנוי הקרוב ביותר.' : 'We selected the closest available date.',
        })
      }
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'לא הצלחנו לבדוק זמינות. נסו שוב.' : 'Could not check availability. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName || !form.clientEmail || !form.clientPhone || !form.date || !form.time || (form.appointmentFor === 'child' && !form.childName.trim())) {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'אנא מלאו את כל השדות הנדרשים' : 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    try {
      await apiRequest('POST', '/api/appointments', {
        ...form,
        childName: form.appointmentFor === 'child' ? form.childName.trim() : null,
        childAge: form.appointmentFor === 'child' ? form.childAge : null,
      })
      setSubmitted(true)
      toast({
        title: isHe ? 'הפגישה נקבעה!' : 'Appointment Booked!',
        description: isHe ? 'נחזור אליכם לאישור בהקדם' : 'We will confirm your appointment shortly',
      })
    } catch (err: any) {
      const msg = getAppointmentSubmitError(err, isHe)
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: msg || (isHe ? 'קביעת הפגישה נכשלה. נסו שוב.' : 'Failed to book appointment. Please try again.'),
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const today = getLocalDateInputValue()
  const availableTimes = availability?.date === form.date ? availability.availableTimes : APPOINTMENT_TIME_SLOTS

  if (submitted) {
    return (
      <div className="min-h-screen bg-primary/90 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-[#FFFDF5] border-none shadow-2xl">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">
              {isHe ? 'הפגישה נקבעה בהצלחה!' : 'Appointment Booked Successfully!'}
            </h2>
            <p className="text-muted-foreground">
              {isHe
                ? 'נחזור אליכם בהקדם לאשר את הפגישה. תודה!'
                : 'We will get back to you shortly to confirm your appointment. Thank you!'}
            </p>
            <div className="pt-4">
              <Link href="/">
                <Button data-testid="button-back-home">
                  {isHe ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                  {isHe ? 'חזרה לדף הבית' : 'Back to Home'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary/90" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">
            {isHe ? 'קביעת פגישה' : 'Book an Appointment'}
          </h1>
          <p className="text-white/80">
            {isHe
              ? 'מלאו את הפרטים ונחזור אליכם לאישור הפגישה'
              : 'Fill in your details and we will confirm your appointment'}
          </p>
        </div>

        <Card className="bg-[#FFFDF5] border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              {isHe ? 'פרטי הפגישה' : 'Appointment Details'}
            </CardTitle>
            <CardDescription>
              {isHe ? 'כל השדות המסומנים ב-* הם חובה' : 'Fields marked with * are required'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{isHe ? 'שם מלא' : 'Full Name'} *</Label>
                  <Input
                    id="name"
                    value={form.clientName}
                    onChange={(e) => setForm(f => ({ ...f, clientName: e.target.value }))}
                    placeholder={isHe ? 'הכניסו את שמכם' : 'Enter your name'}
                    required
                    className="bg-white dark:bg-white/90"
                    data-testid="input-booking-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{isHe ? 'טלפון' : 'Phone'} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.clientPhone}
                    onChange={(e) => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                    placeholder={isHe ? 'מספר הטלפון שלכם' : 'Your phone number'}
                    required
                    className="bg-white dark:bg-white/90"
                    data-testid="input-booking-phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{isHe ? 'דוא"ל' : 'Email'} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                  placeholder={isHe ? 'כתובת הדוא"ל שלכם' : 'Your email address'}
                  required
                  className="bg-white dark:bg-white/90"
                  data-testid="input-booking-email"
                />
              </div>

              <AppointmentForFields
                isHe={isHe}
                appointmentFor={form.appointmentFor}
                childName={form.childName}
                childAge={form.childAge}
                inputClassName="bg-white dark:bg-white/90"
                onAppointmentForChange={(appointmentFor) => setForm(f => ({
                  ...f,
                  appointmentFor,
                  childName: appointmentFor === 'self' ? '' : f.childName,
                  childAge: appointmentFor === 'self' ? 6 : f.childAge,
                }))}
                onChildNameChange={(childName) => setForm(f => ({ ...f, childName }))}
                onChildAgeChange={(childAge) => setForm(f => ({ ...f, childAge }))}
              />

              <div className="space-y-2">
                <Label htmlFor="type">{isHe ? 'סוג הפגישה' : 'Appointment Type'} *</Label>
                <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))} dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectTrigger data-testid="select-booking-type" className={`bg-white dark:bg-white/90 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : 'text-left'}>
                    {APPOINTMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value} className={isRTL ? 'pr-8 pl-2 text-right' : 'text-left'}>
                        {isHe ? t.he : t.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {isHe ? 'תאריך' : 'Date'} *
                  </Label>
                  <Input
                    ref={dateInputRef}
                    id="date"
                    type="date"
                    value={form.date}
                    min={today}
                    onClick={handleDatePickerOpen}
                    onFocus={handleDatePickerOpen}
                    onChange={(e) => handleDateChange(e.target.value)}
                    required
                    className="bg-white dark:bg-white/90"
                    data-testid="input-booking-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {isHe ? 'שעה' : 'Time'} *
                  </Label>
                  <Select value={form.time} onValueChange={(v) => setForm(f => ({ ...f, time: v }))} dir={isRTL ? 'rtl' : 'ltr'} disabled={!form.date || availabilityLoading || availableTimes.length === 0}>
                    <SelectTrigger data-testid="select-booking-time" className={`bg-white dark:bg-white/90 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <SelectValue placeholder={availabilityLoading ? (isHe ? 'בודק זמינות...' : 'Checking availability...') : (isHe ? 'בחרו שעה' : 'Select time')} />
                    </SelectTrigger>
                    <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : 'text-left'}>
                      {availableTimes.map(t => (
                        <SelectItem key={t} value={t} className={isRTL ? 'pr-8 pl-2 text-right' : 'text-left'}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.date && !availabilityLoading && availableTimes.length === 0 && (
                    <p className="text-xs text-destructive">
                      {isHe ? 'אין שעות פנויות בתאריך הזה.' : 'No available times on this date.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{isHe ? 'הערות (אופציונלי)' : 'Notes (optional)'}</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={isHe ? 'מידע נוסף שתרצו לשתף...' : 'Any additional information...'}
                  className="bg-white dark:bg-white/90"
                  data-testid="textarea-booking-notes"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting} data-testid="button-submit-booking">
                {submitting
                  ? (isHe ? 'שולח...' : 'Submitting...')
                  : (isHe ? 'קביעת פגישה' : 'Book Appointment')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 text-white border-white/30" data-testid="button-back-home-form">
              {isHe ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
              {isHe ? 'חזרה לדף הבית' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
