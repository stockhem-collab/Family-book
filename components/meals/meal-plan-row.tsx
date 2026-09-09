"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { deleteMealPlan, saveMealPlan } from "@/app/(main)/mat/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Tables } from "@/lib/supabase/types"

type Meal = Pick<Tables<"meal_plans">, "id" | "meal_title" | "recipe_url">

export function MealPlanRow({
  date,
  meal,
}: {
  date: string
  meal: Meal | undefined
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const mealTitle = String(formData.get("mealTitle") ?? "").trim()
    if (!mealTitle) return
    const recipeUrl = formData.get("recipeUrl")
      ? String(formData.get("recipeUrl"))
      : null

    startTransition(async () => {
      const result = await saveMealPlan({ date, mealTitle, recipeUrl })
      if (result.error) {
        setError(result.error)
        return
      }
      setError(null)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!meal) return
    startTransition(async () => {
      const result = await deleteMealPlan(meal.id)
      if (result.error) {
        setError(result.error)
        return
      }
      setError(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <Input
          name="mealTitle"
          defaultValue={meal?.meal_title ?? ""}
          placeholder="Vad blir det för mat?"
          className="h-9"
        />
        <Input
          name="recipeUrl"
          type="url"
          defaultValue={meal?.recipe_url ?? ""}
          placeholder="Länk till recept (valfritt)"
          className="h-9"
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            Spara
          </Button>
          {meal && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={pending}
            >
              Ta bort
            </Button>
          )}
        </div>
      </form>
      {meal?.recipe_url && (
        <a
          href={meal.recipe_url}
          target="_blank"
          rel="noreferrer"
          className="text-primary text-xs underline-offset-4 hover:underline"
        >
          Öppna recept
        </a>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
