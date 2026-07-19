import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, CheckCircle, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
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

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange }) => {
  const { t, language } = useLanguage()
  const isHe = language === 'he'
  const isRTL = language === 'he' || language === 'ar' || language === 'yi'
  const { toast } = useToast()
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
    childAge: '' as number | '',
    date: '',
    time: '',
    type: 'consultation',
    notes: '',
  })

  useBodyScrollLock(open)

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
    if (open) {
      prepareInitialDate().catch(() => undefined)
    }
  }, [open])

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
      // The server will still validate availability on submit.
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
    if (!form.clientName || !form.clientEmail || !form.clientPhone || !form.date || !form.time || (form.appointmentFor === 'child' && (!form.childName.trim() || form.childAge === ''))) {
      toast({
        title: t('booking.error_title'),
        description: t('booking.fill_required_fields'),
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

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setSubmitted(false)
      setForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        appointmentFor: 'self',
        childName: '',
        childAge: '',
        date: '',
        time: '',
        type: 'consultation',
        notes: '',
      })
    }, 300)
  }

  const today = getLocalDateInputValue()
  const availableTimes = availability?.date === form.date ? availability.availableTimes : APPOINTMENT_TIME_SLOTS

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      data-testid="booking-modal-overlay"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border-2 border-primary bg-background shadow-2xl pt-4 sm:pt-6"
        dir={isRTL ? 'rtl' : 'ltr'}
        data-testid="booking-modal-content"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-4 border-b border-border bg-background rounded-t-xl">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2 pr-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t('booking.title')}
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
              {t('booking.success_title')}
            </h3>
            <p className="text-muted-foreground">
              {t('booking.success_description')}
            </p>
            <Button onClick={handleClose} data-testid="button-close-booking-success">
              {t('booking.close')}
            </Button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground mb-4">
              {t('booking.modal_intro')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-name">{t('booking.full_name')} *</Label>
                  <Input
                    id="booking-name"
                    value={form.clientName}
                    onChange={(e) => setForm(f => ({ ...f, clientName: e.target.value }))}
                    placeholder={t('booking.full_name_placeholder')}
                    required
                    data-testid="input-booking-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-phone">{t('booking.phone')} *</Label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    value={form.clientPhone}
                    onChange={(e) => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                    placeholder={t('booking.phone_placeholder')}
                    required
                    data-testid="input-booking-phone"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="booking-email">{t('booking.email')} *</Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                  placeholder={t('booking.email_placeholder')}
                  required
                  data-testid="input-booking-email"
                />
              </div>

              <AppointmentForFields
                isHe={isHe}
                appointmentFor={form.appointmentFor}
                childName={form.childName}
                childAge={form.childAge}
                onAppointmentForChange={(appointmentFor) => setForm(f => ({
                  ...f,
                  appointmentFor,
                  childName: appointmentFor === 'self' ? '' : f.childName,
                  childAge: appointmentFor === 'self' ? '' : f.childAge,
                }))}
                onChildNameChange={(childName) => setForm(f => ({ ...f, childName }))}
                onChildAgeChange={(childAge) => setForm(f => ({ ...f, childAge }))}
              />

              <div className="space-y-1.5">
                <Label htmlFor="booking-type">{t('booking.appointment_type')} *</Label>
                <Select value={form.type} onValueChange={handleTypeChange} dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectTrigger data-testid="select-booking-type" className={isRTL ? 'text-right' : 'text-left'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : 'text-left'}>
                    {APPOINTMENT_TYPES.map(apptType => (
                      <SelectItem key={apptType.value} value={apptType.value} className={isRTL ? 'pr-8 pl-2 text-right' : 'text-left'}>
                        {isHe ? apptType.he : apptType.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-date" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t('booking.date')} *
                  </Label>
                  <AppointmentDatePicker
                    id="booking-date"
                    value={form.date}
                    min={today}
                    isHe={isHe}
                    isRTL={isRTL}
                    onChange={handleDateChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-time" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t('booking.time')} *
                  </Label>
                  <Select value={form.time} onValueChange={(v) => setForm(f => ({ ...f, time: v }))} dir={isRTL ? 'rtl' : 'ltr'} disabled={!form.date || availabilityLoading || availableTimes.length === 0}>
                    <SelectTrigger data-testid="select-booking-time" className={isRTL ? 'text-right' : 'text-left'}>
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

              <div className="space-y-1.5">
                <Label htmlFor="booking-notes">{t('booking.notes')}</Label>
                <Textarea
                  id="booking-notes"
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={t('booking.notes_placeholder')}
                  data-testid="textarea-booking-notes"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting} data-testid="button-submit-booking">
                {submitting
                  ? t('booking.submitting')
                  : t('booking.submit')}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingModal
