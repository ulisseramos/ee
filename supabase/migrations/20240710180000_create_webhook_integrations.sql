create table if not exists webhook_integrations (
  user_id uuid references auth.users(id) not null primary key,
  webhook_url text not null,
  send_on_approved boolean not null default false,
  send_on_pending boolean not null default false
);

-- Habilita RLS
alter table webhook_integrations enable row level security;

-- Policy: Usuário pode gerenciar sua própria configuração
create policy "User can manage own webhook config"
  on webhook_integrations
  for all
  using (auth.uid() = user_id); 