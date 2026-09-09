"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)

  const redirectQuery = next ? `?next=${encodeURIComponent(next)}` : ""

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("sending")
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback${redirectQuery}`,
      },
    })

    if (error) {
      setStatus("error")
      setError(error.message)
      return
    }
    setStatus("sent")
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${redirectQuery}`,
      },
    })
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-muted-foreground">
        Vi har skickat en inloggningslänk till <strong>{email}</strong>. Öppna
        den för att logga in.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-post</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="du@exempel.se"
          />
        </div>
        {status === "error" && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Skickar…" : "Skicka inloggningslänk"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        eller
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" type="button" onClick={handleGoogle}>
        Fortsätt med Google
      </Button>
    </div>
  )
}
