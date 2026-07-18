import { User, Baby } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/useLanguage'

type AppointmentFor = 'self' | 'child'

interface AppointmentForFieldsProps {
  isHe: boolean
  appointmentFor: AppointmentFor
  childName: string
  childAge: number | ''
  onAppointmentForChange: (value: AppointmentFor) => void
  onChildNameChange: (value: string) => void
  onChildAgeChange: (value: number | '') => void
  inputClassName?: string
}

const MIN_CHILD_AGE = 6

export function AppointmentForFields({
  isHe,
  appointmentFor,
  childName,
  childAge,
  onAppointmentForChange,
  onChildNameChange,
  onChildAgeChange,
  inputClassName,
}: AppointmentForFieldsProps) {
  const { t } = useLanguage()
  const handleAgeChange = (value: string) => {
    if (!value.trim()) {
      onChildAgeChange('')
      return
    }

    const next = Number(value)
    if (Number.isNaN(next)) return
    onChildAgeChange(next)
  }

  const showMinimumAgeMessage = childAge !== '' && childAge < MIN_CHILD_AGE

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>{t('appt_for.who')}</Label>
        <ToggleGroup
          type="single"
          value={appointmentFor}
          onValueChange={(value) => {
            if (value === 'self' || value === 'child') onAppointmentForChange(value)
          }}
          className="grid grid-cols-2 rounded-lg border bg-muted/30 p-1"
          data-testid="toggle-appointment-for"
        >
          <ToggleGroupItem
            value="self"
            className="h-10 rounded-md border-0 text-sm font-medium data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:shadow-sm"
            data-testid="toggle-appointment-for-self"
          >
            <User className="h-4 w-4" />
            {t('appt_for.me')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="child"
            className="h-10 rounded-md border-0 text-sm font-medium data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:shadow-sm"
            data-testid="toggle-appointment-for-child"
          >
            <Baby className="h-4 w-4" />
            {t('appt_for.child')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {appointmentFor === 'child' && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="booking-child">{t('appt_for.child_name')} *</Label>
            <Input
              id="booking-child"
              value={childName}
              onChange={(e) => onChildNameChange(e.target.value)}
              placeholder={t('appt_for.child_name')}
              required
              className={cn(inputClassName)}
              data-testid="input-booking-child-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="booking-child-age">{t('appt_for.child_age')} *</Label>
            <Input
              id="booking-child-age"
              type="number"
              inputMode="numeric"
              min={MIN_CHILD_AGE}
              value={childAge === '' ? '' : String(childAge)}
              onChange={(e) => handleAgeChange(e.target.value)}
              onInvalid={(e) => {
                e.currentTarget.setCustomValidity(t('appt_for.min_age_error'))
              }}
              onInput={(e) => e.currentTarget.setCustomValidity('')}
              placeholder={t('appt_for.child_age_placeholder')}
              aria-invalid={showMinimumAgeMessage}
              aria-describedby={showMinimumAgeMessage ? 'booking-child-age-error' : undefined}
              required
              className={cn(showMinimumAgeMessage && 'border-destructive focus-visible:ring-destructive', inputClassName)}
              data-testid="input-booking-child-age"
            />
            {showMinimumAgeMessage && (
              <p id="booking-child-age-error" className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive" role="tooltip">
                {t('appt_for.min_age_error')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export type { AppointmentFor }
