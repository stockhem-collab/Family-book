import { createClient } from "@/lib/supabase/server"

/**
 * Delad hjälpare för server actions: hämtar inloggad användare + dess
 * family_id, eller en felsträng om något saknas. Används av alla actions
 * som skriver familjedata (calendar_events, lists, feed_posts, m.fl.).
 */
export async function requireFamily() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Du är inte inloggad." as const }

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", user.id)
    .single()
  if (!profile?.family_id) return { error: "Ingen familj hittades." as const }

  return { supabase, userId: user.id, familyId: profile.family_id }
}
