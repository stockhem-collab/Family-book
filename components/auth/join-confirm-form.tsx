"use client"

import { useActionState } from "react"

import { joinFamilyByCode } from "@/app/(auth)/onboarding/actions"
import { Button } from "@/components/ui/button"

const initialState = { error: null as string | null }

export function JoinConfirmForm({ inviteCode }: { inviteCode: string }) {
  const [state, formAction, pending] = useActionState(
    joinFamilyByCode,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="inviteCode" value={inviteCode} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Går med…" : "Gå med i familjen"}
      </Button>
    </form>
  )
}
