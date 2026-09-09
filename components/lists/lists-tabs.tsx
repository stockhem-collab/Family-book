"use client"

import { useMemo, useState } from "react"

import { AddListForm } from "@/components/lists/add-list-form"
import { ListSection } from "@/components/lists/list-section"
import { LIST_TYPE_LABELS, type ListType } from "@/lib/lists/types"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type ListRow = Pick<Tables<"lists">, "id" | "type" | "title">
type ItemRow = Pick<
  Tables<"list_items">,
  | "id"
  | "list_id"
  | "label"
  | "is_done"
  | "assigned_to"
  | "price"
  | "priority"
  | "sort_order"
>
type Member = Pick<Tables<"profiles">, "id" | "display_name">

const TABS = Object.entries(LIST_TYPE_LABELS) as [ListType, string][]

export function ListsTabs({
  lists,
  items,
  members,
}: {
  lists: ListRow[]
  items: ItemRow[]
  members: Member[]
}) {
  const [activeType, setActiveType] = useState<ListType>("shopping")

  const listsByType = useMemo(() => {
    const map: Record<ListType, ListRow[]> = {
      shopping: [],
      todo: [],
      packing: [],
      wishlist: [],
    }
    for (const list of lists) {
      if (list.type in map) map[list.type as ListType].push(list)
    }
    return map
  }, [lists])

  const itemsByList = useMemo(() => {
    const map: Record<string, ItemRow[]> = {}
    for (const item of items) {
      ;(map[item.list_id] ??= []).push(item)
    }
    return map
  }, [items])

  const activeLists = listsByType[activeType]

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveType(value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeType === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {activeLists.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Ingen lista här än – skapa en nedan.
          </p>
        )}
        {activeLists.map((list) => (
          <ListSection
            key={list.id}
            list={list}
            items={itemsByList[list.id] ?? []}
            members={members}
          />
        ))}
        <AddListForm type={activeType} />
      </div>
    </div>
  )
}
