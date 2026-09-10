"use server"

import { LIST_TYPE_LABELS, type ListType } from "@/lib/lists/types"
import { requireFamily, type FamilyContext } from "@/lib/supabase/auth-context"

type ActionResult = { error?: string }

async function getOrCreateList(ctx: FamilyContext, type: ListType) {
  const { data: existing } = await ctx.supabase
    .from("lists")
    .select("id")
    .eq("family_id", ctx.familyId)
    .eq("type", type)
    .limit(1)
    .maybeSingle()

  if (existing) return { list: existing }

  const { data: newList, error } = await ctx.supabase
    .from("lists")
    .insert({
      family_id: ctx.familyId,
      type,
      title: LIST_TYPE_LABELS[type],
      owner_id: ctx.profileId,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  return { list: newList }
}

export async function quickAddEvent(input: {
  title: string
  startsAt: string
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase.from("calendar_events").insert({
    family_id: ctx.familyId,
    title: input.title,
    starts_at: new Date(input.startsAt).toISOString(),
    created_by: ctx.profileId,
  })

  return error ? { error: error.message } : {}
}

export async function quickAddListItem(input: {
  type: ListType
  label: string
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { list, error: listError } = await getOrCreateList(ctx, input.type)
  if (listError || !list) return { error: listError ?? "Kunde inte skapa listan." }

  const { error } = await ctx.supabase.from("list_items").insert({
    list_id: list.id,
    family_id: ctx.familyId,
    label: input.label,
  })

  return error ? { error: error.message } : {}
}

/** Lägger till flera varor på en gång – används av assistentens förslagskort. */
export async function quickAddListItems(input: {
  type: ListType
  labels: string[]
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const labels = input.labels.map((label) => label.trim()).filter(Boolean)
  if (labels.length === 0) return {}

  const { list, error: listError } = await getOrCreateList(ctx, input.type)
  if (listError || !list) return { error: listError ?? "Kunde inte skapa listan." }

  const { error } = await ctx.supabase.from("list_items").insert(
    labels.map((label) => ({
      list_id: list.id,
      family_id: ctx.familyId,
      label,
    }))
  )

  return error ? { error: error.message } : {}
}

/** Lägger till flera matplaneringsrader på en gång – från assistentens förslagskort. */
export async function quickAddMealPlanEntries(input: {
  entries: { date: string; mealTitle: string }[]
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const rows = input.entries
    .filter((entry) => entry.date.trim() !== "" && entry.mealTitle.trim() !== "")
    .map((entry) => ({
      family_id: ctx.familyId,
      date: entry.date,
      meal_title: entry.mealTitle.trim(),
    }))

  if (rows.length === 0) return {}

  const { error } = await ctx.supabase.from("meal_plans").insert(rows)

  return error ? { error: error.message } : {}
}

export async function quickAddPost(input: {
  text: string
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase.from("feed_posts").insert({
    family_id: ctx.familyId,
    author_id: ctx.profileId,
    text_content: input.text,
  })

  return error ? { error: error.message } : {}
}
