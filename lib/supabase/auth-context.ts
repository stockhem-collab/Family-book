import { createClient } from "@/lib/supabase/server"

/**
 * Delad hjälpare för server actions: hämtar inloggad användare + dess
 * profil-id/family_id/roll, eller en felsträng om något saknas. Används av
 * alla actions som skriver familjedata (calendar_events, lists, feed_posts,
 * m.fl.).
 *
 * OBS: `profileId` (profiles.id) är INTE samma sak som `userId`
 * (auth.users.id) – en familjemedlem kan ha en profil utan eget konto
 * (t.ex. barn som en admin lagt till). Kolumner som pekar på en person
 * (created_by, owner_id, author_id, assigned_to …) ska alltid använda
 * `profileId`, aldrig `userId`.
 */
export type FamilyContext = Exclude<
  Awaited<ReturnType<typeof requireFamily>>,
  { error: string }
>

export async function requireFamily() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Du är inte inloggad." as const }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, family_id, role")
    .eq("user_id", user.id)
    .single()
  if (!profile?.family_id) return { error: "Ingen familj hittades." as const }

  return {
    supabase,
    userId: user.id,
    profileId: profile.id,
    role: profile.role,
    familyId: profile.family_id,
  }
}
