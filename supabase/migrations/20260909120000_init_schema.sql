-- Familjen – initial schema + RLS
-- Se CLAUDE.md "Datamodell" för specifikationen denna migration följer.

-- ============================================================
-- Tabeller
-- ============================================================

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

-- ============================================================
-- Row Level Security
-- ============================================================

alter table families enable row level security;
alter table profiles enable row level security;
alter table calendar_events enable row level security;
alter table lists enable row level security;
alter table list_items enable row level security;
alter table meal_plans enable row level security;
alter table feed_posts enable row level security;
alter table feed_comments enable row level security;
alter table pets enable row level security;
alter table pet_vet_visits enable row level security;
alter table recurring_tasks enable row level security;
alter table assistant_messages enable row level security;

-- ---- families ----
-- Special: har inget eget family_id att jämföra mot, så egen policy-form.

create policy "Medlemmar kan se sin familj"
  on families for select
  using (id in (select family_id from profiles where id = auth.uid()));

create policy "Inloggade kan skapa en familj"
  on families for insert
  with check (auth.uid() is not null);

create policy "Admin kan uppdatera sin familj"
  on families for update
  using (
    id in (
      select family_id from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ---- profiles ----
-- Special: id är själva auth.uid(), family_id kan vara null innan man gått
-- med i en familj, så policyn måste även tillåta att se/skapa sin egen rad.

create policy "Se egen profil eller familjens profiler"
  on profiles for select
  using (
    id = auth.uid()
    or family_id in (select family_id from profiles where id = auth.uid())
  );

create policy "Skapa egen profil"
  on profiles for insert
  with check (id = auth.uid());

create policy "Uppdatera egen profil eller admin uppdaterar familjen"
  on profiles for update
  using (
    id = auth.uid()
    or family_id in (
      select family_id from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ---- Generellt mönster för alla family_id-tabeller ----
-- "en familjemedlem får bara se/ändra rader där family_id matchar sin egen
-- familj" (CLAUDE.md).

create policy "Familjen har tillgång till calendar_events"
  on calendar_events for all
  using (family_id in (select family_id from profiles where id = auth.uid()))
  with check (family_id in (select family_id from profiles where id = auth.uid()));

create policy "Familjen har tillgång till lists"
  on lists for all
  using (family_id in (select family_id from profiles where id = auth.uid()))
  with check (family_id in (select family_id from profiles where id = auth.uid()));

create policy "Familjen har tillgång till list_items"
  on list_items for all
  using (family_id in (select family_id from profiles where id = auth.uid()))
  with check (family_id in (select family_id from profiles where id = auth.uid()));

create policy "Familjen har tillgång till meal_plans"
  on meal_plans for all
  using (family_id in (select family_id from profiles where id = auth.uid()))
  with check (family_id in (select family_id from profiles where id = auth.uid()));

create policy "Familjen har tillgång till feed_posts"
  on feed_posts for all
  using (family_id in (select family_id from profiles where id = auth.uid()))
  with check (family_id in (select family_id from profiles where id = auth.uid()));

create policy "Familjen har tillgång till pets"
  on pets for all
  using (family_id in (select family_id from profiles where id = auth.uid()))
  with check (family_id in (select family_id from profiles where id = auth.uid()));

create policy "Familjen har tillgång till pet_vet_visits"
  on pet_vet_visits for all
  using (family_id in (select family_id from profiles where id = auth.uid()))
  with check (family_id in (select family_id from profiles where id = auth.uid()));

create policy "Familjen har tillgång till recurring_tasks"
  on recurring_tasks for all
  using (family_id in (select family_id from profiles where id = auth.uid()))
  with check (family_id in (select family_id from profiles where id = auth.uid()));

create policy "Familjen har tillgång till assistant_messages"
  on assistant_messages for all
  using (family_id in (select family_id from profiles where id = auth.uid()))
  with check (family_id in (select family_id from profiles where id = auth.uid()));

-- ---- feed_comments ----
-- Special: saknar egen family_id-kolumn, går via feed_posts.

create policy "Familjen har tillgång till feed_comments"
  on feed_comments for all
  using (
    post_id in (
      select id from feed_posts
      where family_id in (select family_id from profiles where id = auth.uid())
    )
  )
  with check (
    post_id in (
      select id from feed_posts
      where family_id in (select family_id from profiles where id = auth.uid())
    )
  );
