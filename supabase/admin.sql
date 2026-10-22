-- Run after schema.sql and features.sql. Restrictive policies also constrain older permissive policies.
-- Public guests can read published invitations; all editor access additionally requires an admin grant.
drop policy if exists "Admin guard invitation reads" on public.invitations;
create policy "Admin guard invitation reads" on public.invitations as restrictive for select to authenticated using(published or (public.is_invitation_admin() and owner_id=(select auth.uid())));
drop policy if exists "Admin guard invitation inserts" on public.invitations;
create policy "Admin guard invitation inserts" on public.invitations as restrictive for insert to authenticated with check(public.is_invitation_admin() and owner_id=(select auth.uid()));
drop policy if exists "Admin guard invitation updates" on public.invitations;
create policy "Admin guard invitation updates" on public.invitations as restrictive for update to authenticated using(public.is_invitation_admin() and owner_id=(select auth.uid())) with check(public.is_invitation_admin() and owner_id=(select auth.uid()));
drop policy if exists "Admin guard invitation deletes" on public.invitations;
create policy "Admin guard invitation deletes" on public.invitations as restrictive for delete to authenticated using(public.is_invitation_admin() and owner_id=(select auth.uid()));

drop policy if exists "Admin guard guests" on public.invitation_guests;
create policy "Admin guard guests" on public.invitation_guests as restrictive for all to authenticated
 using(public.is_invitation_admin() and exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())))
 with check(public.is_invitation_admin() and exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())));
drop policy if exists "Admin guard visits" on public.invitation_visits;
create policy "Admin guard visits" on public.invitation_visits as restrictive for all to authenticated
 using(public.is_invitation_admin() and exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())))
 with check(public.is_invitation_admin() and exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())));
drop policy if exists "Admin guard wishes" on public.invitation_wishes;
create policy "Admin guard wishes" on public.invitation_wishes as restrictive for all to authenticated
 using(public.is_invitation_admin() and exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())))
 with check(public.is_invitation_admin() and exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid())));

drop policy if exists "Admin guard wedding storage" on storage.objects;
create policy "Admin guard wedding storage" on storage.objects as restrictive for all to authenticated
 using(bucket_id not in ('wedding-assets','wedding-audio') or (public.is_invitation_admin() and (storage.foldername(name))[1]=(select auth.uid())::text))
 with check(bucket_id not in ('wedding-assets','wedding-audio') or (public.is_invitation_admin() and (storage.foldername(name))[1]=(select auth.uid())::text));
drop policy if exists "No anonymous wedding storage mutations" on storage.objects;
create policy "No anonymous wedding storage mutations" on storage.objects as restrictive for all to anon
 using(bucket_id not in ('wedding-assets','wedding-audio')) with check(bucket_id not in ('wedding-assets','wedding-audio'));
-- Public object URLs remain readable so invited guests can see photos and hear music.
notify pgrst,'reload schema';
