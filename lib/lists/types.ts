export type ListType = "shopping" | "todo" | "packing" | "wishlist"

export const LIST_TYPE_LABELS: Record<ListType, string> = {
  shopping: "Handla",
  todo: "Att göra",
  packing: "Packa",
  wishlist: "Önskelista",
}

export const PRIORITY_LABELS: Record<string, string> = {
  vill_valdigt_garna: "Vill väldigt gärna",
  bra_present: "Bra present",
  ide: "Idé",
}
