"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-foreground text-lg font-semibold">
        Något gick fel
      </h1>
      <p className="text-muted-foreground max-w-xs text-sm">
        Det uppstod ett oväntat fel. Prova igen – om det upprepas, berätta
        gärna vad du gjorde precis innan.
      </p>
      <Button onClick={reset}>Försök igen</Button>
    </div>
  )
}
