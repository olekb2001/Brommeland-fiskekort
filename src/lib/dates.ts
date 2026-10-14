import { site } from "@/config/site";

const TZ = "Europe/Oslo";

/** Dagens dato (YYYY-MM-DD) i norsk tid. */
export function todayOslo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(`${s}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Sesongvindu for et gitt år. */
export function seasonFor(year: number) {
  return {
    start: `${year}-${site.season.start}`,
    end: `${year}-${site.season.end}`,
  };
}

export function isInSeason(date: string): boolean {
  const year = Number(date.slice(0, 4));
  const { start, end } = seasonFor(year);
  return date >= start && date <= end;
}

/** Kan datoen kjøpes? Ikke i fortiden og innenfor sesong. */
export function isBookableDate(date: string): boolean {
  return isValidDateString(date) && date >= todayOslo() && isInSeason(date);
}

export function formatLongDate(date: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function formatNok(amount: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Alle datoer (YYYY-MM-DD) i en måned. month er 1-12. */
export function datesInMonth(year: number, month: number): string[] {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: last }, (_, i) => {
    const d = String(i + 1).padStart(2, "0");
    return `${year}-${String(month).padStart(2, "0")}-${d}`;
  });
}

/** Første måned kalenderen bør vise: inneværende sesong, ellers neste sesongstart. */
export function defaultMonth(): { year: number; month: number } {
  const today = todayOslo();
  const year = Number(today.slice(0, 4));
  const { start, end } = seasonFor(year);
  if (today <= end) {
    const from = today > start ? today : start;
    return { year: Number(from.slice(0, 4)), month: Number(from.slice(5, 7)) };
  }
  const next = seasonFor(year + 1).start;
  return { year: year + 1, month: Number(next.slice(5, 7)) };
}

/** Dato (YYYY-MM-DD) for neste sesongstart, eller null hvis sesongen pågår. */
export function nextSeasonStart(): string | null {
  const today = todayOslo();
  const year = Number(today.slice(0, 4));
  const { start, end } = seasonFor(year);
  if (today < start) return start;
  if (today > end) return seasonFor(year + 1).start;
  return null;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
