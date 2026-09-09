"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ListPlus, MessageSquarePlus, Plus } from "lucide-react"

import {
  quickAddEvent,
  quickAddListItem,
  quickAddPost,
} from "@/app/(main)/quick-add-actions"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type QuickAddKind = "event" | "item" | "post"

const LIST_TYPE_OPTIONS = [
  { value: "todo", label: "Att göra" },
  { value: "shopping", label: "Handla" },
  { value: "packing", label: "Packa" },
  { value: "wishlist", label: "Önskelista" },
] as const

function defaultDateTimeLocal() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export function QuickAddFab() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<QuickAddKind | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function openDialog(kind: QuickAddKind) {
    setError(null)
    setDialog(kind)
    setMenuOpen(false)
  }

  function closeDialog() {
    setDialog(null)
    setError(null)
  }

  function runAction(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        setError(result.error)
        return
      }
      closeDialog()
      router.refresh()
    })
  }

  function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    runAction(() =>
      quickAddEvent({
        title: String(formData.get("title") ?? ""),
        startsAt: String(formData.get("startsAt") ?? ""),
      })
    )
  }

  function handleItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    runAction(() =>
      quickAddListItem({
        type: formData.get("type") as (typeof LIST_TYPE_OPTIONS)[number]["value"],
        label: String(formData.get("label") ?? ""),
      })
    )
  }

  function handlePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    runAction(() => quickAddPost({ text: String(formData.get("text") ?? "") }))
  }

  return (
    <>
      <div className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-2">
        {menuOpen && (
          <div className="flex flex-col items-end gap-2">
            <QuickAddMenuItem
              label="Nytt inlägg"
              icon={MessageSquarePlus}
              onClick={() => openDialog("post")}
            />
            <QuickAddMenuItem
              label="Ny listpost"
              icon={ListPlus}
              onClick={() => openDialog("item")}
            />
            <QuickAddMenuItem
              label="Ny händelse"
              icon={Calendar}
              onClick={() => openDialog("event")}
            />
          </div>
        )}

        <Button
          size="icon"
          className="size-14 rounded-full shadow-lg"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Stäng snabbmeny" : "Öppna snabbmeny"}
        >
          <Plus
            className={cn(
              "size-6 transition-transform",
              menuOpen && "rotate-45"
            )}
          />
        </Button>
      </div>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          {dialog === "event" && (
            <form onSubmit={handleEventSubmit} className="flex flex-col gap-4">
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-starts-at">Datum och tid</Label>
                <Input
                  id="event-starts-at"
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={defaultDateTimeLocal()}
                  required
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Sparar…" : "Lägg till"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {dialog === "item" && (
            <form onSubmit={handleItemSubmit} className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Ny listpost</DialogTitle>
                <DialogDescription>
                  Hamnar på rätt lista under Listor.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-type">Lista</Label>
                <select
                  id="item-type"
                  name="type"
                  defaultValue="todo"
                  className="border-input bg-card text-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {LIST_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-label">Vad ska läggas till?</Label>
                <Input id="item-label" name="label" required autoFocus />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Sparar…" : "Lägg till"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {dialog === "post" && (
            <form onSubmit={handlePostSubmit} className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Nytt inlägg</DialogTitle>
                <DialogDescription>
                  Syns i familjens flöde på Hem.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="post-text">Vad vill du dela?</Label>
                <Textarea
                  id="post-text"
                  name="text"
                  required
                  autoFocus
                  rows={4}
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Sparar…" : "Dela"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function QuickAddMenuItem({
  label,
  icon: Icon,
  onClick,
}: {
  label: string
  icon: typeof Plus
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-card text-foreground hover:bg-muted flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md"
    >
      {label}
      <Icon className="text-primary size-4" />
    </button>
  )
}
