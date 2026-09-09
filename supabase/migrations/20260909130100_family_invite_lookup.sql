-- RLS på families tillåter bara medlemmar att se sin egen familj, så en
-- användare som ska gå med via kod kan inte slå upp familjenamnet med en
-- vanlig select innan de är medlemmar. Den här funktionen exponerar en
-- minimal, säker uppslagning (bara id + name, bara exakt kodmatchning) via
-- security definer, utan att öppna upp hela families-tabellen.

create or replace function public.get_family_by_invite_code(code text)
returns table (id uuid, name text)
language sql
security definer
set search_path = public
as $$
  select id, name from families where invite_code = code;
$$;

revoke all on function public.get_family_by_invite_code(text) from public;
grant execute on function public.get_family_by_invite_code(text) to authenticated;
