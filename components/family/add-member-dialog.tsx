"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { createFamilyMember } from "@/app/(main)/familj/actions"
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

export function AddMemberDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const displayName = String(formData.get("displayName") ?? "").trim()
    if (!displayName) return
    const birthDate = formData.get("birthDate")
      ? String(formData.get("birthDate"))
      : null

    startTransition(async () => {
      const result = await createFamilyMember({ displayName, birthDate })
      if (result.error) {
        setError(result.error)
        return
      }
      setError(null)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        + Lägg till familjemedlem
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Lägg till familjemedlem</DialogTitle>
              <DialogDescription>
                För någon som inte loggar in själv, t.ex. ett barn. Går att
                redigera senare under personens egen profil.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="member-name">Namn</Label>
              <Input id="member-name" name="displayName" required autoFocus />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="member-birth-date">
                Födelsedatum (valfritt)
              </Label>
              <Input id="member-birth-date" name="birthDate" type="date" />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Lägger till…" : "Lägg till"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
