import Link from "next/link"
import { redirect } from "next/navigation"

import { InviteCard } from "@/components/family/invite-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { calculateAge } from "@/lib/family/age"
import { getInitials } from "@/lib/family/initials"
import { createClient } from "@/lib/supabase/server"

export default async function FamiljPage() {
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

  const [{ data: family }, { data: members }] = await Promise.all([
    supabase
      .from("families")
      .select("name, invite_code")
      .eq("id", familyId)
      .single(),
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, birth_date")
      .eq("family_id", familyId)
      .order("created_at"),
  ])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-8">
      <h1 className="text-foreground text-xl font-semibold">Familj</h1>

      <div className="grid grid-cols-2 gap-3">
        {(members ?? []).map((member) => (
          <Link
            key={member.id}
            href={`/familj/${member.id}`}
            className="bg-card flex flex-col items-center gap-2 rounded-[var(--radius-card)] p-4 shadow-sm"
          >
            <Avatar className="size-16">
              <AvatarImage src={member.avatar_url ?? undefined} alt="" />
              <AvatarFallback className="text-lg">
                {getInitials(member.display_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground text-sm font-medium">
              {member.display_name}
            </span>
            {member.birth_date && (
              <span className="text-muted-foreground text-xs">
                {calculateAge(new Date(member.birth_date))} år
              </span>
            )}
          </Link>
        ))}
      </div>

      {family && (
        <InviteCard familyName={family.name} inviteCode={family.invite_code} />
      )}
    </div>
  )
}
