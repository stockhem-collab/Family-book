"use server"

import { requireFamily } from "@/lib/supabase/auth-context"

type ActionResult = { error?: string }

type PetInput = {
  name: string
  species: string | null
  breed: string | null
  birthDate: string | null
  chipNumber: string | null
  insuranceProvider: string | null
  insurancePolicyNumber: string | null
  weightKg: number | null
  currentMedication: string | null
}

export async function createPet(input: PetInput): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase.from("pets").insert({
    family_id: ctx.familyId,
    name: input.name,
    species: input.species,
    breed: input.breed,
    birth_date: input.birthDate,
    chip_number: input.chipNumber,
    insurance_provider: input.insuranceProvider,
    insurance_policy_number: input.insurancePolicyNumber,
    weight_kg: input.weightKg,
    current_medication: input.currentMedication,
  })

  return error ? { error: error.message } : {}
}

export async function updatePet(
  input: PetInput & { id: string }
): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase
    .from("pets")
    .update({
      name: input.name,
      species: input.species,
      breed: input.breed,
      birth_date: input.birthDate,
      chip_number: input.chipNumber,
      insurance_provider: input.insuranceProvider,
      insurance_policy_number: input.insurancePolicyNumber,
      weight_kg: input.weightKg,
      current_medication: input.currentMedication,
    })
    .eq("id", input.id)
    .eq("family_id", ctx.familyId)

  return error ? { error: error.message } : {}
}

export async function deletePet(id: string): Promise<ActionResult> {
  const ctx = await requireFamily()
  if ("error" in ctx) return ctx

  const { error } = await ctx.supabase
    .from("pets")
    .delete()
    .eq("id", id)
    .eq("family_id", ctx.familyId)

  return error ? { error: error.message } : {}
}
