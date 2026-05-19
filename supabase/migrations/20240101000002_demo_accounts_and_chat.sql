-- Redesign Realtime Chat for 1-1 Messaging
drop publication if exists supabase_realtime;
create publication supabase_realtime;

-- Drop old chat tables
drop table if exists public.messages cascade;
drop table if exists public.chat_rooms cascade;

-- Create direct_messages table
create table public.direct_messages (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    receiver_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for direct messages
alter table public.direct_messages enable row level security;

-- Create policies for direct messages (Only sender and receiver can view)
create policy "Users can view their own direct messages"
on public.direct_messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
on public.direct_messages for insert
with check (auth.uid() = sender_id);

-- Enable realtime for direct_messages
alter publication supabase_realtime add table public.direct_messages;

-- ==============================================================================
-- DEMO ACCOUNTS CREATION MOVED TO seed.sql
-- ==============================================================================
