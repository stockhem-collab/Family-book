import { redirect } from "next/navigation"

import { CreateFamilyForm } from "@/components/auth/create-family-form"
import { JoinFamilyForm } from "@/components/auth/join-family-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function OnboardingPage() {
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
    .eq("user_id", user.id)
    .single()

  if (profile?.family_id) {
    redirect("/")
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Skapa en ny familj</CardTitle>
          <CardDescription>Du blir automatiskt admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateFamilyForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gå med i en familj</CardTitle>
          <CardDescription>Har du fått en inbjudningskod?</CardDescription>
        </CardHeader>
        <CardContent>
          <JoinFamilyForm />
        </CardContent>
      </Card>
    </div>
  )
}
