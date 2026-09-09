"use server"

import { LIST_TYPE_LABELS, type ListType } from "@/lib/lists/types"
import { requireFamily } from "@/lib/supabase/auth-context"

type ActionResult = { error?: string }

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
    created_by: ctx.userId,
  })

  return error ? { error: error.message } : {}
}

export async function quickAddListItem(input: {
  type: ListType
  label: string
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  let { data: list } = await ctx.supabase
    .from("lists")
    .select("id")
    .eq("family_id", ctx.familyId)
    .eq("type", input.type)
    .limit(1)
    .maybeSingle()

  if (!list) {
    const { data: newList, error: listError } = await ctx.supabase
      .from("lists")
      .insert({
        family_id: ctx.familyId,
        type: input.type,
        title: LIST_TYPE_LABELS[input.type],
        owner_id: ctx.userId,
      })
      .select("id")
      .single()

    if (listError) return { error: listError.message }
    list = newList
  }

  const { error } = await ctx.supabase.from("list_items").insert({
    list_id: list.id,
    family_id: ctx.familyId,
    label: input.label,
  })

  return error ? { error: error.message } : {}
}

export async function quickAddPost(input: {
  text: string
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase.from("feed_posts").insert({
    family_id: ctx.familyId,
    author_id: ctx.userId,
    text_content: input.text,
  })

  return error ? { error: error.message } : {}
}
