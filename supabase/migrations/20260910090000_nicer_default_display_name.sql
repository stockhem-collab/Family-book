-- Vid inloggning via magisk länk (utan Google) fanns inget "full_name" i
-- raw_user_meta_data, så fallbacken blev den råa e-postens användardel
-- (t.ex. "anna.svensson87") – vilket ser ut som ett alias jämfört med
-- Google-inloggade som får sitt riktiga namn direkt. Snyggar till fallbacken
-- (byter . och _ mot mellanslag, versaliserar varje ord) istället.
--
-- Påverkar bara NYA inloggningar. Befintliga profiler kan redigera sitt
-- namn själva under Familj → sin profil → fliken "Mer".

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

  insert into public.profiles (id, display_name)
  values (new.id, fallback_name);
  return new;
end;
$$;
