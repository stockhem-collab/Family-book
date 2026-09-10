"use client"

import { useState } from "react"
import { PawPrint, Plus } from "lucide-react"

import { PetDialog } from "@/components/family/pet-dialog"
import { calculateAge } from "@/lib/family/age"
import type { Tables } from "@/lib/supabase/types"

type Pet = Tables<"pets">

export function PetsSection({ pets }: { pets: Pet[] }) {
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold">Husdjur</h2>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="text-primary flex items-center gap-1 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          Lägg till
        </button>
      </div>

      {pets.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Inga husdjur tillagda än.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {pets.map((pet) => (
            <button
              key={pet.id}
              type="button"
              onClick={() => setEditingPet(pet)}
              className="bg-card hover:bg-muted flex flex-col items-center gap-2 rounded-[var(--radius-card)] p-4 text-center shadow-sm transition-colors"
            >
              <span className="bg-accent-green text-accent-green-foreground flex size-16 items-center justify-center rounded-full">
                <PawPrint className="size-7" />
              </span>
              <span className="text-foreground text-sm font-medium">
                {pet.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {[
                  pet.species,
                  pet.breed,
                  pet.birth_date
                    ? `${calculateAge(new Date(pet.birth_date))} år`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </span>
            </button>
          ))}
        </div>
      )}

      <PetDialog open={addOpen} onOpenChange={setAddOpen} />
      {editingPet && (
        <PetDialog
          pet={editingPet}
          open={editingPet !== null}
          onOpenChange={(open) => !open && setEditingPet(null)}
        />
      )}
    </div>
  )
}
