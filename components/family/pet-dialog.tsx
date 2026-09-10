"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { createPet, deletePet, updatePet } from "@/app/(main)/familj/pets-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Tables } from "@/lib/supabase/types"

type Pet = Tables<"pets">

export function PetDialog({
  pet,
  open,
  onOpenChange,
}: {
  /** Utelämnad = "lägg till nytt husdjur"-läge. */
  pet?: Pet
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const input = {
      name: String(formData.get("name") ?? "").trim(),
      species: formData.get("species") ? String(formData.get("species")) : null,
      breed: formData.get("breed") ? String(formData.get("breed")) : null,
      birthDate: formData.get("birthDate")
        ? String(formData.get("birthDate"))
        : null,
      chipNumber: formData.get("chipNumber")
        ? String(formData.get("chipNumber"))
        : null,
      insuranceProvider: formData.get("insuranceProvider")
        ? String(formData.get("insuranceProvider"))
        : null,
      insurancePolicyNumber: formData.get("insurancePolicyNumber")
        ? String(formData.get("insurancePolicyNumber"))
        : null,
      weightKg: formData.get("weightKg") ? Number(formData.get("weightKg")) : null,
      currentMedication: formData.get("currentMedication")
        ? String(formData.get("currentMedication"))
        : null,
    }
    if (!input.name) return

    startTransition(async () => {
      const result = pet
        ? await updatePet({ id: pet.id, ...input })
        : await createPet(input)

      if (result.error) {
        setError(result.error)
        return
      }
      setError(null)
      onOpenChange(false)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!pet) return
    startTransition(async () => {
      const result = await deletePet(pet.id)
      if (result.error) {
        setError(result.error)
        return
      }
      setError(null)
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setConfirmDelete(false)
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{pet ? "Ändra husdjur" : "Lägg till husdjur"}</DialogTitle>
            <DialogDescription>
              Syns för hela familjen, och assistenten kan använda uppgifterna.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pet-name">Namn</Label>
            <Input
              id="pet-name"
              name="name"
              defaultValue={pet?.name ?? ""}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pet-species">Djurslag</Label>
              <Input
                id="pet-species"
                name="species"
                defaultValue={pet?.species ?? ""}
                placeholder="T.ex. Hund"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pet-breed">Ras</Label>
              <Input
                id="pet-breed"
                name="breed"
                defaultValue={pet?.breed ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pet-birth-date">Född</Label>
              <Input
                id="pet-birth-date"
                name="birthDate"
                type="date"
                defaultValue={pet?.birth_date ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pet-weight">Vikt (kg)</Label>
              <Input
                id="pet-weight"
                name="weightKg"
                type="number"
                min="0"
                step="0.1"
                defaultValue={pet?.weight_kg ?? ""}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pet-medication">Aktuell medicinering</Label>
            <Input
              id="pet-medication"
              name="currentMedication"
              defaultValue={pet?.current_medication ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pet-chip">Chipnummer</Label>
              <Input
                id="pet-chip"
                name="chipNumber"
                defaultValue={pet?.chip_number ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pet-insurance-provider">Försäkringsbolag</Label>
              <Input
                id="pet-insurance-provider"
                name="insuranceProvider"
                defaultValue={pet?.insurance_provider ?? ""}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pet-insurance-policy">Försäkringsnummer</Label>
            <Input
              id="pet-insurance-policy"
              name="insurancePolicyNumber"
              defaultValue={pet?.insurance_policy_number ?? ""}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter className="sm:justify-between">
            {pet &&
              (confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Säker?</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                    onClick={handleDelete}
                  >
                    Ja, ta bort
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Avbryt
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmDelete(true)}
                >
                  Ta bort husdjur
                </Button>
              ))}
            <Button type="submit" disabled={pending} className="ml-auto">
              {pending ? "Sparar…" : "Spara"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
