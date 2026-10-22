-- Run after schema.sql. Safe to rerun; no existing invitation data is removed.
create table if not exists public.invitation_guests (
 id uuid primary key default gen_random_uuid(), invitation_id uuid not null references public.invitations(id) on delete cascade,
 public_token uuid not null unique default gen_random_uuid(), name text not null check(length(btrim(name)) between 1 and 120),
 group_name text not null default '' check(length(group_name)<=120), phone text not null default '' check(length(phone)<=40),
 email text not null default '' check(length(email)<=254), max_party int not null default 1 check(max_party between 1 and 20),
 party_size int not null default 1 check(party_size between 0 and 20), rsvp text not null default 'pending' check(rsvp in ('pending','attending','declined')),
 sent boolean not null default false, last_opened_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists invitation_guests_invite_idx on public.invitation_guests(invitation_id);
alter table public.invitation_guests enable row level security;
revoke all on public.invitation_guests from anon;
grant select,insert,update,delete on public.invitation_guests to authenticated;
drop policy if exists "Owner manages guests" on public.invitation_guests;
create policy "Owner manages guests" on public.invitation_guests for all to authenticated
 using(exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())))
 with check(exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())));

create table if not exists public.invitation_visits (
 id uuid primary key, invitation_id uuid not null references public.invitations(id) on delete cascade,
 visitor_id uuid not null, guest_id uuid references public.invitation_guests(id) on delete set null, created_at timestamptz not null default now()
);
create index if not exists invitation_visits_invite_idx on public.invitation_visits(invitation_id,created_at);
create index if not exists invitation_visits_guest_idx on public.invitation_visits(guest_id);
alter table public.invitation_visits enable row level security;
revoke all on public.invitation_visits from anon,authenticated;
grant select on public.invitation_visits to authenticated;
drop policy if exists "Owner reads visits" on public.invitation_visits;
create policy "Owner reads visits" on public.invitation_visits for select to authenticated
 using(exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())));

create table if not exists public.invitation_wishes (
 id uuid primary key default gen_random_uuid(), invitation_id uuid not null references public.invitations(id) on delete cascade,
 visitor_id uuid not null, guest_name text not null check(length(btrim(guest_name)) between 1 and 120),
 message text not null check(length(btrim(message)) between 3 and 2000), owner_reply text not null default '' check(length(owner_reply)<=2000),
 approved boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists invitation_wishes_invite_idx on public.invitation_wishes(invitation_id,created_at);
alter table public.invitation_wishes enable row level security;
revoke all on public.invitation_wishes from anon,authenticated;
grant select,delete on public.invitation_wishes to authenticated;
grant update(approved,owner_reply) on public.invitation_wishes to authenticated;
drop policy if exists "Owner reads wishes" on public.invitation_wishes;
drop policy if exists "Owner replies to wishes" on public.invitation_wishes;
drop policy if exists "Owner removes wishes" on public.invitation_wishes;
create policy "Owner reads wishes" on public.invitation_wishes for select to authenticated using(exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())));
create policy "Owner replies to wishes" on public.invitation_wishes for update to authenticated using(exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid()))) with check(exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())));
create policy "Owner removes wishes" on public.invitation_wishes for delete to authenticated using(exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())));

