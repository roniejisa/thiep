-- Administrator accounts are granted only through the SQL Editor / database owner.
create table if not exists public.invitation_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.invitation_admins enable row level security;
revoke all on public.invitation_admins from public,anon,authenticated;
create or replace function public.is_invitation_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.invitation_admins a where a.user_id=(select auth.uid()));
$$;
revoke all on function public.is_invitation_admin() from public,anon,authenticated;
grant execute on function public.is_invitation_admin() to authenticated;

-- Run once in the SQL Editor of your own Supabase project.
create table if not exists public.invitations (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null,
 document jsonb not null check (document->>'version' = '1'),
 published boolean not null default false,
 updated_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create index if not exists invitations_owner_idx on public.invitations(owner_id);
alter table public.invitations enable row level security;
grant select on public.invitations to anon, authenticated;
grant insert, update, delete on public.invitations to authenticated;
drop policy if exists "Owners read their invitations" on public.invitations;
create policy "Owners read their invitations" on public.invitations for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "Guests read published invitations" on public.invitations;
create policy "Guests read published invitations" on public.invitations for select to anon, authenticated using (published = true);
drop policy if exists "Owners create invitations" on public.invitations;
create policy "Owners create invitations" on public.invitations for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "Owners edit invitations" on public.invitations;
create policy "Owners edit invitations" on public.invitations for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "Owners delete invitations" on public.invitations;
create policy "Owners delete invitations" on public.invitations for delete to authenticated using ((select auth.uid()) = owner_id);
-- Public images are intended for guest invitations. Do not upload private material.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wedding-assets','wedding-assets',true,8388608,array['image/jpeg','image/png','image/webp']) on conflict (id) do nothing;
drop policy if exists "Owners upload wedding photos" on storage.objects;
create policy "Owners upload wedding photos" on storage.objects for insert to authenticated with check (bucket_id='wedding-assets' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Owners read photo metadata" on storage.objects;
create policy "Owners read photo metadata" on storage.objects for select to authenticated using (bucket_id='wedding-assets' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Owners delete wedding photos" on storage.objects;
create policy "Owners delete wedding photos" on storage.objects for delete to authenticated using (bucket_id='wedding-assets' and (storage.foldername(name))[1]=(select auth.uid())::text);
