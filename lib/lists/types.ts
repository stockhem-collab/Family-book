export type ListType = "shopping" | "todo" | "packing" | "wishlist"

export const LIST_TYPE_LABELS: Record<ListType, string> = {
  shopping: "Handla",
  todo: "Att göra",
  packing: "Packa",
  wishlist: "Önskelista",
}

// Tailwind-klasserna måste stå utskrivna i sin helhet (inte byggas ihop av
// variabler) för att Tailwinds scanner ska hitta och generera dem.
export const LIST_TYPE_ACTIVE_CLASS: Record<ListType, string> = {
  shopping: "bg-accent-blue text-accent-blue-foreground",
  todo: "bg-accent-green text-accent-green-foreground",
  packing: "bg-accent-yellow text-accent-yellow-foreground",
  wishlist: "bg-accent-pink text-accent-pink-foreground",
}

export const PRIORITY_LABELS: Record<string, string> = {
  vill_valdigt_garna: "Vill väldigt gärna",
  bra_present: "Bra present",
  ide: "Idé",
}
