-- Claim-flöde för platshållarprofiler: när en person som redan har en
-- platshållarprofil (utan konto, t.ex. ett barn en admin lade till) senare
-- loggar in själv, skapar signup-triggern en HELT NY profilrad (med sitt
-- eget konto men ingen historik). Den här funktionen låter en admin slå
-- ihop de två – all data som pekar på "duplicate"-profilen (händelser,
-- listposter, inlägg m.m.) flyttas över till platshållaren, som sedan får
-- kontot kopplat. Duplicate-raden tas bort.

create or replace function public.merge_profile_into(
  keep_profile_id uuid,
  duplicate_profile_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_family_id uuid;
  is_admin boolean;
  keep_family_id uuid;
  duplicate_family_id uuid;
  duplicate_user_id uuid;
begin
  select family_id, (role = 'admin') into caller_family_id, is_admin
  from profiles where user_id = auth.uid();

  if not coalesce(is_admin, false) then
    raise exception 'Bara en admin kan slå ihop profiler.';
  end if;

  select family_id into keep_family_id from profiles where id = keep_profile_id;
  select family_id, user_id into duplicate_family_id, duplicate_user_id
    from profiles where id = duplicate_profile_id;

  if keep_family_id is null or keep_family_id != caller_family_id
     or duplicate_family_id is null or duplicate_family_id != caller_family_id then
    raise exception 'Båda profilerna måste tillhöra din familj.';
  end if;

  if duplicate_user_id is null then
    raise exception 'Den profil som väljs bort måste ha ett eget konto kopplat.';
  end if;

  update calendar_events set created_by = keep_profile_id
    where created_by = duplicate_profile_id;
  update calendar_events set drop_off_by = keep_profile_id
    where drop_off_by = duplicate_profile_id;
  update calendar_events set pick_up_by = keep_profile_id
    where pick_up_by = duplicate_profile_id;
  update calendar_events set member_ids = array_replace(member_ids, duplicate_profile_id, keep_profile_id)
    where duplicate_profile_id = any(member_ids);
  update lists set owner_id = keep_profile_id
    where owner_id = duplicate_profile_id;
  update list_items set assigned_to = keep_profile_id
    where assigned_to = duplicate_profile_id;
  update feed_posts set author_id = keep_profile_id
    where author_id = duplicate_profile_id;
  update feed_comments set author_id = keep_profile_id
    where author_id = duplicate_profile_id;
  update recurring_tasks set assigned_to = keep_profile_id
    where assigned_to = duplicate_profile_id;
  update assistant_messages set user_id = keep_profile_id
    where user_id = duplicate_profile_id;

  update profiles set user_id = duplicate_user_id where id = keep_profile_id;
  delete from profiles where id = duplicate_profile_id;
end;
$$;

revoke all on function public.merge_profile_into(uuid, uuid) from public;
grant execute on function public.merge_profile_into(uuid, uuid) to authenticated;
