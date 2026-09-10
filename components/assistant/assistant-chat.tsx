"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"

import {
  quickAddListItems,
  quickAddMealPlanEntries,
} from "@/app/(main)/quick-add-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatShortDate } from "@/lib/date/format"
import { parseDateKey } from "@/lib/date/week"
import { LIST_TYPE_LABELS } from "@/lib/lists/types"
import type { PendingAction } from "@/app/api/assistant/route"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type StoredMessage = Pick<Tables<"assistant_messages">, "id" | "role" | "content">
type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  actions?: PendingAction[]
}
type ActionStatus = "pending" | "saving" | "added" | "dismissed" | "error"

export function AssistantChat({
  initialMessages,
}: {
  initialMessages: StoredMessage[]
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialMessages.map((m) => ({
      id: m.id,
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }))
  )
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionStatus, setActionStatus] = useState<Record<string, ActionStatus>>({})
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || pending) return

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ])
    setInput("")
    setPending(true)
    setError(null)

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "Något gick fel.")
        return
      }

      const actions: PendingAction[] | undefined = Array.isArray(data.pendingActions)
        ? data.pendingActions
        : undefined

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
          actions: actions && actions.length > 0 ? actions : undefined,
        },
      ])
    } catch {
      setError("Kunde inte nå assistenten just nu.")
    } finally {
      setPending(false)
    }
  }

  async function handleConfirmAction(action: PendingAction) {
    setActionStatus((prev) => ({ ...prev, [action.id]: "saving" }))

    const result =
      action.kind === "list_items"
        ? await quickAddListItems({ type: action.listType, labels: action.items })
        : await quickAddMealPlanEntries({ entries: action.entries })

    setActionStatus((prev) => ({
      ...prev,
      [action.id]: result.error ? "error" : "added",
    }))
    if (result.error) setError(result.error)
  }

  function handleDismissAction(actionId: string) {
    setActionStatus((prev) => ({ ...prev, [actionId]: "dismissed" }))
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Fråga om vad som helst kring familjens kalender, listor eller
            husdjur.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col gap-2">
            <div
              className={cn(
                "max-w-[85%] rounded-[var(--radius-card)] px-4 py-2 text-sm shadow-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground self-end"
                  : "bg-card text-foreground self-start"
              )}
            >
              {message.content}
            </div>
            {message.actions?.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                status={actionStatus[action.id] ?? "pending"}
                onConfirm={() => handleConfirmAction(action)}
                onDismiss={() => handleDismissAction(action.id)}
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Skriv ett meddelande…"
          disabled={pending}
        />
        <Button type="submit" disabled={pending || !input.trim()}>
          {pending ? "Skickar…" : "Skicka"}
        </Button>
      </form>
    </div>
  )
}

function ActionCard({
  action,
  status,
  onConfirm,
  onDismiss,
}: {
  action: PendingAction
  status: ActionStatus
  onConfirm: () => void
  onDismiss: () => void
}) {
  const title =
    action.kind === "list_items"
      ? `Lägg till på ${LIST_TYPE_LABELS[action.listType]}?`
      : "Lägg till i matplaneringen?"

  return (
    <div className="bg-card border-border max-w-[85%] self-start rounded-[var(--radius-card)] border px-4 py-3 text-sm shadow-sm">
      <p className="text-foreground mb-2 font-medium">{title}</p>
      <ul className="text-muted-foreground mb-3 list-disc space-y-1 pl-4">
        {action.kind === "list_items"
          ? action.items.map((item, index) => <li key={index}>{item}</li>)
          : action.entries.map((entry, index) => (
              <li key={index}>
                {formatMealDate(entry.date)}: {entry.mealTitle}
              </li>
            ))}
      </ul>

      {status === "pending" && (
        <div className="flex gap-2">
          <Button size="sm" onClick={onConfirm}>
            Lägg till
          </Button>
          <Button size="sm" variant="outline" onClick={onDismiss}>
            Nej tack
          </Button>
        </div>
      )}
      {status === "saving" && (
        <p className="text-muted-foreground text-xs">Lägger till…</p>
      )}
      {status === "added" && (
        <p className="text-accent-green-foreground text-xs">✓ Tillagt!</p>
      )}
      {status === "dismissed" && (
        <p className="text-muted-foreground text-xs">Inget tillagt.</p>
      )}
      {status === "error" && (
        <p className="text-destructive text-xs">
          Kunde inte lägga till, se felmeddelandet ovan.
        </p>
      )}
    </div>
  )
}

function formatMealDate(dateKey: string) {
  const date = parseDateKey(dateKey)
  return date ? formatShortDate(date) : dateKey
}
