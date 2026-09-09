import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/lib/supabase/types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Zero-arg per konvention i CLAUDE.md (`const supabase = createClient()` i
// serverroutes/Server Components). Next.js kräver `await cookies()`, så
// anropsstället måste `await`:a den här funktionen.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Anropat från en Server Component – ignoreras eftersom
          // middleware.ts uppdaterar sessionen på varje request.
        }
      },
    },
  })
}
