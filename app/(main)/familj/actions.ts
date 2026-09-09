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
  if (input.id !== ctx.userId) {
    const { data: viewer } = await ctx.supabase
      .from("profiles")
      .select("role")
      .eq("id", ctx.userId)
      .single()
    if (viewer?.role !== "admin") {
      return { error: "Du har inte behörighet att ändra den här profilen." }
    }
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
