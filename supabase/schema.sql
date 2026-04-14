create table if not exists site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

insert into site_content (id, content)
values ('global', '{}')
on conflict (id) do nothing;
