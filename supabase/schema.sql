-- Tabulka pro záznamy. Spusť v Supabase → SQL Editor.
create table if not exists public.entries (
  id         text primary key,
  m          int2  not null,
  date       text  not null,
  amount     numeric not null,
  updated_at timestamptz not null default now()
);

-- Zapni RLS a nepřidávej žádné public policies:
-- tabulka tak zůstane zvenčí nepřístupná. Čte/zapisuje do ní
-- výhradně serverless funkce /api/entries přes service_role klíč.
alter table public.entries enable row level security;

-- Při vypnutém "Automatically expose new tables" nemá service_role
-- automaticky práva na nové tabulky. Náš backend (secret klíč = service_role)
-- je proto potřebuje udělit ručně. Anon/authenticated nedostávají nic,
-- takže veřejný přístup zůstává díky RLS zablokovaný.
grant select, insert, update, delete on table public.entries to service_role;
