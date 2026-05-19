-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector"; -- For pgvector

-- ==============================================================================
-- 1. PROFILES & ROLES (Authentication & Authorization)
-- ==============================================================================

create table public.roles (
    id serial primary key,
    name varchar(50) unique not null,
    description text
);

create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name varchar(255),
    avatar_url text,
    status varchar(50) default 'offline',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.user_roles (
    user_id uuid references public.profiles(id) on delete cascade,
    role_id int references public.roles(id) on delete cascade,
    assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, role_id)
);

-- ==============================================================================
-- 2. REALTIME CHAT (Realtime Demo)
-- ==============================================================================

create table public.chat_rooms (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    is_private boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.messages (
    id uuid default uuid_generate_v4() primary key,
    room_id uuid references public.chat_rooms(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete set null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;

-- ==============================================================================
-- 3. E-COMMERCE (Transactions, JSONB, Constraints)
-- ==============================================================================

create table public.products (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    description text,
    price numeric(10, 2) not null check (price >= 0),
    stock int not null default 0 check (stock >= 0),
    attributes jsonb default '{}'::jsonb, -- JSONB demo
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    total_amount numeric(10, 2) not null default 0,
    status varchar(50) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete restrict not null,
    quantity int not null check (quantity > 0),
    price_at_time numeric(10, 2) not null check (price_at_time >= 0)
);

-- ==============================================================================
-- 4. AI & PGVECTOR (Semantic Search)
-- ==============================================================================

create table public.documents (
    id uuid default uuid_generate_v4() primary key,
    title varchar(255) not null,
    content text not null,
    embedding vector(384), -- Using local Xenova/all-MiniLM-L6-v2 which generates 384d vectors
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create HNSW index for fast vector search
create index on public.documents using hnsw (embedding vector_cosine_ops);

-- ==============================================================================
-- 5. SYSTEM & AUDIT (Triggers, Functions, Materialized Views)
-- ==============================================================================

create table public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    table_name varchar(255) not null,
    record_id uuid,
    action varchar(50) not null,
    old_data jsonb,
    new_data jsonb,
    changed_by uuid references auth.users(id),
    changed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.system_metrics (
    id serial primary key,
    cpu_usage numeric(5, 2),
    memory_usage numeric(5, 2),
    active_users int,
    recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.user_settings (
    user_id uuid references public.profiles(id) on delete cascade primary key,
    preferences jsonb default '{"theme": "system", "notifications": true}'::jsonb
);

-- ==============================================================================
-- 6. FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Trigger to automatically create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Assign default role 'user' (assuming ID 3 is 'user')
  insert into public.user_roles (user_id, role_id)
  values (new.id, (select id from public.roles where name = 'user' limit 1));
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Audit trigger function
create or replace function public.audit_trigger_func()
returns trigger as $$
begin
    if (TG_OP = 'DELETE') then
        insert into public.audit_logs (table_name, record_id, action, old_data, changed_by)
        values (TG_TABLE_NAME, old.id, 'DELETE', row_to_json(old), auth.uid());
        return old;
    elsif (TG_OP = 'UPDATE') then
        insert into public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        values (TG_TABLE_NAME, new.id, 'UPDATE', row_to_json(old), row_to_json(new), auth.uid());
        return new;
    elsif (TG_OP = 'INSERT') then
        insert into public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        values (TG_TABLE_NAME, new.id, 'INSERT', null, row_to_json(new), auth.uid());
        return new;
    end if;
    return null;
end;
$$ language plpgsql security definer;

create trigger audit_products_trigger
  after insert or update or delete on public.products
  for each row execute procedure public.audit_trigger_func();

-- Semantic Search Function (RPC)
create or replace function public.match_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title varchar,
  content text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.title,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Materialized View for Analytics
create materialized view public.daily_sales_analytics as
select 
    date_trunc('day', created_at) as sale_date,
    count(id) as total_orders,
    sum(total_amount) as total_revenue
from public.orders
where status = 'completed'
group by 1;

-- Unique Index on Materialized view to allow REFRESH CONCURRENTLY
create unique index on public.daily_sales_analytics (sale_date);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Profiles: Users can read all profiles, but only update their own
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Chat Rooms: Everyone can view and create
alter table public.chat_rooms enable row level security;
create policy "Chat rooms viewable by all" on public.chat_rooms for select using (true);
create policy "Authenticated users can create rooms" on public.chat_rooms for insert with check (auth.role() = 'authenticated');

-- Messages: Everyone can view, authenticated can insert
alter table public.messages enable row level security;
create policy "Messages viewable by all" on public.messages for select using (true);
create policy "Authenticated users can insert messages" on public.messages for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

-- Products: Everyone can view, only admin can insert/update
alter table public.products enable row level security;
create policy "Products viewable by all" on public.products for select using (true);

-- Function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where ur.user_id = auth.uid() and r.name = 'admin'
  );
$$ language sql security definer;

create policy "Admins can insert products" on public.products for insert with check (public.is_admin());
create policy "Admins can update products" on public.products for update using (public.is_admin());
create policy "Admins can delete products" on public.products for delete using (public.is_admin());

-- Orders: Users can view own orders, admins can view all
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);

-- Order Items: Similar to orders
alter table public.order_items enable row level security;
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
create policy "Users can create order items" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