create or replace function public.record_invitation_visit(p_invitation_id uuid,p_visit_id uuid,p_visitor_id uuid,p_guest_token uuid default null)
returns void language plpgsql security definer set search_path='' as $$
declare guest uuid;
begin
 if p_visitor_id is null or p_visit_id is null or not exists(select 1 from public.invitations i where i.id=p_invitation_id and i.published and i.document#>'{features,analytics}'='true'::jsonb) then return; end if;
 select g.id into guest from public.invitation_guests g where g.invitation_id=p_invitation_id and g.public_token=p_guest_token;
 insert into public.invitation_visits(id,invitation_id,visitor_id,guest_id) values(p_visit_id,p_invitation_id,p_visitor_id,guest) on conflict(id) do nothing;
 if guest is not null then update public.invitation_guests set last_opened_at=now() where id=guest; end if;
end $$;

create or replace function public.public_invitation_guest(p_invitation_id uuid,p_guest_token uuid)
returns table(name text,rsvp text,party_size int,max_party int) language sql stable security definer set search_path='' as $$
 select g.name,g.rsvp,g.party_size,g.max_party from public.invitation_guests g join public.invitations i on i.id=g.invitation_id
 where i.id=p_invitation_id and i.published and g.public_token=p_guest_token;
$$;
create or replace function public.respond_invitation(p_invitation_id uuid,p_guest_token uuid,p_status text,p_party_size int)
returns void language plpgsql security definer set search_path='' as $$
declare guest public.invitation_guests;
begin
 select g.* into guest from public.invitation_guests g join public.invitations i on i.id=g.invitation_id where i.id=p_invitation_id and i.published and i.document#>'{features,rsvp}'='true'::jsonb and g.public_token=p_guest_token;
 if guest.id is null then raise exception 'Liên kết xác nhận không hợp lệ hoặc chưa được bật.' using errcode='22023'; end if;
 if p_status is null or p_status not in ('attending','declined') or p_party_size is null or p_party_size<1 or p_party_size>guest.max_party then raise exception 'Số người tham dự chưa hợp lệ.' using errcode='22023'; end if;
 update public.invitation_guests set rsvp=p_status,party_size=case when p_status='declined' then 0 else p_party_size end where id=guest.id;
end $$;
create or replace function public.submit_invitation_wish(p_invitation_id uuid,p_visitor_id uuid,p_name text,p_message text)
returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if p_visitor_id is null or p_name is null or length(btrim(p_name)) not between 1 and 120 or p_message is null or length(btrim(p_message)) not between 3 and 2000 then raise exception 'Nhập tên và lời chúc từ 3 đến 2000 ký tự.' using errcode='22023'; end if;
 if not exists(select 1 from public.invitations i where i.id=p_invitation_id and i.published and i.document#>'{features,wishes,enabled}'='true'::jsonb) then raise exception 'Hộp lời chúc chưa được mở.' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_invitation_id::text||p_visitor_id::text,0));
 if (select count(*) from public.invitation_wishes w where w.invitation_id=p_invitation_id and w.visitor_id=p_visitor_id and w.created_at>now()-interval '10 minutes')>=3 then raise exception 'Bạn đã gửi nhiều lời chúc. Hãy thử lại sau 10 phút.' using errcode='22023'; end if;
 insert into public.invitation_wishes(invitation_id,visitor_id,guest_name,message) values(p_invitation_id,p_visitor_id,btrim(p_name),btrim(p_message)) returning id into result;
 return result;
end $$;
create or replace function public.public_invitation_wishes(p_invitation_id uuid,p_limit int default 20,p_offset int default 0)
returns table(id uuid,guest_name text,message text,owner_reply text,created_at timestamptz) language sql stable security definer set search_path='' as $$
 select w.id,w.guest_name,w.message,w.owner_reply,w.created_at from public.invitation_wishes w join public.invitations i on i.id=w.invitation_id
 where i.id=p_invitation_id and i.published and w.approved and i.document#>'{features,wishes,enabled}'='true'::jsonb
 order by w.created_at desc,w.id limit greatest(1,least(p_limit,100)) offset greatest(0,least(p_offset,10000));
$$;
create or replace function public.owner_invitation_stats(p_invitation_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.is_invitation_admin() or not exists(select 1 from public.invitations i where i.id=p_invitation_id and i.owner_id=(select auth.uid())) then raise exception 'Hãy lưu thiệp vào tài khoản của bạn trước.' using errcode='42501'; end if;
 return jsonb_build_object(
 'visits',(select count(*) from public.invitation_visits where invitation_id=p_invitation_id),
 'visitors',(select count(distinct visitor_id) from public.invitation_visits where invitation_id=p_invitation_id),
 'guests',(select count(*) from public.invitation_guests where invitation_id=p_invitation_id),
 'attending',(select count(*) from public.invitation_guests where invitation_id=p_invitation_id and rsvp='attending'),
 'declined',(select count(*) from public.invitation_guests where invitation_id=p_invitation_id and rsvp='declined'),
 'people',(select coalesce(sum(party_size),0) from public.invitation_guests where invitation_id=p_invitation_id and rsvp='attending'),
 'wishes',(select count(*) from public.invitation_wishes where invitation_id=p_invitation_id),
 'pendingWishes',(select count(*) from public.invitation_wishes where invitation_id=p_invitation_id and not approved));
end $$;

revoke all on function public.record_invitation_visit(uuid,uuid,uuid,uuid),public.public_invitation_guest(uuid,uuid),public.respond_invitation(uuid,uuid,text,int),public.submit_invitation_wish(uuid,uuid,text,text),public.public_invitation_wishes(uuid,int,int),public.owner_invitation_stats(uuid) from public,anon,authenticated;
grant execute on function public.record_invitation_visit(uuid,uuid,uuid,uuid),public.public_invitation_guest(uuid,uuid),public.respond_invitation(uuid,uuid,text,int),public.submit_invitation_wish(uuid,uuid,text,text),public.public_invitation_wishes(uuid,int,int) to anon,authenticated;
grant execute on function public.owner_invitation_stats(uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('wedding-audio','wedding-audio',true,20971520,array['audio/mpeg','audio/mp4','audio/aac','audio/wav','audio/x-wav','audio/ogg','audio/webm']) on conflict(id) do nothing;
drop policy if exists "Owner uploads wedding audio" on storage.objects;
drop policy if exists "Owner reads wedding audio" on storage.objects;
drop policy if exists "Owner deletes wedding audio" on storage.objects;
create policy "Owner uploads wedding audio" on storage.objects for insert to authenticated with check(bucket_id='wedding-audio' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Owner reads wedding audio" on storage.objects for select to authenticated using(bucket_id='wedding-audio' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Owner deletes wedding audio" on storage.objects for delete to authenticated using(bucket_id='wedding-audio' and (storage.foldername(name))[1]=(select auth.uid())::text);
notify pgrst,'reload schema';
