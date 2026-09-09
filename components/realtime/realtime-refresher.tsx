"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

/**
 * Prenumererar på Supabase Realtime för list_items och calendar_events i
 * familjen och gör en lätt router.refresh() (debounce:ad) när något
 * ändras, så Server Component-sidorna (Hem, Listor, Planering) alltid
 * visar aktuell data utan att någon manuellt laddar om.
 */
export function RealtimeRefresher({ familyId }: { familyId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let timeout: ReturnType<typeof setTimeout> | null = null

    function scheduleRefresh() {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => router.refresh(), 300)
    }

    const channel = supabase
      .channel(`family-${familyId}-realtime`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "list_items",
          filter: `family_id=eq.${familyId}`,
        },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar_events",
          filter: `family_id=eq.${familyId}`,
        },
        scheduleRefresh
      )
      .subscribe()

    return () => {
      if (timeout) clearTimeout(timeout)
      supabase.removeChannel(channel)
    }
  }, [familyId, router])

  return null
}
