import { redirect } from "next/navigation"

import { signOut } from "@/app/(main)/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

  const { data: family } = profile?.family_id
    ? await supabase
        .from("families")
        .select("name")
        .eq("id", profile.family_id)
        .single()
    : { data: null }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Hej, {profile?.display_name ?? user.email}!
          </CardTitle>
          {family?.name && (
            <CardDescription>Familj: {family.name}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Inloggning och familjeflöde är klart. Nästa steg: bottennavigation
            och Hem-vyns riktiga innehåll.
          </p>
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Logga ut
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
