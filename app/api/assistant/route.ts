import Anthropic from "@anthropic-ai/sdk"

import { getStockholmDateParts } from "@/lib/date/timezone"
import type { ListType } from "@/lib/lists/types"
import { createClient } from "@/lib/supabase/server"

// OBS: CLAUDE.md:s ursprungliga exempel angav modellen "claude-sonnet-4-6".
// Den strängen är inaktuell – aktuell modellrekommendation är "claude-opus-5".
const MODEL = "claude-opus-5"
const HISTORY_LIMIT = 20
const LIST_TYPES: ListType[] = ["shopping", "todo", "packing", "wishlist"]

// Assistenten får INTE spara något själv – den föreslår, och klienten visar
// ett bekräftelsekort som användaren måste godkänna innan något skrivs till
// listor eller matplanering (se app/(main)/assistent/actions.ts).
const TOOLS: Anthropic.Tool[] = [
  {
    name: "suggest_list_items",
    description:
      "Föreslå varor/uppgifter att lägga till på en av familjens listor (t.ex. ingredienser till en middag du föreslagit, eller sådant användaren bad dig lägga till). Sparas inte automatiskt – visas som förslag som användaren godkänner.",
    input_schema: {
      type: "object",
      properties: {
        list_type: {
          type: "string",
          enum: LIST_TYPES,
          description: "Vilken lista förslaget gäller.",
        },
        items: {
          type: "array",
          items: { type: "string" },
          description: "En kort textrad per vara/uppgift.",
        },
      },
      required: ["list_type", "items"],
    },
  },
  {
    name: "suggest_meal_plan",
    description:
      "Föreslå middagar/måltider för specifika datum i matplaneringen. Sparas inte automatiskt – visas som förslag som användaren godkänner.",
    input_schema: {
      type: "object",
      properties: {
        entries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: {
                type: "string",
                description: "Datum i formatet ÅÅÅÅ-MM-DD.",
              },
              meal_title: { type: "string" },
            },
            required: ["date", "meal_title"],
          },
        },
      },
      required: ["entries"],
    },
  },
  {
    name: "suggest_clear_list",
    description:
      "Föreslå att RENSA (ta bort ALLA objekt i) en av familjens listor. Använd bara om användaren uttryckligen ber om att tömma/rensa en hel lista – inte för att ta bort enstaka saker. Sparas inte automatiskt – visas som förslag som användaren godkänner.",
    input_schema: {
      type: "object",
      properties: {
        list_id: {
          type: "string",
          description: "id för listan som ska rensas, taget från 'Familjens listor' i kontexten.",
        },
      },
      required: ["list_id"],
    },
  },
]

export type PendingAction =
  | { id: string; kind: "list_items"; listType: ListType; items: string[] }
  | {
      id: string
      kind: "meal_plan"
      entries: { date: string; mealTitle: string }[]
    }
  | { id: string; kind: "clear_list"; listId: string; listTitle: string }

