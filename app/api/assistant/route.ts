import Anthropic from "@anthropic-ai/sdk"

import { createClient } from "@/lib/supabase/server"

// OBS: CLAUDE.md:s ursprungliga exempel angav modellen "claude-sonnet-4-6".
// Den strängen är inaktuell – aktuell modellrekommendation är "claude-opus-5".
const MODEL = "claude-opus-5"
const HISTORY_LIMIT = 20

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

  const [
    { data: events },
    { data: items },
    { data: lists },
    { data: pets },
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
    supabase.from("lists").select("id, title").eq("family_id", familyId),
    supabase
      .from("pets")
      .select("name, species, breed, current_medication")
      .eq("family_id", familyId),
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

  const systemContext = `Du är familjens assistent för "Familjen"-appen. Du pratar med ${
    profile?.display_name ?? "en familjemedlem"
  }.
Kommande händelser: ${JSON.stringify(events ?? [])}
Öppna listor: ${JSON.stringify(openItems)}
Husdjur: ${JSON.stringify(pets ?? [])}
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
      messages: [...conversationHistory, { role: "user", content: message }],
    })

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text"
    )
    const reply = textBlock?.text ?? "Jag kunde tyvärr inte svara just nu."

    await supabase.from("assistant_messages").insert([
      { family_id: familyId, user_id: profileId, role: "user", content: message },
      { family_id: familyId, user_id: profileId, role: "assistant", content: reply },
    ])

    return Response.json({ reply })
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
