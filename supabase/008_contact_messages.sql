create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  reason text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','read','resolved','spam')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_status_created_at
  on public.contact_messages (status, created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "Public can submit contact messages" on public.contact_messages;

create policy "Public can submit contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    length(trim(first_name)) between 1 and 100
    and length(trim(last_name)) between 1 and 100
    and length(trim(email)) between 3 and 320
    and length(trim(reason)) between 1 and 100
    and length(trim(message)) between 1 and 5000
  );

create or replace function public.set_contact_messages_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contact_messages_updated_at on public.contact_messages;

create trigger contact_messages_updated_at
before update on public.contact_messages
for each row
execute function public.set_contact_messages_updated_at();
