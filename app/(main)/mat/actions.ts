"use server"

import { requireFamily } from "@/lib/supabase/auth-context"

type ActionResult = { error?: string }

export async function saveMealPlan(input: {
  date: string
  mealTitle: string
  recipeUrl: string | null
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  // Atomisk upsert (kräver den unika regeln på family_id+date) istället för
  // "kolla om raden finns, annars infoga" – det gamla mönstret kunde skapa
  // dubbletter om två sparningar för samma dag råkade köra samtidigt.
  const { error } = await ctx.supabase.from("meal_plans").upsert(
    {
      family_id: ctx.familyId,
      date: input.date,
      meal_title: input.mealTitle,
      recipe_url: input.recipeUrl,
    },
    { onConflict: "family_id,date" }
  )

  return error ? { error: error.message } : {}
}

export async function deleteMealPlan(id: string): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase
    .from("meal_plans")
    .delete()
    .eq("id", id)
    .eq("family_id", ctx.familyId)

  return error ? { error: error.message } : {}
}
