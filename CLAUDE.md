# Projekt: Familjen

Svensk familjeorganisatör – PWA. Kärnprincip: startsidan ska direkt svara på
"vad behöver vi ha koll på just nu?", och allt ska gå snabbt att lägga till
från mobilen.

## Stack – använd alltid detta, föreslå inte alternativ utan att fråga

- Next.js 14+, App Router, TypeScript
- Tailwind CSS + shadcn/ui
- Supabase: Postgres, Auth (magic link + Google), Realtime, Storage
- Anthropic Claude API för AI-assistent (server-side, aldrig i klienten)
- PWA: next-pwa eller manuell service worker, Web Push för notiser

## Projektstruktur att skapa

```
app/
├── (auth)/login/page.tsx
├── (auth)/join/[inviteCode]/page.tsx
├── (main)/layout.tsx              # bottennav: Hem/Planering/Listor/Familj/Assistent
├── (main)/page.tsx                # Hem – överblick
├── (main)/planering/page.tsx
├── (main)/listor/page.tsx         # flikar: Handla/Att göra/Packa/Önskelista
├── (main)/familj/page.tsx
├── (main)/familj/[memberId]/page.tsx
├── (main)/assistent/page.tsx
├── (main)/mat/page.tsx
└── api/assistant/route.ts
components/{ui,home,planning,lists,family,assistant}/
lib/supabase/{client,server,middleware}.ts
lib/ai/{claude,tools,promptContext}.ts
supabase/migrations/
public/manifest.json
```

## Datamodell (Supabase) – kör som migrationer i `supabase/migrations/`

Alla tabeller utom `families`/`profiles` har `family_id` + RLS: en
familjemedlem får bara se/ändra rader där `family_id` matchar sin egen familj
(policy-mönster: `family_id in (select family_id from profiles where id = auth.uid())`).
Sätt upp RLS för varje tabell direkt när du skapar den, inte som separat steg efteråt.

```sql
create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id),
  family_id uuid references families(id),
  display_name text not null,
  role text default 'member',            -- 'admin' | 'member' | 'child'
  birth_date date,
  avatar_url text,
  clothing_size text,
  shoe_size text,
  favorite_food text,
  dislikes text,
  hobbies text,
  created_at timestamptz default now()
);

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id),
  title text not null,
  category text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  member_ids uuid[] default '{}',
  drop_off_by uuid references profiles(id),
  pick_up_by uuid references profiles(id),
  bring_items text,
  is_recurring boolean default false,
  recurrence_rule text,                  -- iCal RRULE
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table lists (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id),
  type text not null,                    -- 'shopping' | 'todo' | 'packing' | 'wishlist'
  title text not null,
  owner_id uuid references profiles(id),
  created_at timestamptz default now()
);

create table list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade,
  family_id uuid references families(id),
  label text not null,
  is_done boolean default false,
  assigned_to uuid references profiles(id),
  price numeric,
  priority text,                         -- 'vill_valdigt_garna' | 'bra_present' | 'ide'
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id),
  date date not null,
  meal_title text not null,
  recipe_url text,
  created_at timestamptz default now()
);

create table feed_posts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id),
  author_id uuid references profiles(id),
  text_content text,
  image_url text,
  created_at timestamptz default now()
);

create table feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references feed_posts(id) on delete cascade,
  author_id uuid references profiles(id),
  text_content text not null,
  created_at timestamptz default now()
);

create table pets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id),
  name text not null,
  species text,
  breed text,
  birth_date date,
  avatar_url text,
  chip_number text,
  insurance_provider text,
  insurance_policy_number text,
  weight_kg numeric,
  current_medication text,
  created_at timestamptz default now()
);

create table pet_vet_visits (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  family_id uuid references families(id),
  visit_date date not null,
  visit_type text,                       -- 'vaccination' | 'kontroll' | 'operation' | 'ovrigt'
  notes text,
  next_reminder_date date,
  weight_kg numeric,
  created_at timestamptz default now()
);

create table recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id),
  title text not null,
  assigned_to uuid references profiles(id),
  recurrence_rule text not null,
  category text,
  next_due_date date,
  created_at timestamptz default now()
);

create table assistant_messages (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id),
  user_id uuid references profiles(id),
  role text not null,                    -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz default now()
);
```

## Skärmar → funktioner

**Hem (`/`)** – hälsning + datum, avatarrad, "Idag"-lista (dagens
`calendar_events` + öppna `list_items`), räknare "X kvar", `feed_posts`-flöde,
flytande "+"-knapp med snabbmeny.

**Planering (`/planering`)** – veckoväljare, dagsagenda grupperad per datum,
"+" skapar `calendar_events`-rad med `member_ids`.

