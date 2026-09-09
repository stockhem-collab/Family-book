import Link from "next/link"

import { addDays, toDateKey } from "@/lib/date/week"
import { cn } from "@/lib/utils"

const WEEKDAY_SHORT = ["Mån", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"]

export function WeekSelector({
  weekStart,
  today,
}: {
  weekStart: Date
  today: Date
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayKey = toDateKey(today)
  const prevWeek = toDateKey(addDays(weekStart, -7))
  const nextWeek = toDateKey(addDays(weekStart, 7))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Link
          href={`/planering?week=${prevWeek}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Föregående
        </Link>
        <Link
          href="/planering"
          className="text-primary text-sm underline-offset-4 hover:underline"
        >
          Idag
        </Link>
        <Link
          href={`/planering?week=${nextWeek}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Nästa →
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const key = toDateKey(day)
          const isToday = key === todayKey
          return (
            <div
              key={key}
              className={cn(
                "flex flex-col items-center rounded-lg py-2 text-xs",
                isToday
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <span>{WEEKDAY_SHORT[i]}</span>
              <span className="text-sm font-semibold">{day.getDate()}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
