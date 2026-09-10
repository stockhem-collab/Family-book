"use server"

import { requireFamily } from "@/lib/supabase/auth-context"

type ActionResult = { error?: string }

export async function updateProfile(input: {
  id: string
  displayName: string
  birthDate: string | null
  clothingSize: string | null
  shoeSize: string | null
  favoriteFood: string | null
  dislikes: string | null
  hobbies: string | null
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  // Matchar RLS-policyn (egen rad, eller admin i samma familj) med ett
  // tydligt felmeddelande istället för en tyst no-op om något ändå kommer
  // fram hit utan behörighet.
  if (input.id !== ctx.profileId && ctx.role !== "admin") {
    return { error: "Du har inte behörighet att ändra den här profilen." }
  }

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      display_name: input.displayName,
      birth_date: input.birthDate,
      clothing_size: input.clothingSize,
      shoe_size: input.shoeSize,
      favorite_food: input.favoriteFood,
      dislikes: input.dislikes,
      hobbies: input.hobbies,
    })
    .eq("id", input.id)

  return error ? { error: error.message } : {}
}

export async function createFamilyMember(input: {
  displayName: string
  birthDate: string | null
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  if (ctx.role !== "admin") {
    return {
      error: "Bara en admin kan lägga till familjemedlemmar.",
    }
  }

  // Ingen user_id sätts – det här är en platshållarprofil (t.ex. ett barn)
  // utan eget inloggningskonto. Den kan senare kopplas till ett riktigt
  // konto om personen vill logga in själv.
  const { error } = await ctx.supabase.from("profiles").insert({
    family_id: ctx.familyId,
    display_name: input.displayName,
    birth_date: input.birthDate,
    role: "child",
  })

  return error ? { error: error.message } : {}
}
