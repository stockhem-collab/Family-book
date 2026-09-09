"use client"

import { useState } from "react"

import { EditProfileForm } from "@/components/family/edit-profile-form"
import { formatLongDate, formatTime } from "@/lib/date/format"
import { PRIORITY_LABELS } from "@/lib/lists/types"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type Member = Pick<
  Tables<"profiles">,
  | "id"
  | "display_name"
  | "birth_date"
  | "clothing_size"
  | "shoe_size"
  | "favorite_food"
  | "dislikes"
  | "hobbies"
>
type EventRow = Pick<
  Tables<"calendar_events">,
  "id" | "title" | "starts_at" | "location"
>
type WishlistItem = Pick<
  Tables<"list_items">,
  "id" | "label" | "price" | "priority" | "is_done"
>

const TABS = [
  { value: "info", label: "Info" },
  { value: "aktiviteter", label: "Aktiviteter" },
  { value: "preferenser", label: "Preferenser" },
  { value: "onskelista", label: "Önskelista" },
  { value: "mer", label: "Mer" },
] as const

type TabValue = (typeof TABS)[number]["value"]

export function ProfileTabs({
  member,
  activityEvents,
  wishlistItems,
  canEdit,
}: {
  member: Member
  activityEvents: EventRow[]
  wishlistItems: WishlistItem[]
  canEdit: boolean
}) {
  const [active, setActive] = useState<TabValue>("info")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActive(tab.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "info" && (
        <div className="bg-card flex flex-col gap-2 rounded-[var(--radius-card)] p-4 text-sm shadow-sm">
          <InfoRow
            label="Födelsedatum"
            value={
              member.birth_date
                ? formatLongDate(new Date(member.birth_date))
                : null
            }
          />
          <InfoRow label="Klädstorlek" value={member.clothing_size} />
          <InfoRow label="Skostorlek" value={member.shoe_size} />
        </div>
      )}

      {active === "aktiviteter" && (
        <div className="flex flex-col gap-2">
          {activityEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Inget inplanerat.
            </p>
          ) : (
            activityEvents.map((event) => (
              <div
                key={event.id}
                className="bg-card flex items-center justify-between gap-2 rounded-[var(--radius-card)] p-3 text-sm shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="text-foreground">{event.title}</span>
                  {event.location && (
                    <span className="text-muted-foreground text-xs">
                      {event.location}
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground text-xs">
                  {formatTime(new Date(event.starts_at))}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {active === "preferenser" && (
        <div className="bg-card flex flex-col gap-2 rounded-[var(--radius-card)] p-4 text-sm shadow-sm">
          <InfoRow label="Favoritmat" value={member.favorite_food} />
          <InfoRow label="Ogillar" value={member.dislikes} />
          <InfoRow label="Intressen" value={member.hobbies} />
        </div>
      )}

      {active === "onskelista" && (
        <div className="flex flex-col gap-2">
          {wishlistItems.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Ingen önskelista än – lägg till önskningar under Listor.
            </p>
          ) : (
            wishlistItems.map((item) => {
              const meta = [
                item.priority ? PRIORITY_LABELS[item.priority] : null,
                item.price ? `${item.price} kr` : null,
              ]
                .filter(Boolean)
                .join(" · ")

              return (
                <div
                  key={item.id}
                  className="bg-card flex items-center justify-between gap-2 rounded-[var(--radius-card)] p-3 text-sm shadow-sm"
                >
                  <span
                    className={cn(
                      "text-foreground",
                      item.is_done && "text-muted-foreground line-through"
                    )}
                  >
                    {item.label}
                  </span>
                  {meta && (
                    <span className="text-muted-foreground text-xs">
                      {meta}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {active === "mer" && (
        <div className="flex flex-col gap-3">
          {canEdit ? (
            <EditProfileForm member={member} />
          ) : (
            <p className="text-muted-foreground text-sm">
              Bara personen själv eller en admin kan redigera profilen.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || "–"}</span>
    </div>
  )
}
