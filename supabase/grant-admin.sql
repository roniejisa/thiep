-- First create your email/password user in Supabase Dashboard > Authentication > Users.
-- Replace the email below, then run this file in SQL Editor. Never expose a database/service-role key to the browser.
do $$
declare admin_id uuid;
begin
 select id into admin_id from auth.users where lower(email)=lower('YOUR_ADMIN_EMAIL@example.com');
 if admin_id is null then raise exception 'Replace YOUR_ADMIN_EMAIL@example.com with an existing Authentication user email.'; end if;
 insert into public.invitation_admins(user_id) values(admin_id) on conflict(user_id) do nothing;
end $$;
-- Revoke later in SQL Editor: delete from public.invitation_admins where user_id='AUTH_USER_UUID';
