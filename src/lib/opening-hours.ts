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

const LOCATION_TIMEZONE = "Pacific/Auckland";

/**
 * Whether the location is open right now, based on today's opening_hours
 * entry in Queenstown local time. Returns null when today has no hours data
 * at all, so callers can hide the badge rather than guess.
 */
export function isLocationOpenNow(openingHours: OpeningHours | null, now: Date = new Date()): boolean | null {
  if (!openingHours) return null;

  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: LOCATION_TIMEZONE, weekday: "long" })
    .format(now)
    .toLowerCase() as DayKey;
  const hours = openingHours[weekday];
  if (!DAYS.includes(weekday)) return null;
  if (hours === undefined) return null;
  if (hours === null) return false;

  const currentTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: LOCATION_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);

  return currentTime >= hours.open && currentTime <= hours.close;
}
