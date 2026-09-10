import { getStockholmDateParts, stockholmMidnightFromParts } from "@/lib/date/timezone"

function getBirthDateParts(birthDate: Date) {
  // birth_date kommer från en Postgres "date"-kolumn (inget klockslag) och
  // JS parsar den som midnatt UTC – läs tillbaka med UTC-getters så vi får
  // exakt samma kalenderdag som lagrades, oavsett serverns tidszon.
  return {
    year: birthDate.getUTCFullYear(),
    month: birthDate.getUTCMonth() + 1,
    day: birthDate.getUTCDate(),
  }
}

export function calculateAge(birthDate: Date, now: Date = new Date()): number {
  const birth = getBirthDateParts(birthDate)
  const today = getStockholmDateParts(now)

  let age = today.year - birth.year
  const hasHadBirthdayThisYear =
    today.month > birth.month ||
    (today.month === birth.month && today.day >= birth.day)
  if (!hasHadBirthdayThisYear) age -= 1
  return age
}

export function daysUntilBirthday(
  birthDate: Date,
  now: Date = new Date()
): number {
  const birth = getBirthDateParts(birthDate)
  const today = getStockholmDateParts(now)
  const todayMidnight = stockholmMidnightFromParts(today)

  let nextBirthday = stockholmMidnightFromParts({
    year: today.year,
    month: birth.month,
    day: birth.day,
  })

  if (nextBirthday.getTime() < todayMidnight.getTime()) {
    nextBirthday = stockholmMidnightFromParts({
      year: today.year + 1,
      month: birth.month,
      day: birth.day,
    })
  }

  const diffMs = nextBirthday.getTime() - todayMidnight.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}
