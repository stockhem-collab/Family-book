import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Uppdaterar Supabase-sessionen (refreshar auth-token vid behov) på varje
 * request som matchar middleware-configen i root `middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Viktigt: gör alltid ett auth-anrop här så tokenet hinner refreshas
  // innan det når Server Components. Ta inte bort detta.
  await supabase.auth.getUser()

  return supabaseResponse
}
