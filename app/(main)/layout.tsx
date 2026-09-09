import { redirect } from "next/navigation"

import { BottomNav } from "@/components/main/bottom-nav"
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
