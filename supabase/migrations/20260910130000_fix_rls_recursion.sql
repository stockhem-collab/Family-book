-- "infinite recursion detected in policy for relation 'profiles'":
-- flera profiles-policyer (SELECT, samt de nya admin-kollarna på
-- INSERT/UPDATE från platshållarprofil-migrationen) innehöll var sin
-- "select ... from profiles where user_id = auth.uid()"-subfråga. Med
-- tillräckligt många sådana på samma tabell råkar Postgres varva runt i
-- cirklar när den ska räkna ut behörigheten för en rad.
--
-- Standardlösningen (som Supabase också rekommenderar för den här typen av
-- policy): lägg uppslagningen i en security definer-funktion. En sådan
-- funktion kringgår RLS för sina EGNA frågor (kör med funktionsägarens
-- rättigheter), så den kan läsa profiles utan att trigga samma policy igen.

create or replace function public.current_profile_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from profiles where user_id = auth.uid();
$$;

create or replace function public.current_family_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select family_id from profiles where user_id = auth.uid();
$$;

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role from profiles where user_id = auth.uid()) = 'admin',
    false
  );
$$;

revoke all on function public.current_profile_id() from public;
revoke all on function public.current_family_id() from public;
revoke all on function public.is_current_user_admin() from public;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_family_id() to authenticated;
grant execute on function public.is_current_user_admin() to authenticated;

-- ---- families ----

drop policy if exists "Medlemmar kan se sin familj" on families;
create policy "Medlemmar kan se sin familj"
  on families for select
  using (id = current_family_id());

drop policy if exists "Admin kan uppdatera sin familj" on families;
create policy "Admin kan uppdatera sin familj"
  on families for update
  using (id = current_family_id() and is_current_user_admin());

-- ---- profiles ----

drop policy if exists "Se egen profil eller familjens profiler" on profiles;
create policy "Se egen profil eller familjens profiler"
  on profiles for select
  using (user_id = auth.uid() or family_id = current_family_id());

drop policy if exists "Admin kan lägga till familjemedlemmar" on profiles;
create policy "Admin kan lägga till familjemedlemmar"
  on profiles for insert
  with check (family_id = current_family_id() and is_current_user_admin());

drop policy if exists "Uppdatera egen profil eller admin uppdaterar familjen" on profiles;
create policy "Uppdatera egen profil eller admin uppdaterar familjen"
  on profiles for update
  using (
    user_id = auth.uid()
    or (family_id = current_family_id() and is_current_user_admin())
  );

-- ---- Generellt mönster för family_id-tabellerna ----

drop policy if exists "Familjen har tillgång till calendar_events" on calendar_events;
create policy "Familjen har tillgång till calendar_events"
  on calendar_events for all
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

drop policy if exists "Familjen har tillgång till lists" on lists;
create policy "Familjen har tillgång till lists"
  on lists for all
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

drop policy if exists "Familjen har tillgång till list_items" on list_items;
create policy "Familjen har tillgång till list_items"
  on list_items for all
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

drop policy if exists "Familjen har tillgång till meal_plans" on meal_plans;
create policy "Familjen har tillgång till meal_plans"
  on meal_plans for all
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

drop policy if exists "Familjen har tillgång till feed_posts" on feed_posts;
create policy "Familjen har tillgång till feed_posts"
  on feed_posts for all
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

drop policy if exists "Familjen har tillgång till pets" on pets;
create policy "Familjen har tillgång till pets"
  on pets for all
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

drop policy if exists "Familjen har tillgång till pet_vet_visits" on pet_vet_visits;
create policy "Familjen har tillgång till pet_vet_visits"
  on pet_vet_visits for all
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

drop policy if exists "Familjen har tillgång till recurring_tasks" on recurring_tasks;
create policy "Familjen har tillgång till recurring_tasks"
  on recurring_tasks for all
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

drop policy if exists "Familjen har tillgång till assistant_messages" on assistant_messages;
create policy "Familjen har tillgång till assistant_messages"
  on assistant_messages for all
  using (family_id = current_family_id())
  with check (family_id = current_family_id());

drop policy if exists "Familjen har tillgång till feed_comments" on feed_comments;
create policy "Familjen har tillgång till feed_comments"
  on feed_comments for all
  using (
    post_id in (select id from feed_posts where family_id = current_family_id())
  )
  with check (
    post_id in (select id from feed_posts where family_id = current_family_id())
  );
