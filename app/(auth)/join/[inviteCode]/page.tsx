import { redirect } from "next/navigation"

import { JoinConfirmForm } from "@/components/auth/join-confirm-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function JoinPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>
}) {
  const { inviteCode } = await params
  const code = inviteCode.toUpperCase()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/join/${code}`)}`)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("user_id", user.id)
    .single()

  if (profile?.family_id) {
    redirect("/")
  }

  const { data: family } = await supabase
    .rpc("get_family_by_invite_code", { code })
    .maybeSingle()

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Gå med i familj</CardTitle>
        <CardDescription>
          {family
            ? `Du är inbjuden till "${family.name}".`
            : "Hittade ingen familj med den här koden."}
        </CardDescription>
      </CardHeader>
      {family && (
        <CardContent>
          <JoinConfirmForm inviteCode={code} />
        </CardContent>
      )}
    </Card>
  )
}
