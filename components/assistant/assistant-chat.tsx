"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type StoredMessage = Pick<Tables<"assistant_messages">, "id" | "role" | "content">
type ChatMessage = { id: string; role: "user" | "assistant"; content: string }

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

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ])
    } catch {
      setError("Kunde inte nå assistenten just nu.")
    } finally {
      setPending(false)
    }
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
          <div
            key={message.id}
            className={cn(
              "max-w-[85%] rounded-[var(--radius-card)] px-4 py-2 text-sm shadow-sm",
              message.role === "user"
                ? "bg-primary text-primary-foreground self-end"
                : "bg-card text-foreground self-start"
            )}
          >
            {message.content}
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
