"use client"

import { useState } from "react"

import { EditEventDialog } from "@/components/planning/edit-event-dialog"
import { formatTime } from "@/lib/date/format"
import type { Tables } from "@/lib/supabase/types"

type Member = Pick<Tables<"profiles">, "id" | "display_name">
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

export function EventCard({
  event,
  members,
  memberLabel,
}: {
  event: EventRow
  members: Member[]
  memberLabel: string
}) {
  const [open, setOpen] = useState(false)
  const meta = [event.category, event.location].filter(Boolean).join(" · ")

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-card hover:bg-muted flex w-full flex-col gap-1 rounded-[var(--radius-card)] p-3 text-left shadow-sm transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground text-sm font-medium">
            {event.title}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatTime(new Date(event.starts_at))}
          </span>
        </div>
        {meta && <span className="text-muted-foreground text-xs">{meta}</span>}
        {memberLabel && (
          <span className="text-muted-foreground text-xs">{memberLabel}</span>
        )}
        {event.bring_items && (
          <span className="text-muted-foreground text-xs">
            Ta med: {event.bring_items}
          </span>
        )}
      </button>

      <EditEventDialog
        event={event}
        members={members}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
