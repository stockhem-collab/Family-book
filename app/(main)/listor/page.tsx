import { redirect } from "next/navigation"

import { ListsTabs } from "@/components/lists/lists-tabs"
import { createClient } from "@/lib/supabase/server"

export default async function ListorPage() {
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

  const [{ data: lists }, { data: items }, { data: members }] =
    await Promise.all([
      supabase
        .from("lists")
        .select("id, type, title, owner_id, created_at")
        .eq("family_id", familyId)
        .order("created_at"),
      supabase
        .from("list_items")
        .select(
          "id, list_id, label, is_done, assigned_to, price, priority, sort_order, created_at"
        )
        .eq("family_id", familyId)
        .order("sort_order")
        .order("created_at"),
      supabase
        .from("profiles")
        .select("id, display_name")
        .eq("family_id", familyId)
        .order("created_at"),
    ])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-8">
      <h1 className="text-foreground text-xl font-semibold">Listor</h1>
      <ListsTabs
        lists={lists ?? []}
        items={items ?? []}
        members={members ?? []}
      />
    </div>
  )
}
