import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarColorClass } from "@/lib/family/avatar-color"
import { getInitials } from "@/lib/family/initials"
import type { Tables } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

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
          <Avatar className="size-12 shadow-sm">
            <AvatarImage src={member.avatar_url ?? undefined} alt="" />
            <AvatarFallback
              className={cn("text-sm", getAvatarColorClass(member.id))}
            >
              {getInitials(member.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground max-w-14 truncate text-xs">
            {member.display_name}
          </span>
        </Link>
      ))}
    </div>
  )
}
