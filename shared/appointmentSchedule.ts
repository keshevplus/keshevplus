export const APPOINTMENT_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
] as const;

export const APPOINTMENT_WORKING_DAYS = [0, 1, 2, 3, 4] as const;
export const APPOINTMENT_WORKING_HOURS_HE = "א'-ה' 09:00-19:00";
export const APPOINTMENT_WORKING_HOURS_EN = "Sun-Thu 09:00-19:00";

export const APPOINTMENT_TYPES = [
  { value: "consultation", translationKey: "booking.type_consultation", he: "ייעוץ ראשוני", en: "Initial Consultation" },
  { value: "diagnosis", translationKey: "booking.type_diagnosis", he: "הערכה", en: "Assessment" },
  { value: "followup", translationKey: "booking.type_followup", he: "מעקב", en: "Follow-up" },
  { value: "treatment", translationKey: "booking.type_treatment", he: "טיפול", en: "Treatment" },
  { value: "moxo", translationKey: "booking.type_moxo", he: "בדיקת MOXO", en: "MOXO Test" },
] as const;

export interface AppointmentTypeHours {
  startTime: string;
  endTime: string;
}

export type AppointmentTypeHoursConfig = Partial<Record<string, AppointmentTypeHours>>;

export function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDateInputValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isAppointmentWorkingDay(date: Date) {
  return (APPOINTMENT_WORKING_DAYS as readonly number[]).includes(date.getDay());
}

export function isAppointmentDateStringWorkingDay(value: string) {
  const date = parseLocalDateInputValue(value);
  return !!date && isAppointmentWorkingDay(date);
}

export function isAppointmentTimeSlot(value: string) {
  return (APPOINTMENT_TIME_SLOTS as readonly string[]).includes(value);
}

export function getTimeSlotsForType(type: string, config: AppointmentTypeHoursConfig): readonly string[] {
  const hours = config[type];
  if (!hours) return APPOINTMENT_TIME_SLOTS;
  return APPOINTMENT_TIME_SLOTS.filter((slot) => slot >= hours.startTime && slot < hours.endTime);
}

export function isAppointmentTimeSlotForType(type: string, value: string, config: AppointmentTypeHoursConfig) {
  return getTimeSlotsForType(type, config).includes(value);
}
