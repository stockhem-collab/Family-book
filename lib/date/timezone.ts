// Servern kör troligen UTC (Vercels Node-runtime), men appen är svensk –
// "idag" och alla klockslag måste räknas i Europe/Stockholm, inte i
// serverns egen tidszon. Bygger bara på inbyggda Intl-API:er (ingen extra
// paketberoende) och är DST-medveten (växlar korrekt mellan UTC+1/UTC+2).

const TIME_ZONE = "Europe/Stockholm"

const PARTS_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const OFFSET_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  timeZoneName: "shortOffset",
})

export type DateParts = { year: number; month: number; day: number }

/** Kalenderdatum (år/månad/dag) för ett ögonblick, uttryckt i svensk tid. */
export function getStockholmDateParts(instant: Date): DateParts {
  const parts = PARTS_FORMATTER.formatToParts(instant)
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value)
  return { year: get("year"), month: get("month"), day: get("day") }
}

function offsetMinutesNear(approxUTCMillis: number): number {
  const raw =
    OFFSET_FORMATTER.formatToParts(new Date(approxUTCMillis)).find(
      (p) => p.type === "timeZoneName"
    )?.value ?? "GMT+1"
  const match = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(raw)
  if (!match) return 60
  const sign = match[1] === "-" ? -1 : 1
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0))
}

/** UTC-tidpunkten för midnatt (00:00) en given svensk kalenderdag. */
export function stockholmMidnightFromParts({
  year,
  month,
  day,
}: DateParts): Date {
  const approxUTC = Date.UTC(year, month - 1, day, 0, 0, 0)
  return new Date(approxUTC - offsetMinutesNear(approxUTC) * 60000)
}

/** UTC-tidpunkten för midnatt i Stockholm, den kalenderdag `instant` faller inom. */
export function stockholmMidnightUTC(instant: Date): Date {
  return stockholmMidnightFromParts(getStockholmDateParts(instant))
}

/** Lägger till (eller drar ifrån) `days` svenska kalenderdagar. */
export function addStockholmDays(instant: Date, days: number): Date {
  const { year, month, day } = getStockholmDateParts(instant)
  return stockholmMidnightFromParts({ year, month, day: day + days })
}
