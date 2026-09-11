-- Bugg: "det går bara att ta bort ett objekt i matplaneringen, nästa
-- fungerar inte". Orsak: saveMealPlan kollade om det redan fanns en rad
-- för dagen och gjorde sedan antingen update eller insert - två snabba
-- "Spara"-klick (eller en trög nätverksbegäran) kunde hinna köra det
-- kollet samtidigt och båda tro att raden saknades, så det skapades TVÅ
-- meal_plans-rader för samma dag. Sidan visar bara en av dem åt gången;
-- när man tog bort den visade raden dök den kvarvarande dubbletten upp
-- istället, vilket ser ut som att borttagningen av "nästa" misslyckas.
--
-- Städa bort ev. befintliga dubbletter (behåll den äldsta raden per
-- familj+dag) och lägg till en unik-regel så databasen aldrig tillåter
-- fler dubbletter - sedan byts check-sedan-spara ut mot en atomisk
-- upsert i appkoden.

delete from meal_plans a
using meal_plans b
where a.family_id = b.family_id
  and a.date = b.date
  and (
    a.created_at > b.created_at
    or (a.created_at = b.created_at and a.id > b.id)
  );

alter table meal_plans
  add constraint meal_plans_family_date_unique unique (family_id, date);
