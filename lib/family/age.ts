export function calculateAge(birthDate: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - birthDate.getFullYear()
  const hasHadBirthdayThisYear =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() &&
      now.getDate() >= birthDate.getDate())
  if (!hasHadBirthdayThisYear) age -= 1
  return age
}

export function daysUntilBirthday(
  birthDate: Date,
  now: Date = new Date()
): number {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  )
  nextBirthday.setHours(0, 0, 0, 0)

  if (nextBirthday.getTime() < today.getTime()) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1)
  }

  const diffMs = nextBirthday.getTime() - today.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}
