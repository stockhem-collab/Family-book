"use server"

import { requireFamily } from "@/lib/supabase/auth-context"

type ActionResult = { error?: string }

export async function createEvent(input: {
  title: string
  startsAt: string
  endsAt: string | null
  location: string | null
  category: string | null
  memberIds: string[]
  bringItems: string | null
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase.from("calendar_events").insert({
    family_id: ctx.familyId,
    title: input.title,
    starts_at: new Date(input.startsAt).toISOString(),
    ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null,
    location: input.location,
    category: input.category,
    member_ids: input.memberIds,
    bring_items: input.bringItems,
    created_by: ctx.profileId,
  })

  return error ? { error: error.message } : {}
}

export async function updateEvent(input: {
  id: string
  title: string
  startsAt: string
  endsAt: string | null
  location: string | null
  category: string | null
  memberIds: string[]
  bringItems: string | null
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase
    .from("calendar_events")
    .update({
      title: input.title,
      starts_at: new Date(input.startsAt).toISOString(),
      ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null,
      location: input.location,
      category: input.category,
      member_ids: input.memberIds,
      bring_items: input.bringItems,
    })
    .eq("id", input.id)
    .eq("family_id", ctx.familyId)

  return error ? { error: error.message } : {}
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("family_id", ctx.familyId)

  return error ? { error: error.message } : {}
}
