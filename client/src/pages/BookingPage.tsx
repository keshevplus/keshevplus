import { useEffect, useState } from 'react'
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
import { AppointmentDatePicker } from '@/components/AppointmentDatePicker'
import {
  APPOINTMENT_TIME_SLOTS,
  APPOINTMENT_TYPES,
  type AppointmentAvailability,
  fetchAppointmentAvailability,
  getAppointmentSubmitError,
  getLocalDateInputValue,
} from '@/lib/appointmentAvailability'

const joinName = (firstName: string, lastName: string) => `${firstName.trim()} ${lastName.trim()}`.trim()

const BookingPage = () => {
  const { t, language } = useLanguage()
  const isHe = language === 'he'
  const isRTL = language === 'he' || language === 'ar' || language === 'yi'
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [availability, setAvailability] = useState<AppointmentAvailability | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [form, setForm] = useState({
    clientFirstName: '',
    clientLastName: '',
    clientEmail: '',
    clientPhone: '',
    appointmentFor: 'self' as AppointmentFor,
    childFirstName: '',
    childLastName: '',
    childAge: '' as number | '',
    date: '',
    time: '',
    type: 'consultation',
    notes: '',
  })

  const loadAvailability = async (date?: string, type?: string) => {
    setAvailabilityLoading(true)
    try {
      const nextAvailability = await fetchAppointmentAvailability(date, type || form.type)
      setAvailability(nextAvailability)
      return nextAvailability
    } finally {
      setAvailabilityLoading(false)
    }
  }

  useEffect(() => {
    prepareInitialDate().catch(() => undefined)
  }, [])

  async function prepareInitialDate() {
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
          title: t('booking.date_unavailable_title'),
          description: t('booking.date_unavailable_description'),
        })
      }
    } catch {
      toast({
        title: t('booking.error_title'),
        description: t('booking.availability_check_failed'),
        variant: 'destructive',
      })
    }
  }

  const handleTypeChange = async (type: string) => {
    setForm(f => ({ ...f, type }))
    if (!form.date) return

    try {
      const nextAvailability = await loadAvailability(form.date, type)
      if (form.time && !nextAvailability.availableTimes.includes(form.time)) {
        setForm(f => ({ ...f, time: '' }))
        toast({
          title: t('booking.time_unavailable_title'),
          description: t('booking.time_unavailable_description'),
        })
      }
    } catch {
      // The server will still validate availability on submit.
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const clientName = joinName(form.clientFirstName, form.clientLastName)
    const childName = joinName(form.childFirstName, form.childLastName)
    if (!form.clientFirstName.trim() || !form.clientLastName.trim() || !form.clientEmail || !form.clientPhone || !form.date || !form.time || (form.appointmentFor === 'child' && (!form.childFirstName.trim() || !form.childLastName.trim() || form.childAge === ''))) {
      toast({
        title: t('booking.error_title'),
        description: t('booking.fill_required_fields'),
        variant: 'destructive',
      })
      return
    }
    setSubmitting(true)
    try {
      const {
        clientFirstName: _clientFirstName,
        clientLastName: _clientLastName,
        childFirstName: _childFirstName,
        childLastName: _childLastName,
        ...appointmentFields
      } = form
      await apiRequest('POST', '/api/appointments', {
        ...appointmentFields,
        clientName,
        childName: form.appointmentFor === 'child' ? childName : null,
        childAge: form.appointmentFor === 'child' ? form.childAge : null,
      })
      setSubmitted(true)
      toast({
        title: t('booking.booked_toast_title'),
        description: t('booking.booked_toast_description'),
      })
    } catch (err: any) {
      const msg = getAppointmentSubmitError(err, isHe)
      toast({
        title: t('booking.error_title'),
        description: msg || t('booking.submit_failed'),
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
              {t('booking.success_title')}
            </h2>
            <p className="text-muted-foreground">
              {t('booking.success_description')}
            </p>
            <div className="pt-4">
              <Link href="/">
                <Button data-testid="button-back-home">
                  {isHe ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                  {t('booking.back_to_home')}
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
            {t('booking.title')}
          </h1>
          <p className="text-white/80">
            {t('booking.page_subtitle')}
          </p>
        </div>

        <Card className="bg-[#FFFDF5] border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              {t('booking.details_title')}
            </CardTitle>
            <CardDescription>
              {t('booking.fields_required_note')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">{isHe ? 'שם פרטי' : 'First name'} *</Label>
                  <Input
                    id="first-name"
                    value={form.clientFirstName}
                    onChange={(e) => setForm(f => ({ ...f, clientFirstName: e.target.value }))}
                    placeholder={isHe ? 'שם פרטי' : 'First name'}
                    required
                    className="bg-white dark:bg-white/90"
                    data-testid="input-booking-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">{isHe ? 'שם משפחה' : 'Last name'} *</Label>
                  <Input
                    id="last-name"
                    value={form.clientLastName}
                    onChange={(e) => setForm(f => ({ ...f, clientLastName: e.target.value }))}
                    placeholder={isHe ? 'שם משפחה' : 'Last name'}
                    required
                    className="bg-white dark:bg-white/90"
                    data-testid="input-booking-last-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('booking.phone')} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.clientPhone}
                    onChange={(e) => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                    placeholder={t('booking.phone_placeholder')}
                    required
                    className="bg-white dark:bg-white/90"
                    data-testid="input-booking-phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('booking.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                  placeholder={t('booking.email_placeholder')}
                  required
                  className="bg-white dark:bg-white/90"
                  data-testid="input-booking-email"
                />
              </div>

              <AppointmentForFields
                isHe={isHe}
                appointmentFor={form.appointmentFor}
                childFirstName={form.childFirstName}
                childLastName={form.childLastName}
                childAge={form.childAge}
                inputClassName="bg-white dark:bg-white/90"
                onAppointmentForChange={(appointmentFor) => setForm(f => ({
                  ...f,
                  appointmentFor,
                  childFirstName: appointmentFor === 'self' ? '' : f.childFirstName,
                  childLastName: appointmentFor === 'self' ? '' : f.childLastName,
                  childAge: appointmentFor === 'self' ? '' : f.childAge,
                }))}
                onChildFirstNameChange={(childFirstName) => setForm(f => ({ ...f, childFirstName }))}
                onChildLastNameChange={(childLastName) => setForm(f => ({ ...f, childLastName }))}
                onChildAgeChange={(childAge) => setForm(f => ({ ...f, childAge }))}
              />

              <div className="space-y-2">
                <Label htmlFor="type">{t('booking.appointment_type')} *</Label>
                <Select value={form.type} onValueChange={handleTypeChange} dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectTrigger data-testid="select-booking-type" className={`bg-white dark:bg-white/90 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : 'text-left'}>
                    {APPOINTMENT_TYPES.map(apptType => (
                      <SelectItem key={apptType.value} value={apptType.value} className={isRTL ? 'pr-8 pl-2 text-right' : 'text-left'}>
                        {t(apptType.translationKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t('booking.date')} *
                  </Label>
                  <AppointmentDatePicker
                    id="date"
                    value={form.date}
                    min={today}
                    className="bg-white dark:bg-white/90"
                    isHe={isHe}
                    isRTL={isRTL}
                    onChange={handleDateChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t('booking.time')} *
                  </Label>
                  <Select value={form.time} onValueChange={(v) => setForm(f => ({ ...f, time: v }))} dir={isRTL ? 'rtl' : 'ltr'} disabled={!form.date || availabilityLoading || availableTimes.length === 0}>
                    <SelectTrigger data-testid="select-booking-time" className={`bg-white dark:bg-white/90 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <SelectValue placeholder={availabilityLoading ? t('booking.checking_availability') : t('booking.select_time')} />
                    </SelectTrigger>
                    <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : 'text-left'}>
                      {availableTimes.map(time => (
                        <SelectItem key={time} value={time} className={isRTL ? 'pr-8 pl-2 text-right' : 'text-left'}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.date && !availabilityLoading && availableTimes.length === 0 && (
                    <p className="text-xs text-destructive">
                      {t('booking.no_times_available')}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('booking.notes')}</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={t('booking.notes_placeholder')}
                  className="bg-white dark:bg-white/90"
                  data-testid="textarea-booking-notes"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting} data-testid="button-submit-booking">
                {submitting
                  ? t('booking.submitting')
                  : t('booking.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/">
            <Button variant="outline" className="bg-white/10 text-white border-white/30" data-testid="button-back-home-form">
              {isHe ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
              {t('booking.back_to_home')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
