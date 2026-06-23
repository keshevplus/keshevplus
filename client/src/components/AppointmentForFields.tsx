import { User, Baby } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

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
const MAX_CHILD_AGE = 17
const CHILD_AGE_OPTIONS = Array.from(
  { length: MAX_CHILD_AGE - MIN_CHILD_AGE + 1 },
  (_, index) => MIN_CHILD_AGE + index,
)

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
  const handleAgeChange = (value: string) => {
    if (!value.trim()) {
      onChildAgeChange('')
      return
    }

    const next = Number(value)
    if (Number.isNaN(next)) return
    if (next >= MIN_CHILD_AGE && next <= MAX_CHILD_AGE) {
      onChildAgeChange(next)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>{isHe ? 'עבור מי הפגישה?' : 'Who is the appointment for?'}</Label>
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
            {isHe ? 'עבורי' : 'Me'}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="child"
            className="h-10 rounded-md border-0 text-sm font-medium data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:shadow-sm"
            data-testid="toggle-appointment-for-child"
          >
            <Baby className="h-4 w-4" />
            {isHe ? 'עבור הילד/ה' : 'For the child'}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {appointmentFor === 'child' && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="booking-child">{isHe ? 'שם הילד/ה' : 'Child Name'} *</Label>
            <Input
              id="booking-child"
              value={childName}
              onChange={(e) => onChildNameChange(e.target.value)}
              placeholder={isHe ? 'שם הילד/ה' : 'Child name'}
              required
              className={cn(inputClassName)}
              data-testid="input-booking-child-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="booking-child-age">{isHe ? 'גיל הילד' : 'Child Age'} *</Label>
            <Input
              id="booking-child-age"
              type="text"
              inputMode="numeric"
              list="booking-child-age-options"
              value={childAge === '' ? '' : String(childAge)}
              onChange={(e) => handleAgeChange(e.target.value)}
              placeholder={isHe ? '(בין 6-17)' : '(6-17)'}
              pattern="^(6|7|8|9|1[0-7])$"
              required
              className={cn(inputClassName)}
              data-testid="input-booking-child-age"
            />
            <datalist id="booking-child-age-options">
              {CHILD_AGE_OPTIONS.map((age) => (
                <option key={age} value={age} />
              ))}
            </datalist>
          </div>
        </div>
      )}
    </div>
  )
}

export type { AppointmentFor }
