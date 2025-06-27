create table if not exists public.api_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null,
  api_key text not null,
  created_at timestamp with time zone default now()
); 