import { NextResponse } from "next/server"

import { safeNext } from "@/lib/auth/safe-next"
import { createClient } from "@/lib/supabase/server"

// Tar emot redirecten från Supabase Auth (magic link eller Google) och
// byter ut `code` mot en inloggad session innan användaren skickas vidare.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
