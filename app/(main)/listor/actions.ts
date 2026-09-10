"use server"

import type { ListType } from "@/lib/lists/types"
import { requireFamily } from "@/lib/supabase/auth-context"

type ActionResult = { error?: string }

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
    owner_id: ctx.profileId,
  })

  return error ? { error: error.message } : {}
}