**Listor (`/listor`)** – flikar Handla/Att göra/Packa/Önskelista, filtrerar
`lists.type`. Handla grupperas per `lists.title` (butik/kategori). Visa vem
som äger/lagt till varje `list_items`-rad.

**Familj (`/familj/[memberId]`)** – header med bild/namn/ålder (från
`birth_date`), flikar Info/Aktiviteter/Preferenser/Önskelista/Mer, "Kommande"
visar nästa händelse + dagar kvar till födelsedag.

**Assistent (`/assistent`)** – chatt mot `/api/assistant`. Servern hämtar
kommande `calendar_events`, öppna `list_items` och `pets`-data, skickar som
`system`-kontext till Claude API. Spara historik i `assistant_messages`.

**Mat (`/mat`)** – veckovy, en `meal_plans`-rad per dag, knapp för att
generera `list_items` från ingredienser (v2).

## AI-assistent – serverroute-mönster

```ts
// app/api/assistant/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { message } = await req.json()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('family_id, display_name').eq('id', user!.id).single()

  const [{ data: events }, { data: items }, { data: pets }] = await Promise.all([
    supabase.from('calendar_events').select('*').eq('family_id', profile!.family_id)
      .gte('starts_at', new Date().toISOString()).order('starts_at').limit(20),
    supabase.from('list_items').select('*, lists(type,title)')
      .eq('family_id', profile!.family_id).eq('is_done', false),
    supabase.from('pets').select('*').eq('family_id', profile!.family_id),
  ])

  const systemContext = `Du är familjens assistent för "Familjen"-appen.
Kommande händelser: ${JSON.stringify(events)}
Öppna listor: ${JSON.stringify(items)}
Husdjur: ${JSON.stringify(pets)}
Svara kort, varmt och konkret på svenska.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemContext,
      messages: [{ role: 'user', content: message }],
    }),
  })
  const data = await response.json()
  return Response.json({ reply: data.content[0].text })
}
```

Bygg inte fler serverroutes för AI förrän grundflödet ovan funkar och är testat.

**v1.1, bygg inte i MVP:**
- Naturligt-språk-tillägg: fritextruta i "+"-menyn → `/api/quick-add` tolkar
  med Claude tool-use till strukturerad JSON (t.ex. `calendar_event` med
  `starts_at`, `member_ids`, `drop_off_by`) → visa bekräftelsekort innan save.
- Morgonbrief: Supabase Edge Function (cron) som återanvänder logiken ovan och
  pushar en kort sammanfattning via Web Push.

## Design – pastellpalett

```css
:root {
  --color-primary: #7C6FEA;
  --color-accent-pink: #F5A9C6;
  --color-accent-blue: #8FD3E8;
  --color-accent-yellow: #F6D186;
  --color-accent-green: #9FE0B5;
  --color-bg: #FAFAFC;
  --color-card: #FFFFFF;
  --color-text: #2A2A38;
  --color-text-muted: #8B8B99;
  --radius-card: 20px;
}
```
Runda avatarer, mjuka skuggor, pastellfärgade kategori-ikoner. Använd dessa
CSS-variabler konsekvent istället för hårdkodade hex-värden i komponenter.

## Byggordning – följ denna ordning, en punkt i taget

1. `npx create-next-app@latest` (TypeScript, Tailwind, App Router) + shadcn/ui
2. Koppla Supabase-projekt, kör migrationerna ovan, generera typer
   (`supabase gen types typescript`)
3. Auth-flöde: inloggning + "skapa familj" / "gå med via kod"
4. Bottennavigation + layout (5 flikar)
5. Hem-vyn: börja med mockdata, koppla sedan till Supabase-queries
6. Listor (viktigast för dagligt bruk)
7. Planering/kalender
8. Familjeprofiler
9. Matplanering
10. AI-assistent (kräver `ANTHROPIC_API_KEY`)
11. PWA-manifest + service worker
12. Realtid: Supabase Realtime-prenumerationer på `list_items` och
    `calendar_events`

**MVP = punkt 1–10 utan v1.1-funktionerna ovan.** Fråga innan du börjar bygga
fotoalbum, ekonomi, skolinformation, packlistor för resor, receptbibliotek
med auto-import, eller stöd för flera fristående familjer — det är allt
uttryckligen efter MVP.

## Miljövariabler

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # endast server-side, exponera aldrig till klienten
ANTHROPIC_API_KEY=
```

## Arbetssätt

- Gå igenom byggordningen ett steg i taget, inte allt på en gång.
- Committa efter varje avslutad del med en egen commit.
- Fråga innan du avviker från stacken eller datamodellen ovan.
