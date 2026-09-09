-- Aktiverar Supabase Realtime (postgres_changes) för list_items och
-- calendar_events, så ändringar från andra familjemedlemmar dyker upp
-- direkt i appen utan manuell omladdning. RLS gäller fortfarande för vad
-- varje uppkopplad klient faktiskt får ta emot – detta styr bara vilka
-- tabeller som sänder ut ändringshändelser överhuvudtaget.

alter publication supabase_realtime add table list_items;
alter publication supabase_realtime add table calendar_events;
