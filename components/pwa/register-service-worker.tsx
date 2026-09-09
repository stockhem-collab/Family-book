"use client"

import { useEffect } from "react"

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA-funktionalitet är valfri – en misslyckad registrering ska
        // aldrig störa resten av appen.
      })
    }
  }, [])

  return null
}
