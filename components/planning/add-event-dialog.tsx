"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { createEvent } from "@/app/(main)/planering/actions"
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

type Member = Pick<Tables<"profiles">, "id" | "display_name">

function defaultDateTimeLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export function AddEventDialog({ members }: { members: Member[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const memberIds = formData.getAll("memberIds").map(String)

    startTransition(async () => {
      const result = await createEvent({
        title: String(formData.get("title") ?? ""),
        startsAt: String(formData.get("startsAt") ?? ""),
        endsAt: formData.get("endsAt") ? String(formData.get("endsAt")) : null,
        location: formData.get("location")
          ? String(formData.get("location"))
          : null,
        category: formData.get("category")
          ? String(formData.get("category"))
          : null,
        memberIds,
        bringItems: formData.get("bringItems")
          ? String(formData.get("bringItems"))
          : null,
      })

      if (result.error) {
        setError(result.error)
        return
      }
      setOpen(false)
      setError(null)
      router.refresh()
    })
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Ny händelse</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Ny händelse</DialogTitle>
              <DialogDescription>
                Läggs till i familjens kalender.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-title">Titel</Label>
              <Input id="event-title" name="title" required autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-starts-at">Start</Label>
                <Input
                  id="event-starts-at"
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={defaultDateTimeLocal()}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-ends-at">Slut (valfritt)</Label>
                <Input id="event-ends-at" name="endsAt" type="datetime-local" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-category">Kategori</Label>
                <Input
                  id="event-category"
                  name="category"
                  placeholder="T.ex. Fotboll"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-location">Plats</Label>
                <Input
                  id="event-location"
                  name="location"
                  placeholder="T.ex. Skolan"
                />
              </div>
            </div>

            {members.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Vilka gäller det?</Label>
                <div className="flex flex-wrap gap-3">
                  {members.map((member) => (
                    <label
                      key={member.id}
                      className="text-foreground flex items-center gap-1.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="memberIds"
                        value={member.id}
                        className="border-input size-4 rounded"
                      />
                      {member.display_name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-bring-items">Ta med (valfritt)</Label>
              <Input
                id="event-bring-items"
                name="bringItems"
                placeholder="T.ex. gympakläder"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Sparar…" : "Lägg till"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
