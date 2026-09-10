import Link from "next/link"
import { redirect } from "next/navigation"

import { AddEventDialog } from "@/components/planning/add-event-dialog"
import { DayAgenda } from "@/components/planning/day-agenda"
import { WeekSelector } from "@/components/shared/week-selector"
import { addDays, getWeekStart, parseDateKey } from "@/lib/date/week"
import { createClient } from "@/lib/supabase/server"

export default async function PlaneringPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string }>
}) {
  const { week, day } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("user_id", user.id)
    .single()

  const familyId = profile?.family_id
  if (!familyId) {
    redirect("/onboarding")
  }

  const now = new Date()
  const weekStart = (week && parseDateKey(week)) || getWeekStart(now)
  const selectedDay = day ? parseDateKey(day) : null

  // Om en dag är vald visar vi bara den + dagen efter (kan sträcka sig in i
  // nästa vecka), annars hela veckan – hämta bara det datumintervall som
  // faktiskt visas.
  const rangeStart = selectedDay ?? weekStart
  const rangeEnd = selectedDay ? addDays(selectedDay, 2) : addDays(weekStart, 7)

  const [{ data: events }, { data: members }] = await Promise.all([
    supabase
      .from("calendar_events")
      .select(
        "id, title, category, location, starts_at, ends_at, member_ids, bring_items"
      )
      .eq("family_id", familyId)
      .gte("starts_at", rangeStart.toISOString())
      .lt("starts_at", rangeEnd.toISOString())
      .order("starts_at"),
    supabase
      .from("profiles")
      .select("id, display_name")
      .eq("family_id", familyId)
      .order("created_at"),
  ])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-foreground text-xl font-semibold">Planering</h1>
          <Link
            href="/mat"
            className="text-primary text-xs underline-offset-4 hover:underline"
          >
            Matplanering →
          </Link>
        </div>
        <AddEventDialog members={members ?? []} />
      </div>

      <WeekSelector
        weekStart={weekStart}
        today={now}
        basePath="/planering"
        selectedDay={day}
      />
      <DayAgenda
        weekStart={weekStart}
        events={events ?? []}
        members={members ?? []}
        selectedDay={selectedDay}
      />
    </div>
  )
}
