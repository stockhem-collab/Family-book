import { notFound, redirect } from "next/navigation"

import { ProfileTabs } from "@/components/family/profile-tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { calculateAge, daysUntilBirthday } from "@/lib/family/age"
import { getInitials } from "@/lib/family/initials"
import { formatShortDateTime } from "@/lib/date/format"
import { createClient } from "@/lib/supabase/server"

export default async function FamiljMemberPage({
  params,
}: {
  params: Promise<{ memberId: string }>
}) {
  const { memberId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: viewer } = await supabase
    .from("profiles")
    .select("family_id, role")
    .eq("id", user.id)
    .single()

  const familyId = viewer?.family_id
  if (!familyId) {
    redirect("/onboarding")
  }

  const { data: member } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, birth_date, clothing_size, shoe_size, favorite_food, dislikes, hobbies"
    )
    .eq("id", memberId)
    .eq("family_id", familyId)
    .maybeSingle()

  if (!member) {
    notFound()
  }

  const now = new Date()
  const birthDate = member.birth_date ? new Date(member.birth_date) : null

  const [{ data: nextEvent }, { data: wishlistLists }, { data: activityEvents }] =
    await Promise.all([
      supabase
        .from("calendar_events")
        .select("id, title, starts_at")
        .eq("family_id", familyId)
        .contains("member_ids", [memberId])
        .gte("starts_at", now.toISOString())
        .order("starts_at")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("lists")
        .select("id")
        .eq("family_id", familyId)
        .eq("type", "wishlist")
        .eq("owner_id", memberId),
      supabase
        .from("calendar_events")
        .select("id, title, starts_at, location")
        .eq("family_id", familyId)
        .contains("member_ids", [memberId])
        .gte("starts_at", now.toISOString())
        .order("starts_at")
        .limit(10),
    ])

  const wishlistListIds = (wishlistLists ?? []).map((list) => list.id)
  const { data: wishlistItems } = wishlistListIds.length
    ? await supabase
        .from("list_items")
        .select("id, label, price, priority, is_done")
        .in("list_id", wishlistListIds)
        .order("sort_order")
    : { data: [] }

  const canEdit = user.id === member.id || viewer?.role === "admin"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-8">
      <div className="flex items-center gap-4">
        <Avatar className="size-18">
          <AvatarImage src={member.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="text-xl">
            {getInitials(member.display_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h1 className="text-foreground text-xl font-semibold">
            {member.display_name}
          </h1>
          {birthDate && (
            <span className="text-muted-foreground text-sm">
              {calculateAge(birthDate, now)} år
            </span>
          )}
        </div>
      </div>

      <div className="bg-card flex flex-col gap-1 rounded-[var(--radius-card)] p-4 shadow-sm">
        <h2 className="text-foreground text-sm font-semibold">Kommande</h2>
        {nextEvent ? (
          <p className="text-muted-foreground text-sm">
            {nextEvent.title} –{" "}
            {formatShortDateTime(new Date(nextEvent.starts_at))}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Inget inplanerat just nu.
          </p>
        )}
        {birthDate &&
          (() => {
            const days = daysUntilBirthday(birthDate, now)
            return (
              <p className="text-muted-foreground text-sm">
                {days === 0
                  ? "Grattis på födelsedagen! 🎉"
                  : `${days} dagar kvar till födelsedagen`}
              </p>
            )
          })()}
      </div>

      <ProfileTabs
        member={member}
        activityEvents={activityEvents ?? []}
        wishlistItems={wishlistItems ?? []}
        canEdit={canEdit}
      />
    </div>
  )
}
