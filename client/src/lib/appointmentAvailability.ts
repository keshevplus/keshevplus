export {
  APPOINTMENT_TIME_SLOTS,
  APPOINTMENT_TYPES,
  APPOINTMENT_WORKING_HOURS_EN,
  APPOINTMENT_WORKING_HOURS_HE,
  getLocalDateInputValue,
  getTimeSlotsForType,
  isAppointmentDateStringWorkingDay,
} from '@shared/appointmentSchedule'
export type { AppointmentTypeHoursConfig } from '@shared/appointmentSchedule'

export interface AppointmentAvailability {
  date: string
  availableTimes: string[]
  bookedTimes: string[]
  nextAvailableDate: string | null
  timeSlots: string[]
}

export async function fetchAppointmentAvailability(date?: string, type?: string): Promise<AppointmentAvailability> {
  const params = new URLSearchParams()
  if (date) params.set('date', date)
  if (type) params.set('type', type)
  const query = params.toString()
  const response = await fetch(`/api/appointments/availability${query ? `?${query}` : ''}`, {
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
