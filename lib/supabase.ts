import {getFeatures} from './features';
import {validateDocument,type Wedding} from './document';
export type Config={url:string;key:string};
export type Session={access_token:string;refresh_token?:string;expires_at?:number;expires_in?:number;user:{id:string;email?:string}};
export function checkConfig(c:Config){const u=new URL(c.url);if(u.protocol!=='https:'||u.pathname!=='/')throw Error('Project URL phải là địa chỉ HTTPS gốc của Supabase.');if(!c.key||c.key.startsWith('sb_secret_'))throw Error('Chỉ dùng publishable key hoặc anon key, không dùng secret key.');if(c.key.startsWith('ey')){try{const payload=JSON.parse(atob(c.key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(payload.role!=='anon')throw Error('invalid')}catch{throw Error('Chỉ dùng anon key công khai.')}}}
export async function request(c:Config,path:string,init:RequestInit={},token?:string){checkConfig(c);const r=await fetch(c.url.replace(/\/$/,'')+path,{...init,headers:{apikey:c.key,...(token?{Authorization:`Bearer ${token}`} : {}),...init.headers}});const body=await r.text();if(!r.ok){let message='Không kết nối được Supabase.';try{const d=JSON.parse(body);message=d.message||d.msg||d.error_description||message}catch{}throw Error(message)}return body?JSON.parse(body):null;}
export const login=(c:Config,email:string,password:string):Promise<Session>=>request(c,'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
export async function uploadMusic(c:Config,s:Session,id:string,file:File){
 const types:Record<string,string>={mp3:'audio/mpeg',m4a:'audio/mp4',aac:'audio/aac',wav:'audio/wav',ogg:'audio/ogg',webm:'audio/webm'};
 const ext=file.name.split('.').pop()?.toLowerCase();
 if(!ext||!types[ext]||file.size===0||file.size>20*1024*1024)throw Error('Chọn MP3, M4A, AAC, WAV, OGG hoặc WebM từ 1 byte đến 20 MB.');
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(!uuid.test(s.user.id)||!uuid.test(id))throw Error('Chưa sẵn sàng tải nhạc. Hãy mở lại thiệp.');
 const path=`${s.user.id}/${id}/${crypto.randomUUID()}.${ext}`;
 await request(c,'/storage/v1/object/wedding-audio/'+path,{method:'POST',headers:{'Content-Type':types[ext]},body:file.slice(0,file.size,types[ext])},s.access_token);
 return c.url.replace(/\/$/,'')+'/storage/v1/object/public/wedding-audio/'+path;
}
export async function save(c:Config,s:Session,document:Wedding,id:string,published:boolean){
 if(!validateDocument(document))throw Error('Kiểm tra lại dữ liệu thiệp, ngày giờ và liên kết video trước khi lưu.');
 const copy:Wedding=structuredClone(document);if(copy.features)copy.features=getFeatures(copy);
 async function upload(value:string,audio=false){
  if(!value.startsWith('data:'))return value;
  const blob=await (await fetch(value)).blob(),ext=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':audio?(blob.type==='audio/mpeg'?'mp3':blob.type==='audio/mp4'?'m4a':blob.type.includes('wav')?'wav':blob.type==='audio/aac'?'aac':blob.type==='audio/ogg'?'ogg':'webm'):'jpg';
  const bucket=audio?'wedding-audio':'wedding-assets';const path=`${s.user.id}/${id}/${crypto.randomUUID()}.${ext}`;
  await request(c,'/storage/v1/object/'+bucket+'/'+path,{method:'POST',headers:{'Content-Type':blob.type},body:blob},s.access_token);
  return c.url.replace(/\/$/,'')+'/storage/v1/object/public/'+bucket+'/'+path;
 }
 for(const p of copy.pages)for(const e of p.elements){
  if(e.type==='image')e.value=await upload(e.value);
  if(e.widget?.qrImage)e.widget.qrImage=await upload(e.widget.qrImage);
  if(e.widget?.images){const images=[];for(const src of e.widget.images)images.push(await upload(src));e.widget.images=images;}
 }
 if(copy.features?.photobook){const images=[];for(const image of copy.features.photobook.images)images.push(await upload(image));copy.features.photobook.images=images;}
 if(copy.features?.gifts)for(const account of copy.features.gifts.accounts)if(account.qrImage)account.qrImage=await upload(account.qrImage);
 if(copy.features?.brand?.image)copy.features.brand.image=await upload(copy.features.brand.image);
 if(copy.features?.music?.url)copy.features.music.url=await upload(copy.features.music.url,true);
 await request(c,'/rest/v1/invitations?on_conflict=id',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify({id,owner_id:s.user.id,title:copy.title,document:copy,published,updated_at:new Date().toISOString()})},s.access_token);return copy;
}
export const load=(c:Config,id:string,token?:string)=>request(c,`/rest/v1/invitations?id=eq.${encodeURIComponent(id)}&select=id,title,document,published,updated_at`,{},token);
export const list=(c:Config,s:Session)=>request(c,`/rest/v1/invitations?owner_id=eq.${s.user.id}&select=id,title,document,published,updated_at&order=updated_at.desc`,{},s.access_token);
