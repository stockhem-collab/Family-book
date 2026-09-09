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
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
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
    .eq("id", user.id)
    .single()

  const familyId = profile?.family_id
  if (!familyId) {
    redirect("/onboarding")
  }

  const now = new Date()
  const weekStart = (week && parseDateKey(week)) || getWeekStart(now)
  const weekEnd = addDays(weekStart, 7)

  const [{ data: events }, { data: members }] = await Promise.all([
    supabase
      .from("calendar_events")
      .select(
        "id, title, category, location, starts_at, member_ids, bring_items"
      )
      .eq("family_id", familyId)
      .gte("starts_at", weekStart.toISOString())
      .lt("starts_at", weekEnd.toISOString())
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

      <WeekSelector weekStart={weekStart} today={now} basePath="/planering" />
      <DayAgenda
        weekStart={weekStart}
        events={events ?? []}
        members={members ?? []}
      />
    </div>
  )
}
