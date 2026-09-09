"use client"

import { useActionState } from "react"

import { createFamily } from "@/app/(auth)/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState = { error: null as string | null }

export function CreateFamilyForm() {
  const [state, formAction, pending] = useActionState(
    createFamily,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="family-name">Familjens namn</Label>
        <Input
          id="family-name"
          name="name"
          placeholder="Familjen Andersson"
          required
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Skapar…" : "Skapa familj"}
      </Button>
    </form>
  )
}
