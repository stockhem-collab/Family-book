import { EventCard } from "@/components/planning/event-card"
import { formatShortDate } from "@/lib/date/format"
import { getStockholmDateParts } from "@/lib/date/timezone"
import { addDays, toDateKey } from "@/lib/date/week"
import type { Tables } from "@/lib/supabase/types"

const WEEKDAY_LONG = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
]

type EventRow = Pick<
  Tables<"calendar_events">,
  | "id"
  | "title"
  | "category"
  | "location"
  | "starts_at"
  | "ends_at"
  | "member_ids"
  | "bring_items"
>
type Member = Pick<Tables<"profiles">, "id" | "display_name">

export function DayAgenda({
  weekStart,
  events,
  members,
  selectedDay,
}: {
  weekStart: Date
  events: EventRow[]
  members: Member[]
  /** Vald dags nyckel (YYYY-MM-DD) – visar bara den dagen + dagen efter. */
  selectedDay?: Date | null
}) {
  const memberName = (id: string) =>
    members.find((member) => member.id === id)?.display_name

  const days = selectedDay
    ? [selectedDay, addDays(selectedDay, 1)]
    : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  // WEEKDAY_LONG är måndag-först (index 0). Date#getDay() är serverns egen
  // tidszon (troligen UTC) – fel dag nära midnatt svensk tid – så vi läser
  // veckodagen via de svenska kalenderdelarna istället.
  const weekdayIndexes = days.map((day) => {
    const { year, month, day: d } = getStockholmDateParts(day)
    const weekday = new Date(Date.UTC(year, month - 1, d)).getUTCDay()
    return (weekday + 6) % 7
  })
  const eventsByDay = new Map<string, EventRow[]>()
  for (const event of events) {
    const key = toDateKey(new Date(event.starts_at))
    const list = eventsByDay.get(key) ?? []
    list.push(event)
    eventsByDay.set(key, list)
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map((day, i) => {
        const key = toDateKey(day)
        const dayEvents = eventsByDay.get(key) ?? []

        return (
          <div key={key} className="flex flex-col gap-2">
            <h3 className="text-foreground text-sm font-semibold">
              {WEEKDAY_LONG[weekdayIndexes[i]]} {formatShortDate(day)}
            </h3>
            {dayEvents.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                Inget inplanerat.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {dayEvents.map((event) => {
                  const memberLabel = (event.member_ids ?? [])
                    .map((id) => memberName(id))
                    .filter(Boolean)
                    .join(", ")

                  return (
                    <li key={event.id}>
                      <EventCard
                        event={event}
                        members={members}
                        memberLabel={memberLabel}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