function toPendingAction(
  block: Anthropic.ToolUseBlock,
  lists: { id: string; title: string }[]
): PendingAction | null {
  const input = block.input as Record<string, unknown>

  if (block.name === "suggest_list_items") {
    const listType = input.list_type
    const items = input.items
    if (
      typeof listType !== "string" ||
      !LIST_TYPES.includes(listType as ListType) ||
      !Array.isArray(items)
    ) {
      return null
    }
    const cleanItems = items.filter(
      (item): item is string => typeof item === "string" && item.trim() !== ""
    )
    if (cleanItems.length === 0) return null
    return { id: block.id, kind: "list_items", listType: listType as ListType, items: cleanItems }
  }

  if (block.name === "suggest_meal_plan") {
    const entries = input.entries
    if (!Array.isArray(entries)) return null
    const cleanEntries = entries
      .filter(
        (entry): entry is { date: unknown; meal_title: unknown } =>
          typeof entry === "object" && entry !== null
      )
      .map((entry) => ({
        date: typeof entry.date === "string" ? entry.date : "",
        mealTitle: typeof entry.meal_title === "string" ? entry.meal_title : "",
      }))
      .filter((entry) => entry.date !== "" && entry.mealTitle !== "")
    if (cleanEntries.length === 0) return null
    return { id: block.id, kind: "meal_plan", entries: cleanEntries }
  }

  if (block.name === "suggest_clear_list") {
    const listId = input.list_id
    if (typeof listId !== "string") return null
    const list = lists.find((l) => l.id === listId)
    if (!list) return null
    return { id: block.id, kind: "clear_list", listId: list.id, listTitle: list.title }
  }

  return null
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const message = typeof body?.message === "string" ? body.message.trim() : ""

  if (!message) {
    return Response.json({ error: "Meddelande saknas." }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "AI-assistenten är inte konfigurerad ännu (ANTHROPIC_API_KEY saknas).",
      },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: "Du är inte inloggad." }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, family_id, display_name")
    .eq("user_id", user.id)
    .single()

  const familyId = profile?.family_id
  if (!familyId || !profile) {
    return Response.json({ error: "Ingen familj hittades." }, { status: 400 })
  }
  const profileId = profile.id

  const now = new Date().toISOString()
  const today = now.slice(0, 10)

  const [
    { data: events },
    { data: items },
    { data: lists },
    { data: pets },
    { data: members },
    { data: meals },
    { data: history },
  ] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("title, category, location, starts_at")
      .eq("family_id", familyId)
      .gte("starts_at", now)
      .order("starts_at")
      .limit(20),
    supabase
      .from("list_items")
      .select("list_id, label, priority")
      .eq("family_id", familyId)
      .eq("is_done", false)
      .limit(50),
    supabase.from("lists").select("id, title, type").eq("family_id", familyId),
    supabase
      .from("pets")
      .select("name, species, breed, current_medication")
      .eq("family_id", familyId),
    supabase
      .from("profiles")
      .select("display_name, favorite_food, dislikes, hobbies")
      .eq("family_id", familyId),
    supabase
      .from("meal_plans")
      .select("date, meal_title")
      .eq("family_id", familyId)
      .gte("date", today)
      .order("date")
      .limit(14),
    supabase
      .from("assistant_messages")
      .select("role, content")
      .eq("family_id", familyId)
      .eq("user_id", profileId)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
  ])

  const listTitleById = new Map((lists ?? []).map((list) => [list.id, list.title]))
  const openItems = (items ?? []).map((item) => ({
    label: item.label,
    priority: item.priority,
    lista: listTitleById.get(item.list_id) ?? null,
  }))
  const preferences = (members ?? [])
    .filter((member) => member.favorite_food || member.dislikes || member.hobbies)
    .map((member) => ({
      namn: member.display_name,
      favoritmat: member.favorite_food,
      ogillar: member.dislikes,
      hobbies: member.hobbies,
    }))

  const { year, month, day } = getStockholmDateParts(new Date())
  const todayStockholm = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  const systemContext = `Du är familjens assistent för "Familjen"-appen. Du pratar med ${
    profile?.display_name ?? "en familjemedlem"
  }.
Dagens datum (svensk tid): ${todayStockholm}.
Kommande händelser: ${JSON.stringify(events ?? [])}
Öppna listor: ${JSON.stringify(openItems)}
Planerad mat kommande dagar: ${JSON.stringify(meals ?? [])}
Familjemedlemmars matpreferenser och hobbies: ${JSON.stringify(preferences)}
Familjens listor (id, titel, typ): ${JSON.stringify(lists ?? [])}
Husdjur: ${JSON.stringify(pets ?? [])}
Använd matpreferenserna när du föreslår middagar, matsedel eller vad som ska
handlas – undvik det någon ogillar och lyft gärna favoriter.
Om du föreslår en middag eller uppmanas lägga till något på en lista: skriv
kort vad du föreslår i vanlig text, och använd DESSUTOM verktygen
suggest_meal_plan/suggest_list_items för att lägga fram det som ett konkret
förslag – du sparar inget själv, användaren godkänner förslaget i appen.
Om användaren ber dig rensa/tömma en hel lista: använd suggest_clear_list med
rätt list_id från "Familjens listor" ovan.
Svara kort, varmt och konkret på svenska.`

  const conversationHistory: Anthropic.MessageParam[] = (history ?? [])
    .slice()
    .reverse()
    .map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: entry.content,
    }))

  const anthropic = new Anthropic()

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "medium" },
      system: systemContext,
      tools: TOOLS,
      messages: [...conversationHistory, { role: "user", content: message }],
    })

    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    )
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    )

    const pendingActions = toolUseBlocks
      .map((block) => toPendingAction(block, lists ?? []))
      .filter((action): action is PendingAction => action !== null)

    const reply =
      textBlocks.map((block) => block.text).join("\n\n").trim() ||
      (pendingActions.length > 0
        ? "Här är ett förslag – godkänn det nedan om du vill lägga till det."
        : "Jag kunde tyvärr inte svara just nu.")

    await supabase.from("assistant_messages").insert([
      { family_id: familyId, user_id: profileId, role: "user", content: message },
      { family_id: familyId, user_id: profileId, role: "assistant", content: reply },
    ])

    return Response.json({ reply, pendingActions })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "Ogiltig ANTHROPIC_API_KEY." },
        { status: 500 }
      )
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "För många förfrågningar just nu – försök igen strax." },
        { status: 429 }
      )
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: "AI-assistenten kunde inte svara just nu." },
        { status: 502 }
      )
    }
    return Response.json({ error: "Något gick fel." }, { status: 500 })
  }
}
