import {
  addStockholmDays,
  getStockholmDateParts,
  stockholmMidnightFromParts,
  stockholmMidnightUTC,
} from "@/lib/date/timezone"

// Måndag som veckostart (svensk konvention), räknat i svensk tid.

export function getWeekStart(date: Date): Date {
  const midnight = stockholmMidnightUTC(date)
  const { year, month, day } = getStockholmDateParts(midnight)
  // Bara kalenderdagens veckodag behövs (0=söndag..6=lördag) – en vanlig
  // UTC-baserad Date duger fint till just det, oavsett klockslag.
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  return addStockholmDays(midnight, diff)
}

export function addDays(date: Date, days: number): Date {
  return addStockholmDays(date, days)
}

export function toDateKey(date: Date): string {
  const { year, month, day } = getStockholmDateParts(date)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  return stockholmMidnightFromParts({
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  })
}
