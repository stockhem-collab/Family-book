import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  if (!profile?.family_id) {
    redirect("/onboarding")
  }

  // TODO (steg 4): bottennavigation Hem/Planering/Listor/Familj/Assistent.
  return <div className="flex min-h-screen flex-col">{children}</div>
}
