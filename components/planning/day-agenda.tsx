import { formatTime } from "@/lib/date/format"
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
const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
})

type EventRow = Pick<
  Tables<"calendar_events">,
  | "id"
  | "title"
  | "category"
  | "location"
  | "starts_at"
  | "member_ids"
  | "bring_items"
>
type Member = Pick<Tables<"profiles">, "id" | "display_name">

export function DayAgenda({
  weekStart,
  events,
  members,
}: {
  weekStart: Date
  events: EventRow[]
  members: Member[]
}) {
  const memberName = (id: string) =>
    members.find((member) => member.id === id)?.display_name

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
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
              {WEEKDAY_LONG[i]} {SHORT_DATE_FORMATTER.format(day)}
            </h3>
            {dayEvents.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                Inget inplanerat.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {dayEvents.map((event) => {
                  const meta = [event.category, event.location]
                    .filter(Boolean)
                    .join(" · ")
                  const memberLabel = (event.member_ids ?? [])
                    .map((id) => memberName(id))
                    .filter(Boolean)
                    .join(", ")

                  return (
                    <li
                      key={event.id}
                      className="bg-card flex flex-col gap-1 rounded-[var(--radius-card)] p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {event.title}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatTime(new Date(event.starts_at))}
                        </span>
                      </div>
                      {meta && (
                        <span className="text-muted-foreground text-xs">
                          {meta}
                        </span>
                      )}
                      {memberLabel && (
                        <span className="text-muted-foreground text-xs">
                          {memberLabel}
                        </span>
                      )}
                      {event.bring_items && (
                        <span className="text-muted-foreground text-xs">
                          Ta med: {event.bring_items}
                        </span>
                      )}
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
