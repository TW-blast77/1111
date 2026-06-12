-- Japan Trip Shopping Planner — Supabase schema
-- Enable: pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- USERS handled by supabase auth.users; profile extension:
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text default 'zh-Hant',
  plan text default 'free' check (plan in ('free','pro')),
  created_at timestamptz default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget numeric not null default 0,
  currency text not null default 'TWD' check (currency in ('TWD','JPY','USD')),
  travelers int not null default 1,
  luggage_size int not null default 24 check (luggage_size in (20,24,28,30)),
  created_at timestamptz default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_jp text,
  category text,
  address text,
  lat double precision,
  lng double precision,
  hours text,
  tax_free boolean default true,
  image_url text
);

create table if not exists shopping_lists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text default 'My List',
  created_at timestamptz default now()
);

create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  list_id uuid references shopping_lists(id) on delete set null,
  category text not null check (category in ('藥妝','電器','零食','美妝','服飾')),
  name text not null,
  brand text,
  price_jpy numeric not null default 0,
  quantity int not null default 1,
  weight_g numeric default 0,
  volume_cm3 numeric default 0,
  note text,
  store_id uuid references stores(id) on delete set null,
  image_url text,
  bought boolean default false,
  created_at timestamptz default now()
);

create table if not exists tax_rules (
  id uuid primary key default gen_random_uuid(),
  country text default 'JP',
  rate numeric not null default 0.10,
  threshold_jpy numeric not null default 5000,
  effective_from date not null,
  notes text
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade unique,
  total numeric not null default 0,
  currency text not null default 'TWD'
);

create table if not exists luggage (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  size_inch int not null,
  capacity_liters int not null,
  max_kg int not null
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('item','store','route')),
  target_id uuid not null,
  created_at timestamptz default now()
);

create table if not exists ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references trips(id) on delete cascade,
  kind text not null check (kind in ('shopping','budget','luggage','itinerary','souvenir')),
  prompt jsonb,
  response jsonb,
  created_at timestamptz default now()
);

create table if not exists itineraries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day int not null,
  schedule jsonb not null
);

create table if not exists shared_links (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  token text unique not null,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- Row Level Security
alter table profiles enable row level security;
alter table trips enable row level security;
alter table shopping_lists enable row level security;
alter table shopping_items enable row level security;
alter table budgets enable row level security;
alter table luggage enable row level security;
alter table favorites enable row level security;
alter table ai_recommendations enable row level security;
alter table itineraries enable row level security;
alter table shared_links enable row level security;

create policy "own profile" on profiles for all using (id = auth.uid());
create policy "own trips" on trips for all using (user_id = auth.uid());
create policy "own items" on shopping_items for all using (
  exists (select 1 from trips t where t.id = shopping_items.trip_id and t.user_id = auth.uid())
);
create policy "own lists" on shopping_lists for all using (
  exists (select 1 from trips t where t.id = shopping_lists.trip_id and t.user_id = auth.uid())
);
create policy "own favorites" on favorites for all using (user_id = auth.uid());
create policy "own ai" on ai_recommendations for all using (user_id = auth.uid());
