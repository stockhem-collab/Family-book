-- Låter en familjemedlem (profiles-rad) existera utan ett eget
-- inloggningskonto – t.ex. för barn som en admin lägger till manuellt.
--
-- profiles.id var tidigare alltid = auth.users.id. Nu genererar profiles.id
-- sitt eget värde, och den nya kolumnen user_id länkar (valfritt) till ett
-- riktigt konto. Alla RLS-policyer som jämförde "profiles.id = auth.uid()"
-- måste därför uppdateras till "profiles.user_id = auth.uid()".

alter table profiles drop constraint if exists profiles_id_fkey;
alter table profiles alter column id set default gen_random_uuid();
alter table profiles add column user_id uuid unique references auth.users(id);

-- Befintliga profiler hade id = auth.users.id – bevara den kopplingen.
update profiles set user_id = id where user_id is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fallback_name text;
begin
  fallback_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    initcap(
      replace(replace(split_part(new.email, '@', 1), '.', ' '), '_', ' ')
    )
  );

  insert into public.profiles (user_id, display_name)
  values (new.id, fallback_name);
  return new;
end;
$$;

-- ============================================================
-- Omskrivna RLS-policyer (id = auth.uid() -> user_id = auth.uid())
-- ============================================================

drop policy if exists "Medlemmar kan se sin familj" on families;
create policy "Medlemmar kan se sin familj"
  on families for select
  using (id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Admin kan uppdatera sin familj" on families;
create policy "Admin kan uppdatera sin familj"
  on families for update
  using (
    id in (
      select family_id from profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Se egen profil eller familjens profiler" on profiles;
create policy "Se egen profil eller familjens profiler"
  on profiles for select
  using (
    user_id = auth.uid()
    or family_id in (select family_id from profiles where user_id = auth.uid())
  );

-- "Skapa egen profil" är inte längre meningsfull (id är inte auth.uid()
-- längre) – profiler skapas antingen av triggern ovan (security definer,
-- kringgår RLS) eller av en admin som lägger till en familjemedlem.
drop policy if exists "Skapa egen profil" on profiles;
create policy "Admin kan lägga till familjemedlemmar"
  on profiles for insert
  with check (
    family_id in (
      select family_id from profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Uppdatera egen profil eller admin uppdaterar familjen" on profiles;
create policy "Uppdatera egen profil eller admin uppdaterar familjen"
  on profiles for update
  using (
    user_id = auth.uid()
    or family_id in (
      select family_id from profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Familjen har tillgång till calendar_events" on calendar_events;
create policy "Familjen har tillgång till calendar_events"
  on calendar_events for all
  using (family_id in (select family_id from profiles where user_id = auth.uid()))
  with check (family_id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Familjen har tillgång till lists" on lists;
create policy "Familjen har tillgång till lists"
  on lists for all
  using (family_id in (select family_id from profiles where user_id = auth.uid()))
  with check (family_id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Familjen har tillgång till list_items" on list_items;
create policy "Familjen har tillgång till list_items"
  on list_items for all
  using (family_id in (select family_id from profiles where user_id = auth.uid()))
  with check (family_id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Familjen har tillgång till meal_plans" on meal_plans;
create policy "Familjen har tillgång till meal_plans"
  on meal_plans for all
  using (family_id in (select family_id from profiles where user_id = auth.uid()))
  with check (family_id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Familjen har tillgång till feed_posts" on feed_posts;
create policy "Familjen har tillgång till feed_posts"
  on feed_posts for all
  using (family_id in (select family_id from profiles where user_id = auth.uid()))
  with check (family_id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Familjen har tillgång till pets" on pets;
create policy "Familjen har tillgång till pets"
  on pets for all
  using (family_id in (select family_id from profiles where user_id = auth.uid()))
  with check (family_id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Familjen har tillgång till pet_vet_visits" on pet_vet_visits;
create policy "Familjen har tillgång till pet_vet_visits"
  on pet_vet_visits for all
  using (family_id in (select family_id from profiles where user_id = auth.uid()))
  with check (family_id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Familjen har tillgång till recurring_tasks" on recurring_tasks;
create policy "Familjen har tillgång till recurring_tasks"
  on recurring_tasks for all
  using (family_id in (select family_id from profiles where user_id = auth.uid()))
  with check (family_id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Familjen har tillgång till assistant_messages" on assistant_messages;
create policy "Familjen har tillgång till assistant_messages"
  on assistant_messages for all
  using (family_id in (select family_id from profiles where user_id = auth.uid()))
  with check (family_id in (select family_id from profiles where user_id = auth.uid()));

drop policy if exists "Familjen har tillgång till feed_comments" on feed_comments;
create policy "Familjen har tillgång till feed_comments"
  on feed_comments for all
  using (
    post_id in (
      select id from feed_posts
      where family_id in (select family_id from profiles where user_id = auth.uid())
    )
  )
  with check (
    post_id in (
      select id from feed_posts
      where family_id in (select family_id from profiles where user_id = auth.uid())
    )
  );
