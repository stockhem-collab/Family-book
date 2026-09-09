"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, ListChecks, Sparkles, Users } from "lucide-react"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Hem", icon: Home },
  { href: "/planering", label: "Planering", icon: Calendar },
  { href: "/listor", label: "Listor", icon: ListChecks },
  { href: "/familj", label: "Familj", icon: Users },
  { href: "/assistent", label: "Assistent", icon: Sparkles },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href)

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
