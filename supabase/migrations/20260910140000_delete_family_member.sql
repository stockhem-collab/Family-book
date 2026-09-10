-- Det gick att lägga till en familjemedlem (platshållare) och slå ihop
-- dubbletter, men aldrig ta bort någon – t.ex. om man lade till fel person
-- av misstag, eller någon flyttar och lämnar familjen.
--
-- Precis som merge_profile_into körs det här som en security definer-
-- funktion istället för en RLS-policy + vanlig delete: profiles.id
-- refereras från flera tabeller (calendar_events, lists, list_items,
-- feed_posts, feed_comments, recurring_tasks) utan "on delete cascade",
-- så ett direkt delete-anrop skulle bara krascha med ett
-- foreign-key-fel. Funktionen nollställer istället kopplingen till
-- personen (och tar bort ur calendar_events.member_ids) innan raden tas
-- bort, så all annan data (händelsen, listposten, inlägget …) finns kvar.

create or replace function public.delete_family_member(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_profile_id uuid;
  caller_family_id uuid;
  is_admin boolean;
  target_family_id uuid;
begin
  select id, family_id, (role = 'admin')
    into caller_profile_id, caller_family_id, is_admin
    from profiles where user_id = auth.uid();

  if not coalesce(is_admin, false) then
    raise exception 'Bara en admin kan ta bort en familjemedlem.';
  end if;

  if target_profile_id = caller_profile_id then
    raise exception 'Du kan inte ta bort din egen profil här.';
  end if;

  select family_id into target_family_id from profiles where id = target_profile_id;

  if target_family_id is null or target_family_id != caller_family_id then
    raise exception 'Profilen tillhör inte din familj.';
  end if;

  update calendar_events set created_by = null where created_by = target_profile_id;
  update calendar_events set drop_off_by = null where drop_off_by = target_profile_id;
  update calendar_events set pick_up_by = null where pick_up_by = target_profile_id;
  update calendar_events set member_ids = array_remove(member_ids, target_profile_id)
    where target_profile_id = any(member_ids);
  update lists set owner_id = null where owner_id = target_profile_id;
  update list_items set assigned_to = null where assigned_to = target_profile_id;
  update feed_posts set author_id = null where author_id = target_profile_id;
  update feed_comments set author_id = null where author_id = target_profile_id;
  update recurring_tasks set assigned_to = null where assigned_to = target_profile_id;
  delete from assistant_messages where user_id = target_profile_id;

  delete from profiles where id = target_profile_id;
end;
$$;

revoke all on function public.delete_family_member(uuid) from public;
grant execute on function public.delete_family_member(uuid) to authenticated;
