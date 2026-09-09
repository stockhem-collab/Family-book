import Link from "next/link"

import type { Tables } from "@/lib/supabase/types"

type Member = Pick<Tables<"profiles">, "id" | "display_name" | "avatar_url">

export function AvatarRow({ members }: { members: Member[] }) {
  if (members.length === 0) return null

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {members.map((member) => (
        <Link
          key={member.id}
          href={`/familj/${member.id}`}
          className="flex flex-col items-center gap-1"
        >
          <span className="bg-secondary text-secondary-foreground flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold shadow-sm">
            {member.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.avatar_url}
                alt={member.display_name}
                className="size-full object-cover"
              />
            ) : (
              initials(member.display_name)
            )}
          </span>
          <span className="text-muted-foreground max-w-14 truncate text-xs">
            {member.display_name}
          </span>
        </Link>
      ))}
    </div>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
