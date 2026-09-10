import { addStockholmDays, stockholmMidnightUTC } from "@/lib/date/timezone"

const TIME_ZONE = "Europe/Stockholm"

const WEEKDAY_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
})

const TIME_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
})

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
})

const SHORT_DATETIME_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
})

const HOUR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
})

export function formatHeaderDate(date: Date) {
  const formatted = WEEKDAY_DATE_FORMATTER.format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function getGreeting(date: Date) {
  const hour = Number(HOUR_FORMATTER.format(date))
  if (hour < 6) return "God natt"
  if (hour < 10) return "God morgon"
  if (hour < 17) return "Hej"
  return "God kväll"
}

export function formatTime(date: Date) {
  return TIME_FORMATTER.format(date)
}

export function formatShortDateTime(date: Date) {
  return SHORT_DATETIME_FORMATTER.format(date)
}

export function formatLongDate(date: Date) {
  return LONG_DATE_FORMATTER.format(date)
}

export function formatShortDate(date: Date) {
  return SHORT_DATE_FORMATTER.format(date)
}

export function formatRelativeTime(date: Date, now: Date = new Date()) {
  const diffMin = Math.round((now.getTime() - date.getTime()) / 60000)

  if (diffMin < 1) return "just nu"
  if (diffMin < 60) return `${diffMin} min sedan`

  const diffHours = Math.round(diffMin / 60)
  if (diffHours < 24) return `${diffHours} tim sedan`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) return "igår"
  if (diffDays < 7) return `${diffDays} dagar sedan`

  return SHORT_DATE_FORMATTER.format(date)
}

/** Midnatt (00:00) idag, i svensk tid – inklusiv nedre gräns för "idag". */
export function startOfToday(now: Date = new Date()) {
  return stockholmMidnightUTC(now)
}

/** Midnatt (00:00) imorgon, i svensk tid – exklusiv övre gräns för "idag". */
export function endOfToday(now: Date = new Date()) {
  return addStockholmDays(now, 1)
}
