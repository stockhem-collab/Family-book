"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function InviteCard({
  familyName,
  inviteCode,
}: {
  familyName: string
  inviteCode: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/join/${inviteCode}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Klippbordet kan vara otillgängligt – ignoreras tyst, koden syns ändå.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bjud in till {familyName}</CardTitle>
        <CardDescription>Dela koden eller länken nedan.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <span className="text-foreground font-mono text-lg font-semibold tracking-wider">
          {inviteCode}
        </span>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? "Kopierad!" : "Kopiera länk"}
        </Button>
      </CardContent>
    </Card>
  )
}
