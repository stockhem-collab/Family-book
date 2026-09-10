"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { claimPlaceholderProfile } from "@/app/(main)/familj/actions"
import { Button } from "@/components/ui/button"
import type { Tables } from "@/lib/supabase/types"

type Account = Pick<Tables<"profiles">, "id" | "display_name">

export function ClaimProfileForm({
  placeholderId,
  accounts,
}: {
  placeholderId: string
  accounts: Account[]
}) {
  const router = useRouter()
  const [selected, setSelected] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return

    startTransition(async () => {
      const result = await claimPlaceholderProfile({
        keepProfileId: placeholderId,
        duplicateProfileId: selected,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setError(null)
      router.refresh()
    })
  }

  if (accounts.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Ingen annan familjemedlem med eget konto att koppla ihop med ännu.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <select
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
        className="border-input bg-card text-foreground h-10 rounded-md border px-3 text-sm"
      >
        <option value="">Välj konto…</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.display_name}
          </option>
        ))}
      </select>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" size="sm" disabled={pending || !selected}>
        {pending ? "Kopplar ihop…" : "Koppla ihop profilerna"}
      </Button>
    </form>
  )
}
