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
