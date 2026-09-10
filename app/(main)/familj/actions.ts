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

/**
 * Slår ihop en platshållarprofil (t.ex. ett barn utan konto) med en profil
 * som redan har ett riktigt konto kopplat – när personen väl loggat in
 * skapade signup-triggern nämligen en helt ny, tom profil istället för att
 * återanvända platshållaren. Historik (händelser, listposter, inlägg …)
 * flyttas över, och duplicate-profilen tas bort. Se migrationen
 * merge_profile_into för säkerhetskontrollerna (admin, samma familj).
 */
/**
 * Tar bort en familjemedlem helt (t.ex. tillagd av misstag, eller någon som
 * lämnat familjen). Se migrationen delete_family_member för säkerhets-
 * kontrollerna (admin, samma familj, inte sig själv) och hur andra tabellers
 * kopplingar till personen nollställs innan raden tas bort.
 */
export async function deleteFamilyMember(profileId: string): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  if (ctx.role !== "admin") {
    return { error: "Bara en admin kan ta bort en familjemedlem." }
  }

  const { error } = await ctx.supabase.rpc("delete_family_member", {
    target_profile_id: profileId,
  })

  return error ? { error: error.message } : {}
}

export async function claimPlaceholderProfile(input: {
  keepProfileId: string
  duplicateProfileId: string
}): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  if (ctx.role !== "admin") {
    return { error: "Bara en admin kan koppla ihop profiler." }
  }

  const { error } = await ctx.supabase.rpc("merge_profile_into", {
    keep_profile_id: input.keepProfileId,
    duplicate_profile_id: input.duplicateProfileId,
  })

  return error ? { error: error.message } : {}
}
