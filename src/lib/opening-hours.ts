export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DayKey = (typeof DAYS)[number];
export type DayHours = { open: string; close: string } | null;
export type OpeningHours = Record<DayKey, DayHours>;

export function parseOpeningHoursFromFormData(formData: FormData): OpeningHours {
  const result = {} as OpeningHours;
  for (const day of DAYS) {
    const closed = formData.get(`${day}_closed`) === "on";
    const open = String(formData.get(`${day}_open`) ?? "").trim();
    const close = String(formData.get(`${day}_close`) ?? "").trim();
    result[day] = closed || !open || !close ? null : { open, close };
  }
  return result;
}
