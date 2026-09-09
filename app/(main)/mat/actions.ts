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

  const { data: existing } = await ctx.supabase
    .from("meal_plans")
    .select("id")
    .eq("family_id", ctx.familyId)
    .eq("date", input.date)
    .maybeSingle()

  if (existing) {
    const { error } = await ctx.supabase
      .from("meal_plans")
      .update({ meal_title: input.mealTitle, recipe_url: input.recipeUrl })
      .eq("id", existing.id)
    return error ? { error: error.message } : {}
  }

  const { error } = await ctx.supabase.from("meal_plans").insert({
    family_id: ctx.familyId,
    date: input.date,
    meal_title: input.mealTitle,
    recipe_url: input.recipeUrl,
  })

  return error ? { error: error.message } : {}
}

export async function deleteMealPlan(id: string): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase
    .from("meal_plans")
    .delete()
    .eq("id", id)

  return error ? { error: error.message } : {}
}
