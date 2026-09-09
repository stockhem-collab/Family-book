"use server"

import type { ListType } from "@/lib/lists/types"
import { createClient } from "@/lib/supabase/server"

type ActionResult = { error?: string }

async function requireFamily() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Du är inte inloggad." as const }

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", user.id)
    .single()
  if (!profile?.family_id) return { error: "Ingen familj hittades." as const }

  return { supabase, userId: user.id, familyId: profile.family_id }
}

export async function toggleListItem(input: {
  id: string
  isDone: boolean
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase
    .from("list_items")
    .update({ is_done: input.isDone })
    .eq("id", input.id)

  return error ? { error: error.message } : {}
}

export async function addListItem(input: {
  listId: string
  label: string
  assignedTo: string | null
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase.from("list_items").insert({
    list_id: input.listId,
    family_id: ctx.familyId,
    label: input.label,
    assigned_to: input.assignedTo,
  })

  return error ? { error: error.message } : {}
}

export async function deleteListItem(id: string): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase
    .from("list_items")
    .delete()
    .eq("id", id)

  return error ? { error: error.message } : {}
}

export async function createList(input: {
  type: ListType
  title: string
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase.from("lists").insert({
    family_id: ctx.familyId,
    type: input.type,
    title: input.title,
    owner_id: ctx.userId,
  })

  return error ? { error: error.message } : {}
}
