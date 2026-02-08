import { useState } from 'react'
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

const BookingPage = () => {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
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
    } catch {
      toast({
        title: isHe ? 'שגיאה' : 'Error',
        description: isHe ? 'קביעת הפגישה נכשלה. נסו שוב.' : 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isHe ? 'קביעת פגישה' : 'Book an Appointment'}
          </h1>
          <p className="text-muted-foreground">
            {isHe
              ? 'מלאו את הפרטים ונחזור אליכם לאישור הפגישה'
              : 'Fill in your details and we will confirm your appointment'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
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
                  data-testid="input-booking-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{isHe ? 'סוג הפגישה' : 'Appointment Type'} *</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {isHe ? 'תאריך' : 'Date'} *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    min={today}
                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                    data-testid="input-booking-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-1">
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

              <div className="space-y-2">
                <Label htmlFor="notes">{isHe ? 'הערות (אופציונלי)' : 'Notes (optional)'}</Label>
                <Textarea
                  id="notes"
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
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/">
            <Button variant="outline" data-testid="button-back-home-form">
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
