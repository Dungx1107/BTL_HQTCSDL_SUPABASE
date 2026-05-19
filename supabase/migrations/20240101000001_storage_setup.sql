-- Set up Storage for Supabase Ultimate Showcase

insert into storage.buckets (id, name, public)
values ('public-files', 'public-files', true)
on conflict (id) do nothing;

-- RLS Policies for Storage
-- Allow public access to view files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'public-files' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload"
on storage.objects for insert
with check ( bucket_id = 'public-files' and auth.role() = 'authenticated' );

-- Allow users to delete their own files
create policy "Users can delete own files"
on storage.objects for delete
using ( bucket_id = 'public-files' and auth.uid() = owner );
