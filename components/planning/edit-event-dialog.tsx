"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { deleteEvent, updateEvent } from "@/app/(main)/planering/actions"
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
type EventRow = Pick<
  Tables<"calendar_events">,
  | "id"
  | "title"
  | "category"
  | "location"
  | "starts_at"
  | "ends_at"
  | "member_ids"
  | "bring_items"
>

// Konverterar en lagrad UTC-tidpunkt till värdet <input type="datetime-local">
// vill ha, i BESÖKARENS lokala tid (klientkomponent – körs i webbläsaren,
// som för de allra flesta användare av appen är svensk tid).
function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

export function EditEventDialog({
  event,
  members,
  open,
  onOpenChange,
}: {
  event: EventRow
  members: Member[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    const formData = new FormData(formEvent.currentTarget)
    const memberIds = formData.getAll("memberIds").map(String)

    startTransition(async () => {
      const result = await updateEvent({
        id: event.id,
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
      setError(null)
      onOpenChange(false)
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEvent(event.id)
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
            <DialogTitle>Ändra händelse</DialogTitle>
            <DialogDescription>
              Ändringar syns direkt för hela familjen.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-event-title">Titel</Label>
            <Input
              id="edit-event-title"
              name="title"
              defaultValue={event.title}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-event-starts-at">Start</Label>
              <Input
                id="edit-event-starts-at"
                name="startsAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(event.starts_at)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-event-ends-at">Slut (valfritt)</Label>
              <Input
                id="edit-event-ends-at"
                name="endsAt"
                type="datetime-local"
                defaultValue={
                  event.ends_at ? toDateTimeLocalValue(event.ends_at) : ""
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-event-category">Kategori</Label>
              <Input
                id="edit-event-category"
                name="category"
                defaultValue={event.category ?? ""}
                placeholder="T.ex. Fotboll"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-event-location">Plats</Label>
              <Input
                id="edit-event-location"
                name="location"
                defaultValue={event.location ?? ""}
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
                      defaultChecked={(event.member_ids ?? []).includes(
                        member.id
                      )}
                      className="border-input size-4 rounded"
                    />
                    {member.display_name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-event-bring-items">Ta med (valfritt)</Label>
            <Input
              id="edit-event-bring-items"
              name="bringItems"
              defaultValue={event.bring_items ?? ""}
              placeholder="T.ex. gympakläder"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter className="sm:justify-between">
            {confirmDelete ? (
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
                Ta bort händelse
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Sparar…" : "Spara"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
