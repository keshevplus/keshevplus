import { useMemo, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getLocalDateInputValue,
  isAppointmentWorkingDay,
  parseLocalDateInputValue,
} from '@shared/appointmentSchedule'

interface AppointmentDatePickerProps {
  id: string
  value: string
  min: string
  isHe: boolean
  isRTL: boolean
  className?: string
  onChange: (date: string) => void
}

const weekDaysHe = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
const weekDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AppointmentDatePicker({
  id,
  value,
  min,
  isHe,
  isRTL,
  className,
  onChange,
}: AppointmentDatePickerProps) {
  const selectedDate = value ? parseLocalDateInputValue(value) : null
  const minDate = parseLocalDateInputValue(min) || new Date()
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const base = selectedDate || minDate
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const monthLabel = visibleMonth.toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })

  const days = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    const start = new Date(firstDay)
    start.setDate(firstDay.getDate() - firstDay.getDay())

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const dateValue = getLocalDateInputValue(date)
      const outsideMonth = date.getMonth() !== visibleMonth.getMonth()
      const beforeMin = dateValue < min
      const closed = !isAppointmentWorkingDay(date)
      return {
        date,
        value: dateValue,
        label: date.getDate(),
        outsideMonth,
        disabled: outsideMonth || beforeMin || closed,
        closed,
      }
    })
  }, [min, visibleMonth])

  const goToMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  return (
    <div className="relative">
      <Button
        id={id}
        type="button"
        variant="outline"
        className={cn(
          'h-10 w-full justify-between bg-background px-3 text-sm font-normal',
          !value && 'text-muted-foreground',
          isRTL ? 'text-right' : 'text-left',
          className,
        )}
        onClick={() => setOpen((current) => !current)}
        data-testid="input-booking-date"
      >
        <span>
          {value
            ? selectedDate?.toLocaleDateString(isHe ? 'he-IL' : 'en-US')
            : (isHe ? 'בחרו תאריך' : 'Select date')}
        </span>
        <Calendar className="h-4 w-4 opacity-70" />
      </Button>

      {open && (
        <div
          className="absolute z-[120] mt-2 w-80 max-w-[calc(100vw-3rem)] rounded-md border bg-popover p-3 text-popover-foreground shadow-lg"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => goToMonth(isRTL ? 1 : -1)}>
              {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <div className="text-sm font-semibold">{monthLabel}</div>
            <Button type="button" variant="ghost" size="icon" onClick={() => goToMonth(isRTL ? -1 : 1)}>
              {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {(isHe ? weekDaysHe : weekDaysEn).map((day) => (
              <div key={day} className="py-1 font-medium">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => (
              <button
                key={day.value}
                type="button"
                disabled={day.disabled}
                title={day.closed ? (isHe ? 'המרפאה סגורה ביום זה' : 'Clinic is closed on this day') : undefined}
                className={cn(
                  'aspect-square rounded-md text-sm transition-colors',
                  day.value === value && 'bg-primary text-primary-foreground',
                  !day.disabled && day.value !== value && 'hover:bg-accent hover:text-accent-foreground',
                  day.disabled && 'cursor-not-allowed bg-muted/40 text-muted-foreground/40 line-through',
                  day.outsideMonth && 'invisible',
                )}
                onClick={() => {
                  onChange(day.value)
                  setOpen(false)
                }}
              >
                {day.label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {isHe ? 'ימים אפורים אינם זמינים לקביעת פגישה.' : 'Gray days are unavailable for appointments.'}
          </p>
        </div>
      )}
    </div>
  )
}
