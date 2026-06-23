export const APPOINTMENT_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
]

export interface AppointmentAvailability {
  date: string
  availableTimes: string[]
  bookedTimes: string[]
  nextAvailableDate: string | null
  timeSlots: string[]
}

export function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
