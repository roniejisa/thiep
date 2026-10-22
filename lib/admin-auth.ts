import {login,request,type Config,type Session} from './supabase';

const sessionKey='loi-hen:admin-session:v1';
export function readSession():Session|null{try{return JSON.parse(sessionStorage.getItem(sessionKey)||'null')}catch{return null}}
export function rememberSession(session:Session|null){try{if(session)sessionStorage.setItem(sessionKey,JSON.stringify(session));else sessionStorage.removeItem(sessionKey)}catch{/* The current tab can still use its in-memory session. */}}

// The RPC checks a protected database table. User metadata and browser storage never grant admin rights.
export async function verifyAdmin(c:Config,input:Session):Promise<Session>{
 if(!input?.access_token||!input?.user?.id)throw Error('Vui lòng đăng nhập tài khoản quản trị.');
 let session={...input};
 if(!session.expires_at||session.expires_at<=Date.now()/1000+90){
  if(!session.refresh_token)throw Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  session=await request(c,'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refresh_token})});
  session.expires_at=session.expires_at||Math.floor(Date.now()/1000)+(session.expires_in||3600);
 }
 const user=await request(c,'/auth/v1/user',{},session.access_token);
 if(!user?.id||user.id!==session.user.id)throw Error('Phiên đăng nhập không hợp lệ.');
 let allowed=false;
 try{allowed=await request(c,'/rest/v1/rpc/is_invitation_admin',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'},session.access_token)}
 catch{throw Error('Chưa kiểm tra được quyền quản trị. Hãy chạy supabase-setup.sql trong Supabase rồi thử lại.');}
 if(allowed!==true)throw Error('Tài khoản này chưa được cấp quyền quản trị.');
 return {...session,user};
}
export async function loginAdmin(c:Config,email:string,password:string){
 const session=await login(c,email.trim(),password);
 session.expires_at=session.expires_at||Math.floor(Date.now()/1000)+(session.expires_in||3600);
 try{return await verifyAdmin(c,session)}catch(error){await logoutAdmin(c,session);throw error}
}
export async function logoutAdmin(c:Config,session:Session|null){
 rememberSession(null);
 if(session)try{await request(c,'/auth/v1/logout?scope=local',{method:'POST'},session.access_token)}catch{/* Local access is removed even when the network is unavailable. */}
}
