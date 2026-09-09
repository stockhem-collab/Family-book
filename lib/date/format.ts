const WEEKDAY_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

const TIME_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  hour: "2-digit",
  minute: "2-digit",
})

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
})

const SHORT_DATETIME_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function formatHeaderDate(date: Date) {
  const formatted = WEEKDAY_DATE_FORMATTER.format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function getGreeting(date: Date) {
  const hour = date.getHours()
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

// OBS: förenklad "idag"-gräns baserad på serverns lokala tidszon, inte
// nödvändigtvis Europe/Stockholm. Bra nog för MVP – kan förfinas senare.
export function startOfToday(now: Date = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return start
}

export function endOfToday(now: Date = new Date()) {
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return end
}
