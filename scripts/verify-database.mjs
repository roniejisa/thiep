import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const db=new PGlite();await db.waitReady;
const owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222',invite='33333333-3333-4333-8333-333333333333',second='44444444-4444-4444-8444-444444444444',visitor='55555555-5555-4555-8555-555555555555';
await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth,public,storage to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;grant select,insert,delete on storage.objects to authenticated;
 create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;`);
const schema=await readFile('supabase/schema.sql','utf8'),features=await readFile('supabase/features.sql','utf8'),admin=await readFile('supabase/admin.sql','utf8');
await db.exec(schema);await db.exec(features);await db.exec(admin);await db.exec(schema);await db.exec(features);await db.exec(admin);
await db.query('insert into auth.users values($1),($2)',[owner,other]);
await db.query('insert into public.invitation_admins(user_id) values($1)',[owner]);
const document={version:1,features:{analytics:true,wishes:{enabled:true},rsvp:true}};
await db.query('insert into public.invitations(id,owner_id,title,document,published) values($1,$2,$3,$4,true),($5,$6,$3,$4,true)',[invite,owner,'Wedding',JSON.stringify(document),second,other]);
async function role(name,uid,callback){await db.exec('set role '+name);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);try{return await callback()}finally{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false)")}}
const guest=await role('authenticated',owner,async()=>{const result=await db.query('insert into public.invitation_guests(invitation_id,name,phone,email,max_party) values($1,$2,$3,$4,3) returning *',[invite,'Gia đình Hiếu','0901234567','hieu@example.com']);return result.rows[0]});
await role('authenticated',other,async()=>{assert.equal((await db.query('select * from public.invitation_guests')).rows.length,0);await assert.rejects(()=>db.query('insert into public.invitation_guests(invitation_id,name) values($1,$2)',[invite,'Not allowed']))});
await role('anon',null,async()=>{
 await assert.rejects(()=>db.query('select * from public.invitation_guests'));
 const result=await db.query('select * from public.public_invitation_guest($1,$2)',[invite,guest.public_token]);assert.deepEqual(Object.keys(result.rows[0]).sort(),['max_party','name','party_size','rsvp']);
 assert.equal((await db.query('select * from public.public_invitation_guest($1,$2)',[second,guest.public_token])).rows.length,0);
 const visit=crypto.randomUUID();await db.query('select public.record_invitation_visit($1,$2,$3,$4)',[invite,visit,visitor,guest.public_token]);await db.query('select public.record_invitation_visit($1,$2,$3,$4)',[invite,visit,visitor,guest.public_token]);
 await db.query('select public.record_invitation_visit($1,$2,$3,null)',[invite,crypto.randomUUID(),visitor]);
 await db.query('select public.respond_invitation($1,$2,$3,$4)',[invite,guest.public_token,'attending',3]);
 await assert.rejects(()=>db.query('select public.respond_invitation($1,$2,$3,$4)',[invite,guest.public_token,'attending',4]));
 await assert.rejects(()=>db.query('select public.respond_invitation($1,$2,$3,$4)',[second,guest.public_token,'attending',1]));
 await assert.rejects(()=>db.query('select public.owner_invitation_stats($1)',[invite]));
});
let wishId;
await role('anon',null,async()=>{
 const result=await db.query('select public.submit_invitation_wish($1,$2,$3,$4) as id',[invite,visitor,'Người bạn','Chúc hai bạn trăm năm hạnh phúc!']);wishId=result.rows[0].id;
 assert.equal((await db.query('select * from public.public_invitation_wishes($1)',[invite])).rows.length,0,'pending wishes stay private');
 await assert.rejects(()=>db.query('select * from public.invitation_wishes'));
 await assert.rejects(()=>db.query('select public.submit_invitation_wish($1,$2,$3,$4)',[invite,visitor,'','bad']));
 for(let i=0;i<2;i++)await db.query('select public.submit_invitation_wish($1,$2,$3,$4)',[invite,visitor,'Bạn','Hạnh phúc nhé '+i]);
 await assert.rejects(()=>db.query('select public.submit_invitation_wish($1,$2,$3,$4)',[invite,visitor,'Bạn','Too many wishes']));
});
await role('authenticated',other,async()=>{assert.equal((await db.query('select * from public.invitation_wishes')).rows.length,0);await assert.rejects(()=>db.query('select public.owner_invitation_stats($1)',[invite]));assert.equal((await db.query('update public.invitation_wishes set approved=true where id=$1 returning id',[wishId])).rows.length,0)});
await role('authenticated',owner,async()=>{
 await db.query('update public.invitation_wishes set approved=true,owner_reply=$1 where id=$2',['Cảm ơn bạn!',wishId]);
 const result=await db.query('select public.owner_invitation_stats($1) as stats',[invite]);const stats=result.rows[0].stats;assert.equal(stats.visits,2);assert.equal(stats.visitors,1);assert.equal(stats.people,3);assert.equal(stats.attending,1);assert.equal(stats.wishes,3);assert.equal(stats.pendingWishes,2);
 await db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['wedding-audio',owner+'/invite/music.mp3']);await assert.rejects(()=>db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['wedding-audio',other+'/invite/music.mp3']));
});
await role('anon',null,async()=>{const rows=(await db.query('select * from public.public_invitation_wishes($1)',[invite])).rows;assert.equal(rows.length,1);assert.equal(rows[0].owner_reply,'Cảm ơn bạn!');assert.ok(!('visitor_id' in rows[0]))});
await db.query('update public.invitations set published=false where id=$1',[invite]);
await role('anon',null,async()=>{assert.equal((await db.query('select * from public.public_invitation_wishes($1)',[invite])).rows.length,0);assert.equal((await db.query('select * from public.public_invitation_guest($1,$2)',[invite,guest.public_token])).rows.length,0);await assert.rejects(()=>db.query('select public.submit_invitation_wish($1,$2,$3,$4)',[invite,visitor,'Bạn','Chúc mừng!']));await db.query('select public.record_invitation_visit($1,$2,$3,null)',[invite,crypto.randomUUID(),visitor])});
assert.equal(Number((await db.query('select count(*) as count from public.invitation_visits')).rows[0].count),2);
// Authenticated users cannot self-assign admin, mutate even their own records, or upload to their own path.
await role('authenticated',other,async()=>{
 assert.equal((await db.query('select public.is_invitation_admin() as allowed')).rows[0].allowed,false);
 await assert.rejects(()=>db.query('insert into public.invitation_admins(user_id) values($1)',[other]));
 await assert.rejects(()=>db.query('select * from public.invitation_admins'));
 await assert.rejects(()=>db.query('insert into public.invitations(owner_id,title,document) values($1,$2,$3)',[other,'Denied',JSON.stringify(document)]));
 assert.equal((await db.query('update public.invitations set title=$1 where id=$2 returning id',['Denied',second])).rows.length,0);
 assert.equal((await db.query('delete from public.invitations where id=$1 returning id',[second])).rows.length,0);
 await assert.rejects(()=>db.query('insert into public.invitation_guests(invitation_id,name) values($1,$2)',[second,'Own guest but not admin']));
 for(const bucket of ['wedding-audio','wedding-assets'])await assert.rejects(()=>db.query('insert into storage.objects(bucket_id,name) values($1,$2)',[bucket,other+'/invite/file.mp3']));
 assert.equal((await db.query('select * from public.invitations')).rows.length,1,'published records remain readable');
});
await role('authenticated',owner,async()=>{assert.equal((await db.query('select public.is_invitation_admin() as allowed')).rows[0].allowed,true);await db.query('insert into public.invitations(owner_id,title,document) values($1,$2,$3)',[owner,'Draft',JSON.stringify(document)])});
await db.query('delete from public.invitation_admins where user_id=$1',[owner]);
await role('authenticated',owner,async()=>{
 assert.equal((await db.query('select * from public.invitation_guests')).rows.length,0);
 assert.equal((await db.query('select * from public.invitation_visits')).rows.length,0);
 assert.equal((await db.query('select * from public.invitation_wishes')).rows.length,0);
 assert.equal((await db.query('select * from public.invitations where published=false')).rows.length,0,'revoked admin cannot read drafts');
 await assert.rejects(()=>db.query('select public.owner_invitation_stats($1)',[invite]));
 await assert.rejects(()=>db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['wedding-audio',owner+'/invite/revoked.mp3']));
});
await db.close();console.log('Passed: actual PostgreSQL migrations twice; ownership/RLS; private guest contacts; scoped guest links/RSVP; deduplicated visits; moderated wishes/replies/rate limits; stats; audio upload ownership; unpublished invitations blocked.');
