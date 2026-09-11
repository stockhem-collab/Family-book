import { redirect } from "next/navigation"

import { MealPlanRow } from "@/components/meals/meal-plan-row"
import { WeekSelector } from "@/components/shared/week-selector"
import { formatShortDate } from "@/lib/date/format"
import { addDays, getWeekStart, parseDateKey, toDateKey } from "@/lib/date/week"
import { createClient } from "@/lib/supabase/server"

const WEEKDAY_LONG = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
]

export default async function MatPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("user_id", user.id)
    .single()

  const familyId = profile?.family_id
  if (!familyId) {
    redirect("/onboarding")
  }

  const now = new Date()
  const weekStart = (week && parseDateKey(week)) || getWeekStart(now)
  const weekEnd = addDays(weekStart, 7)

  const { data: meals } = await supabase
    .from("meal_plans")
    .select("id, date, meal_title, recipe_url")
    .eq("family_id", familyId)
    .gte("date", toDateKey(weekStart))
    .lt("date", toDateKey(weekEnd))
    .order("date")

  const mealsByDate = new Map((meals ?? []).map((meal) => [meal.date, meal]))
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-8">
      <h1 className="text-foreground text-xl font-semibold">Mat</h1>
      <WeekSelector
        weekStart={weekStart}
        today={now}
        basePath="/mat"
        interactive={false}
      />

      <div className="flex flex-col gap-3">
        {days.map((day, i) => {
          const key = toDateKey(day)
          const meal = mealsByDate.get(key)

          return (
            <div
              key={key}
              className="bg-card flex flex-col gap-2 rounded-[var(--radius-card)] p-3 shadow-sm"
            >
              <h3 className="text-foreground text-sm font-semibold">
                {WEEKDAY_LONG[i]} {formatShortDate(day)}
              </h3>
              {/*
                key på själva raden (inte bara den omgivande dagen) tvingar
                React att montera om komponenten när måltiden för dagen
                bytt identitet (skapad, borttagen eller ersatt) - annars
                behåller de okontrollerade text-fälten sitt gamla innehåll
                efter en spara/ta bort, eftersom defaultValue bara läses vid
                första monteringen.
              */}
              <MealPlanRow key={meal?.id ?? `empty-${key}`} date={key} meal={meal} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
