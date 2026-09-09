"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { updateProfile } from "@/app/(main)/familj/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Tables } from "@/lib/supabase/types"

type Member = Pick<
  Tables<"profiles">,
  | "id"
  | "display_name"
  | "birth_date"
  | "clothing_size"
  | "shoe_size"
  | "favorite_food"
  | "dislikes"
  | "hobbies"
>

export function EditProfileForm({ member }: { member: Member }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await updateProfile({
        id: member.id,
        displayName: String(formData.get("displayName") ?? ""),
        birthDate: formData.get("birthDate")
          ? String(formData.get("birthDate"))
          : null,
        clothingSize: formData.get("clothingSize")
          ? String(formData.get("clothingSize"))
          : null,
        shoeSize: formData.get("shoeSize")
          ? String(formData.get("shoeSize"))
          : null,
        favoriteFood: formData.get("favoriteFood")
          ? String(formData.get("favoriteFood"))
          : null,
        dislikes: formData.get("dislikes")
          ? String(formData.get("dislikes"))
          : null,
        hobbies: formData.get("hobbies")
          ? String(formData.get("hobbies"))
          : null,
      })

      if (result.error) {
        setError(result.error)
        setSaved(false)
        return
      }
      setError(null)
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card flex flex-col gap-3 rounded-[var(--radius-card)] p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">Namn</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={member.display_name}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthDate">Födelsedatum</Label>
        <Input
          id="birthDate"
          name="birthDate"
          type="date"
          defaultValue={member.birth_date ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clothingSize">Klädstorlek</Label>
          <Input
            id="clothingSize"
            name="clothingSize"
            defaultValue={member.clothing_size ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shoeSize">Skostorlek</Label>
          <Input
            id="shoeSize"
            name="shoeSize"
            defaultValue={member.shoe_size ?? ""}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="favoriteFood">Favoritmat</Label>
        <Input
          id="favoriteFood"
          name="favoriteFood"
          defaultValue={member.favorite_food ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dislikes">Ogillar</Label>
        <Input
          id="dislikes"
          name="dislikes"
          defaultValue={member.dislikes ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="hobbies">Intressen</Label>
        <Input id="hobbies" name="hobbies" defaultValue={member.hobbies ?? ""} />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {saved && !error && (
        <p className="text-primary text-sm">Sparat!</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Sparar…" : "Spara"}
      </Button>
    </form>
  )
}
