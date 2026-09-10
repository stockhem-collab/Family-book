import Link from "next/link"

import { addDays, toDateKey } from "@/lib/date/week"
import { cn } from "@/lib/utils"

const WEEKDAY_SHORT = ["Mån", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"]

export function WeekSelector({
  weekStart,
  today,
  basePath,
  selectedDay,
  interactive = true,
}: {
  weekStart: Date
  today: Date
  basePath: string
  /** Vald dags nyckel (YYYY-MM-DD), om agendan är filtrerad till en dag. */
  selectedDay?: string | null
  /** Sätt false för vyer som alltid visar hela veckan (t.ex. Mat). */
  interactive?: boolean
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekKey = toDateKey(weekStart)
  const todayKey = toDateKey(today)
  const prevWeek = toDateKey(addDays(weekStart, -7))
  const nextWeek = toDateKey(addDays(weekStart, 7))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Link
          href={`${basePath}?week=${prevWeek}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Föregående
        </Link>
        <Link
          href={basePath}
          className="text-primary text-sm underline-offset-4 hover:underline"
        >
          Idag
        </Link>
        <Link
          href={`${basePath}?week=${nextWeek}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Nästa →
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const key = toDateKey(day)
          const isToday = key === todayKey
          const isSelected = key === selectedDay
          const dayCellClassName = cn(
            "flex flex-col items-center rounded-lg py-2 text-xs transition-colors",
            isSelected
              ? "bg-accent text-accent-foreground ring-primary ring-2"
              : isToday
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          )

          if (!interactive) {
            return (
              <div key={key} className={dayCellClassName}>
                <span>{WEEKDAY_SHORT[i]}</span>
                <span className="text-sm font-semibold">{day.getDate()}</span>
              </div>
            )
          }

          const href = isSelected
            ? `${basePath}?week=${weekKey}`
            : `${basePath}?week=${weekKey}&day=${key}`

          return (
            <Link
              key={key}
              href={href}
              className={cn(dayCellClassName, "hover:opacity-80")}
            >
              <span>{WEEKDAY_SHORT[i]}</span>
              <span className="text-sm font-semibold">{day.getDate()}</span>
            </Link>
          )
        })}
      </div>
      {interactive && selectedDay && (
        <p className="text-muted-foreground text-xs">
          Visar vald dag + dagen efter.{" "}
          <Link
            href={`${basePath}?week=${weekKey}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            Visa hela veckan
          </Link>
        </p>
      )}
    </div>
  )
}
