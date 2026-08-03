import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

export function eachNight(checkInDate: string, checkOutDate: string): string[] {
  const start = parseISO(checkInDate);
  const nights = Math.max(1, differenceInCalendarDays(parseISO(checkOutDate), start));
  const out: string[] = [];
  for (let i = 0; i < nights; i++) out.push(format(addDays(start, i), "yyyy-MM-dd"));
  return out;
}

export function nightsBetween(checkInDate: string, checkOutDate: string): number {
  return Math.max(1, differenceInCalendarDays(parseISO(checkOutDate), parseISO(checkInDate)));
}

export function todayIso(now: Date = new Date()): string {
  return format(now, "yyyy-MM-dd");
}
