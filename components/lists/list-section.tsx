"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"

import {
  addListItem,
  clearList,
  deleteListItem,
  toggleListItem,
  updateWishlistItem,
} from "@/app/(main)/listor/actions"
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
import { PRIORITY_LABELS } from "@/lib/lists/types"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type ListRow = Pick<Tables<"lists">, "id" | "title" | "type">
type ItemRow = Pick<
  Tables<"list_items">,
  | "id"
  | "label"
  | "is_done"
  | "assigned_to"
  | "price"
  | "priority"
  | "sort_order"
>
type Member = Pick<Tables<"profiles">, "id" | "display_name">

const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS) as [string, string][]

export function ListSection({
  list,
  items,
  members,
}: {
  list: ListRow
  items: ItemRow[]
  members: Member[]
}) {
  const router = useRouter()
  const isWishlist = list.type === "wishlist"
  const [pending, startTransition] = useTransition()
  const [label, setLabel] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [price, setPrice] = useState("")
  const [priority, setPriority] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const sorted = [...items].sort((a, b) => {
    if (a.is_done !== b.is_done) return a.is_done ? 1 : -1
    return (a.sort_order ?? 0) - (b.sort_order ?? 0)
  })

  function run(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        setError(result.error)
        return
      }
      setError(null)
      router.refresh()
    })
  }

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!label.trim()) return
    const value = label.trim()
    const assigned = assignedTo || null
    const priceValue = price.trim() ? Number(price) : null
    const priorityValue = priority || null
    setLabel("")
    setAssignedTo("")
    setPrice("")
    setPriority("")
    run(() =>
      addListItem({
        listId: list.id,
        label: value,
        assignedTo: assigned,
        price: priceValue,
        priority: priorityValue,
      })
    )
  }

  function memberName(id: string | null) {
    return id ? members.find((member) => member.id === id)?.display_name : undefined
  }

  function handleClearList() {
    setConfirmClearOpen(false)
    run(() => clearList(list.id))
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-[var(--radius-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-foreground text-sm font-semibold">{list.title}</h3>
        {items.length > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmClearOpen(true)}
            className="text-muted-foreground hover:text-destructive shrink-0 text-xs underline-offset-2 hover:underline"
          >
            Rensa lista
          </button>
        )}
      </div>

      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rensa &quot;{list.title}&quot;?</DialogTitle>
            <DialogDescription>
              Alla {items.length} objekt i listan tas bort. Det går inte att
              ångra.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmClearOpen(false)}
            >
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleClearList}>
              Rensa lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm">Tomt just nu.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((item) => {
            const meta = [
              memberName(item.assigned_to),
              item.priority ? PRIORITY_LABELS[item.priority] : null,
              item.price ? `${item.price} kr` : null,
            ]
              .filter(Boolean)
              .join(" · ")
            const isEditing = editingItemId === item.id

            return (
              <li key={item.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      run(() =>
                        toggleListItem({ id: item.id, isDone: !item.is_done })
                      )
                    }
                    className="-m-3 flex size-11 shrink-0 items-center justify-center"
                    aria-label={
                      item.is_done ? "Markera som ej klar" : "Markera som klar"
                    }
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border-2 transition-colors",
                        item.is_done
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      )}
                    />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={cn(
                        "truncate text-sm",
                        item.is_done
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                    {meta && (
                      <span className="text-muted-foreground text-xs">
                        {meta}
                      </span>
                    )}
                  </div>
                  {isWishlist && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        setEditingItemId(isEditing ? null : item.id)
                      }
                      className="text-muted-foreground hover:text-foreground shrink-0"
                      aria-label="Ändra pris/prioritet"
                    >
                      <Pencil className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => deleteListItem(item.id))}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Ta bort"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {isEditing && (
                  <WishlistEditRow
                    item={item}
                    pending={pending}
                    onCancel={() => setEditingItemId(null)}
                    onSave={(next) => {
                      setEditingItemId(null)
                      run(() =>
                        updateWishlistItem({
                          id: item.id,
                          price: next.price,
                          priority: next.priority,
                        })
                      )
                    }}
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Lägg till…"
            className="h-9"
          />
          {members.length > 0 && (
            <select
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              className="border-input bg-card text-foreground h-9 shrink-0 rounded-md border px-2 text-xs"
              aria-label="Tilldela"
            >
              <option value="">Alla</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.display_name}
                </option>
              ))}
            </select>
          )}
          <Button type="submit" size="sm" disabled={pending || !label.trim()}>
            Lägg till
          </Button>
        </div>

        {isWishlist && (
          <div className="flex items-center gap-2">
            <Input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              type="number"
              min="0"
              step="1"
              placeholder="Pris (kr, valfritt)"
              className="h-9"
            />
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="border-input bg-card text-foreground h-9 w-full shrink-0 rounded-md border px-2 text-xs"
              aria-label="Prioritet"
            >
              <option value="">Ingen prioritet</option>
              {PRIORITY_OPTIONS.map(([value, optionLabel]) => (
                <option key={value} value={value}>
                  {optionLabel}
                </option>
              ))}
            </select>
          </div>
        )}
      </form>
    </div>
  )
}

function WishlistEditRow({
  item,
  pending,
  onSave,
  onCancel,
}: {
  item: ItemRow
  pending: boolean
  onSave: (next: { price: number | null; priority: string | null }) => void
  onCancel: () => void
}) {
  const [price, setPrice] = useState(item.price?.toString() ?? "")
  const [priority, setPriority] = useState(item.priority ?? "")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      price: price.trim() ? Number(price) : null,
      priority: priority || null,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-muted/50 flex items-center gap-2 rounded-lg p-2"
    >
      <Input
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        type="number"
        min="0"
        step="1"
        placeholder="Pris (kr)"
        className="h-9"
        autoFocus
      />
      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
        className="border-input bg-card text-foreground h-9 w-full shrink-0 rounded-md border px-2 text-xs"
        aria-label="Prioritet"
      >
        <option value="">Ingen prioritet</option>
        {PRIORITY_OPTIONS.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        Spara
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Avbryt
      </Button>
    </form>
  )
}
