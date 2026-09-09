-- Skapar automatiskt en profiles-rad (utan family_id) när en ny
-- auth.users-rad skapas, oavsett om man loggar in via magic link eller
-- Google. Onboarding-flödet (skapa/gå med i familj) fyller sedan i
-- family_id på den här raden.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
