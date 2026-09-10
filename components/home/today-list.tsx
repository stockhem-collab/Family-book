import Link from "next/link"
import { Calendar } from "lucide-react"

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
  moreItemsCount = 0,
}: {
  events: EventItem[]
  items: ListItem[]
  memberNames: Record<string, string>
  moreItemsCount?: number
}) {
  if (events.length === 0 && items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Inget inplanerat idag – bra jobbat! 🎉
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {events.length > 0 && (
        <ul className="flex flex-col gap-2">
          {events.map((event) => (
            <li
              key={event.id}
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
        </ul>
      )}

      {items.length > 0 && (
        <div className="bg-card rounded-[var(--radius-card)] shadow-sm">
          {items.map((item) => (
            <div
              key={item.id}
              className="border-border flex items-center gap-2 border-b px-3 py-2 last:border-b-0"
            >
              <span className="bg-muted-foreground/40 size-1.5 shrink-0 rounded-full" />
              <span className="text-foreground min-w-0 flex-1 truncate text-sm">
                {item.label}
              </span>
              {item.assigned_to && memberNames[item.assigned_to] && (
                <span className="text-muted-foreground shrink-0 text-xs">
                  {memberNames[item.assigned_to]}
                </span>
              )}
            </div>
          ))}
          <Link
            href="/listor"
            className="text-primary block px-3 py-2 text-xs font-medium"
          >
            {moreItemsCount > 0
              ? `+${moreItemsCount} till i listorna →`
              : "Visa listorna →"}
          </Link>
        </div>
      )}
    </div>
  )
}
