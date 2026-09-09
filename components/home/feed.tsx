import { formatRelativeTime } from "@/lib/date/format"
import type { Tables } from "@/lib/supabase/types"

type Post = Pick<
  Tables<"feed_posts">,
  "id" | "text_content" | "image_url" | "created_at" | "author_id"
>

export function Feed({
  posts,
  memberNames,
}: {
  posts: Post[]
  memberNames: Record<string, string>
}) {
  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Inga inlägg än. Dela något med familjen!
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((post) => (
        <li
          key={post.id}
          className="bg-card flex flex-col gap-2 rounded-[var(--radius-card)] p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-foreground text-sm font-medium">
              {(post.author_id && memberNames[post.author_id]) ?? "Okänd"}
            </span>
            <span className="text-muted-foreground text-xs">
              {post.created_at
                ? formatRelativeTime(new Date(post.created_at))
                : ""}
            </span>
          </div>
          {post.text_content && (
            <p className="text-foreground text-sm">{post.text_content}</p>
          )}
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_url}
              alt=""
              className="max-h-72 w-full rounded-lg object-cover"
            />
          )}
        </li>
      ))}
    </ul>
  )
}
