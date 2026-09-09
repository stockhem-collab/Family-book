/**
 * Validerar en `?next=`-parameter så den bara kan peka på en intern,
 * relativ sida – annars skulle den kunna missbrukas för öppen
 * vidarebefordran (t.ex. `?next=https://exempel.se`).
 */
export function safeNext(next?: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next
  }
  return "/"
}
