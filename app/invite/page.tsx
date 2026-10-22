'use client';
import {useEffect,useState} from 'react';
import {Heart,RefreshCw,BookOpen} from 'lucide-react';
import {load} from '../../lib/supabase';
import {supabaseConfig} from '../../lib/config';
import {validateDocument,type Wedding} from '../../lib/document';
import {normalizeGuestName} from '../../lib/invitation';
import {readPreviewLink} from '../../lib/preview-link';
import InvitationReader from '../../components/wedding/invitation-reader';
import Sheet from '../../components/wedding/sheet';
import {ViewerBrand} from '../../components/wedding/invitation-extras';
import {guestInfo,type CloudInvitation} from '../../lib/engagement';
import {getFeatures} from '../../lib/features';
export default function Invitation(){
 const [invitation,setInvitation]=useState<Wedding|null>(null),[guest,setGuest]=useState(''),[error,setError]=useState(''),[cloud,setCloud]=useState<CloudInvitation|undefined>(undefined);
 useEffect(()=>{let active=true;const query=new URLSearchParams(location.search);setGuest(normalizeGuestName(query.get('guest')||''));
  async function open(){try{let document:Wedding;
   if(query.get('preview')==='1')document=await readPreviewLink(location.hash);
   else if(query.get('invite')){if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.get('invite')!))throw Error('Mã thiệp mời không hợp lệ.');const config=supabaseConfig;const rows=await load(config,query.get('invite')!);if(!rows?.[0]||!validateDocument(rows[0].document))throw Error('Thiệp chưa được chia sẻ hoặc không tồn tại.');document=rows[0].document;const connection={config,id:query.get('invite')!,guestToken:query.get('g')||undefined};if(active)setCloud(connection);if(connection.guestToken)guestInfo(connection).then(rows=>{if(active&&rows[0])setGuest(rows[0].name)}).catch(()=>{});}
   else throw Error('Liên kết thiệp mời chưa đầy đủ. Hãy mở lại liên kết người gửi đã chia sẻ.');
   if(active)setInvitation(document);
  }catch(error){if(active)setError((error as Error).message)}}
  void open();return()=>{active=false};
 },[]);
 useEffect(()=>{if(!invitation)return;document.title=invitation.title;const icon=document.querySelector<HTMLLinkElement>('link[rel=icon]');const original=icon?.href;if(icon){const brand=getFeatures(invitation).brand;if(brand.mode==='image'&&brand.image)icon.href=brand.image;else if(brand.hidePlatform||brand.mode==='hidden')icon.href='/heart.svg'}return()=>{if(icon&&original)icon.href=original}},[invitation]);
 return <main className="preview-overlay guest" aria-label="Thiệp mời cưới"><header className="preview-bar"><ViewerBrand document={invitation}/><span>TRÂN TRỌNG KÍNH MỜI</span></header>{error?<div className="reader-error" role="alert"><BookOpen size={30}/><h1>Chưa mở được thiệp mời</h1><p>{error}</p><button onClick={()=>location.reload()}><RefreshCw size={18}/>Thử lại</button></div>:!invitation?<div className="invitation-loading" role="status"><Heart size={30}/><p>Đang mở lời hẹn…</p></div>:<div className="reader-layout phone-preview plain-reader-layout"><InvitationReader document={invitation} guestName={guest} cloud={cloud} renderPage={page=><Sheet page={page} theme={invitation.theme} design={invitation.design}/>} /></div>}</main>
}
