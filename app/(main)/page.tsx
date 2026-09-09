import { redirect } from "next/navigation"

import { signOut } from "@/app/(main)/actions"
import { AvatarRow } from "@/components/home/avatar-row"
import { Feed } from "@/components/home/feed"
import { QuickAddFab } from "@/components/home/quick-add-fab"
import { TodayList } from "@/components/home/today-list"
import { Button } from "@/components/ui/button"
import {
  endOfToday,
  formatHeaderDate,
  getGreeting,
  startOfToday,
} from "@/lib/date/format"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, family_id")
    .eq("id", user.id)
    .single()

  const familyId = profile?.family_id
  if (!familyId) {
    redirect("/onboarding")
  }

  const now = new Date()
  const todayStart = startOfToday(now).toISOString()
  const todayEnd = endOfToday(now).toISOString()

  const [
    { data: family },
    { data: members },
    { data: events },
    { data: items },
    { data: posts },
  ] = await Promise.all([
    supabase.from("families").select("name").eq("id", familyId).single(),
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("family_id", familyId)
      .order("created_at"),
    supabase
      .from("calendar_events")
      .select("id, title, starts_at, location")
      .eq("family_id", familyId)
      .gte("starts_at", todayStart)
      .lte("starts_at", todayEnd)
      .order("starts_at"),
    supabase
      .from("list_items")
      .select("id, label, assigned_to")
      .eq("family_id", familyId)
      .eq("is_done", false)
      .order("sort_order")
      .limit(20),
    supabase
      .from("feed_posts")
      .select("id, text_content, image_url, created_at, author_id")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  const memberNames = Object.fromEntries(
    (members ?? []).map((member) => [member.id, member.display_name])
  )
  const openItemsCount = items?.length ?? 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pb-8">
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-foreground text-xl font-semibold">
              {getGreeting(now)}, {profile?.display_name ?? user.email}!
            </h1>
            <p className="text-muted-foreground text-sm">
              {formatHeaderDate(now)}
              {family?.name ? ` · ${family.name}` : ""}
            </p>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Logga ut
            </Button>
          </form>
        </div>

        <AvatarRow members={members ?? []} />
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-sm font-semibold">Idag</h2>
          <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
            {openItemsCount} kvar
          </span>
        </div>
        <TodayList
          events={events ?? []}
          items={items ?? []}
          memberNames={memberNames}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">Flöde</h2>
        <Feed posts={posts ?? []} memberNames={memberNames} />
      </section>

      <QuickAddFab />
    </div>
  )
}
