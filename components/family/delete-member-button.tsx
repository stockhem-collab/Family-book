"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { deleteFamilyMember } from "@/app/(main)/familj/actions"
import { Button } from "@/components/ui/button"

export function DeleteMemberButton({
  profileId,
  displayName,
}: {
  profileId: string
  displayName: string
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFamilyMember(profileId)
      if (result.error) {
        setError(result.error)
        return
      }
      router.push("/familj")
      router.refresh()
    })
  }

  return (
    <div className="bg-card flex flex-col gap-2 rounded-[var(--radius-card)] p-4 shadow-sm">
      <h3 className="text-foreground text-sm font-semibold">Ta bort {displayName}</h3>
      <p className="text-muted-foreground text-sm">
        Tar bort profilen från familjen. Händelser, listposter och inlägg
        finns kvar, men kopplingen till {displayName} tas bort. Går inte att
        ångra.
      </p>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {confirmOpen ? (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Säker?</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={handleDelete}
          >
            {pending ? "Tar bort…" : "Ja, ta bort"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(false)}
          >
            Avbryt
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => setConfirmOpen(true)}
        >
          Ta bort familjemedlem
        </Button>
      )}
    </div>
  )
}
