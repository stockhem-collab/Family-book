"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { createList } from "@/app/(main)/listor/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ListType } from "@/lib/lists/types"

const PLACEHOLDER: Record<ListType, string> = {
  shopping: "T.ex. ICA, Willys…",
  todo: "T.ex. Veckans att göra",
  packing: "T.ex. Packa till Kreta",
  wishlist: "T.ex. Emmas önskelista",
}

export function AddListForm({ type }: { type: ListType }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        + Ny lista
      </Button>
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    const value = title.trim()
    startTransition(async () => {
      const result = await createList({ type, title: value })
      if (result.error) {
        setError(result.error)
        return
      }
      setTitle("")
      setError(null)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={PLACEHOLDER[type]}
          autoFocus
        />
        <Button type="submit" size="sm" disabled={pending || !title.trim()}>
          Skapa
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Avbryt
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </form>
  )
}
