"use server"

import { redirect } from "next/navigation"

import { generateInviteCode } from "@/lib/family/invite-code"
import { createClient } from "@/lib/supabase/server"

type ActionState = { error: string | null }

const UNIQUE_VIOLATION = "23505"

export async function createFamily(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim()
  if (!name) {
    return { error: "Ange ett namn för familjen." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Inbjudningskoden måste vara unik – försök några gånger med en ny kod
  // om vi råkar krocka med en befintlig.
  for (let attempt = 0; attempt < 5; attempt++) {
    const inviteCode = generateInviteCode()
    const { error } = await supabase.rpc("create_family", {
      family_name: name,
      invite_code: inviteCode,
    })

    if (error) {
      if (error.code === UNIQUE_VIOLATION) continue
      return { error: error.message }
    }

    redirect("/")
  }

  return { error: "Kunde inte skapa familjen just nu, försök igen." }
}

export async function joinFamilyByCode(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const inviteCode = String(formData.get("inviteCode") ?? "")
    .trim()
    .toUpperCase()
  if (!inviteCode) {
    return { error: "Ange en inbjudningskod." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: family, error: lookupError } = await supabase
    .rpc("get_family_by_invite_code", { code: inviteCode })
    .maybeSingle()

  if (lookupError) {
    return { error: lookupError.message }
  }
  if (!family) {
    return { error: "Hittade ingen familj med den koden." }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ family_id: family.id, role: "member" })
    .eq("id", user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  redirect("/")
}
