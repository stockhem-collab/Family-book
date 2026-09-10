"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import {
  addListItem,
  deleteListItem,
  toggleListItem,
} from "@/app/(main)/listor/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PRIORITY_LABELS } from "@/lib/lists/types"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type ListRow = Pick<Tables<"lists">, "id" | "title">
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
  const [pending, startTransition] = useTransition()
  const [label, setLabel] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [error, setError] = useState<string | null>(null)

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
    setLabel("")
    setAssignedTo("")
    run(() => addListItem({ listId: list.id, label: value, assignedTo: assigned }))
  }

  function memberName(id: string | null) {
    return id ? members.find((member) => member.id === id)?.display_name : undefined
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-[var(--radius-card)] p-4 shadow-sm">
      <h3 className="text-foreground text-sm font-semibold">{list.title}</h3>

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

            return (
              <li key={item.id} className="flex items-center gap-3">
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
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => deleteListItem(item.id))}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  aria-label="Ta bort"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
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
      </form>
    </div>
  )
}
