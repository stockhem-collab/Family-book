import { redirect } from "next/navigation"

import { AssistantChat } from "@/components/assistant/assistant-chat"
import { createClient } from "@/lib/supabase/server"

export default async function AssistentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, family_id")
    .eq("user_id", user.id)
    .single()

  const familyId = profile?.family_id
  if (!familyId) {
    redirect("/onboarding")
  }

  const { data: history } = await supabase
    .from("assistant_messages")
    .select("id, role, content")
    .eq("family_id", familyId)
    .eq("user_id", profile.id)
    .order("created_at")
    .limit(50)

  return (
    <div className="flex flex-1 flex-col p-4 pb-8">
      <h1 className="text-foreground mb-4 text-xl font-semibold">
        Assistent
      </h1>
      <AssistantChat initialMessages={history ?? []} />
    </div>
  )
}
