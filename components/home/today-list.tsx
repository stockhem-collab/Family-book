import { Calendar, ListChecks } from "lucide-react"

import { formatTime } from "@/lib/date/format"
import type { Tables } from "@/lib/supabase/types"

type EventItem = Pick<
  Tables<"calendar_events">,
  "id" | "title" | "starts_at" | "location"
>
type ListItem = Pick<Tables<"list_items">, "id" | "label" | "assigned_to">

export function TodayList({
  events,
  items,
  memberNames,
}: {
  events: EventItem[]
  items: ListItem[]
  memberNames: Record<string, string>
}) {
  if (events.length === 0 && items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Inget inplanerat idag – bra jobbat! 🎉
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {events.map((event) => (
        <li
          key={`event-${event.id}`}
          className="bg-card flex items-center gap-3 rounded-[var(--radius-card)] p-3 shadow-sm"
        >
          <span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
            <Calendar className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-foreground truncate text-sm font-medium">
              {event.title}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatTime(new Date(event.starts_at))}
              {event.location ? ` · ${event.location}` : ""}
            </span>
          </div>
        </li>
      ))}

      {items.map((item) => (
        <li
          key={`item-${item.id}`}
          className="bg-card flex items-center gap-3 rounded-[var(--radius-card)] p-3 shadow-sm"
        >
          <span className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
            <ListChecks className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="text-foreground truncate text-sm font-medium">
              {item.label}
            </span>
            {item.assigned_to && memberNames[item.assigned_to] && (
              <span className="text-muted-foreground text-xs">
                {memberNames[item.assigned_to]}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
