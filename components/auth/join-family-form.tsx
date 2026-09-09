"use client"

import { useActionState } from "react"

import { joinFamilyByCode } from "@/app/(auth)/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState = { error: null as string | null }

export function JoinFamilyForm() {
  const [state, formAction, pending] = useActionState(
    joinFamilyByCode,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-code">Inbjudningskod</Label>
        <Input
          id="invite-code"
          name="inviteCode"
          placeholder="T.ex. AB12CD"
          className="uppercase"
          required
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Går med…" : "Gå med"}
      </Button>
    </form>
  )
}
