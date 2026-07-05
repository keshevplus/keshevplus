export {
  APPOINTMENT_TIME_SLOTS,
  APPOINTMENT_WORKING_HOURS_EN,
  APPOINTMENT_WORKING_HOURS_HE,
  getLocalDateInputValue,
  isAppointmentDateStringWorkingDay,
} from '@shared/appointmentSchedule'

export interface AppointmentAvailability {
  date: string
  availableTimes: string[]
  bookedTimes: string[]
  nextAvailableDate: string | null
  timeSlots: string[]
}

export async function fetchAppointmentAvailability(date?: string): Promise<AppointmentAvailability> {
  const params = date ? `?date=${encodeURIComponent(date)}` : ''
  const response = await fetch(`/api/appointments/availability${params}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export function getAppointmentSubmitError(error: unknown, isHe: boolean) {
  const raw = error instanceof Error ? error.message : String(error || '')
  const jsonStart = raw.indexOf('{')

  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(raw.slice(jsonStart))
      if (isHe && parsed.errorHe) return parsed.errorHe
      if (!isHe && parsed.errorEn) return parsed.errorEn
      if (parsed.error) return parsed.error
    } catch {
      // Fall through to the existing message.
    }
  }

  return raw
}
