'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import dynamic from 'next/dynamic';
import {ArrowRight,Heart,LockKeyhole,Eye,EyeOff} from 'lucide-react';
import {supabaseConfig} from '../../lib/config';
import {loginAdmin,logoutAdmin,readSession,rememberSession,verifyAdmin} from '../../lib/admin-auth';
import type {Session} from '../../lib/supabase';
const Studio=dynamic(()=>import('./studio'),{ssr:false,loading:()=> <main className="auth-loading" role="status">Đang mở không gian thiết kế…</main>});

export default function AdminGate(){
 const [session,setSession]=useState<Session|null>(null),[checking,setChecking]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[show,setShow]=useState(false);
 const current=useRef<Session|null>(null),generation=useRef(0),validating=useRef(false);
 function accept(value:Session|null){current.current=value;rememberSession(value);setSession(value)}
 useEffect(()=>{let alive=true;const stored=readSession();
  if(!stored){setChecking(false);return}
  void verifyAdmin(supabaseConfig,stored).then(value=>{if(alive)accept(value)}).catch(e=>{if(alive){accept(null);setError(e.message)}}).finally(()=>{if(alive)setChecking(false)});
  return()=>{alive=false};
 },[]);
 useEffect(()=>{if(!session)return;
  async function check(){if(validating.current||!current.current)return;const attempt=generation.current;validating.current=true;
   try{const value=await verifyAdmin(supabaseConfig,current.current);if(attempt===generation.current)accept(value)}
   catch(e){if(attempt===generation.current){accept(null);setPassword('');setError((e as Error).message)}}finally{validating.current=false}}
  const timer=setInterval(check,60000);window.addEventListener('focus',check);
  return()=>{clearInterval(timer);window.removeEventListener('focus',check)};
 },[Boolean(session)]);
 async function signIn(event:FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError('');
  try{const value=await loginAdmin(supabaseConfig,email,password);generation.current++;accept(value);setPassword('')}
  catch(e){const message=(e as Error).message;setError(message==='Invalid login credentials'?'Email hoặc mật khẩu chưa đúng.':message==='Email not confirmed'?'Email tài khoản chưa được xác nhận.':message||'Chưa đăng nhập được. Vui lòng thử lại.')}finally{setBusy(false)}
 }
 function signOut(){generation.current++;const old=current.current;accept(null);setPassword('');void logoutAdmin(supabaseConfig,old)}
 if(checking)return <main className="auth-loading" role="status">Đang kiểm tra phiên đăng nhập…</main>;
 if(session)return <Studio config={supabaseConfig} session={session} onLogout={signOut}/>;
 return <main className="admin-login"><section className="login-story" aria-label="Lời Hẹn Wedding Studio"><a className="login-brand" href="/">lời hẹn<span>WEDDING STUDIO</span></a><div className="login-story-copy"><span>MỖI TÌNH YÊU, MỘT CÂU CHUYỆN</span><h1>Viết nên<br/>ngày <em>chung đôi.</em></h1><p>Một lời mời tinh tế.<br/>Một kỷ niệm được lưu giữ mãi.</p><Heart size={28} strokeWidth={1}/></div><small>DÀNH RIÊNG CHO NGÀY HẠNH PHÚC CỦA BẠN</small></section><section className="login-form-panel"><div className="login-form-wrap"><span className="login-eyebrow"><LockKeyhole size={15}/>KHÔNG GIAN QUẢN TRỊ</span><h2>Chào bạn trở lại.</h2><p>Đăng nhập để tạo và chăm chút từng lời mời.</p><form onSubmit={signIn}><label htmlFor="admin-email">Email quản trị</label><input id="admin-email" type="email" required autoComplete="username" placeholder="ban@example.com" value={email} disabled={busy} onChange={e=>setEmail(e.target.value)}/><label htmlFor="admin-password">Mật khẩu</label><div className="login-password"><input id="admin-password" type={show?'text':'password'} required autoComplete="current-password" value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/><button type="button" aria-label={show?'Ẩn mật khẩu':'Hiện mật khẩu'} onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{error&&<p className="login-error" role="alert">{error}</p>}<button className="login-submit" disabled={busy}>{busy?'Đang kiểm tra…':'Đăng nhập'}<ArrowRight size={18}/></button></form><p className="login-help">Chỉ tài khoản được cấp quyền quản trị mới có thể vào trình chỉnh sửa.</p><div className="login-divider"><Heart size={14}/></div><p className="login-guest-note">Bạn là khách mời? Hãy mở liên kết thiệp được gửi riêng cho bạn.</p></div></section></main>;
}
