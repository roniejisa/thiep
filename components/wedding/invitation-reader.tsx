'use client';
import {Fragment,useEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import type {Wedding,Page} from '../../lib/document';
import {normalizeGuestName} from '../../lib/invitation';
import {getFeatures} from '../../lib/features';
import {useScrollText} from './scroll-text';
import {PageActivity} from './page-activity';
import {InvitationPrelude,InvitationExtras} from './invitation-extras';
import type {CloudInvitation} from '../../lib/engagement';
function Section({page,children}:{page:Page;children:ReactNode}){
 const ref=useRef<HTMLElement>(null),[nearby,setNearby]=useState(false);
 useEffect(()=>{if(typeof IntersectionObserver==='undefined'){setNearby(true);return}const observer=new IntersectionObserver(([entry])=>setNearby(entry.isIntersecting),{rootMargin:'500px 0px'});observer.observe(ref.current!);return()=>observer.disconnect()},[]);
 return <section ref={ref} className="invitation-section" aria-label={page.title}><PageActivity.Provider value={{visible:nearby,nearby}}>{children}</PageActivity.Provider></section>;
}
export default function InvitationReader({document,guestName,renderPage,cloud}:{document:Wedding;guestName:string;renderPage:(page:Page)=>ReactNode;cloud?:CloudInvitation}){
 const guest=normalizeGuestName(guestName),root=useRef<HTMLDivElement>(null);
 useScrollText(root,getFeatures(document).effects,document.pages);
 return <div ref={root} className="plain-invitation" style={{'--invitation-paper':document.theme,'--invitation-accent':document.design?.accent||'#ad8951','--invitation-ink':document.design?.ink||'#80643c'} as CSSProperties}><h1 className="sr-only">{document.title}</h1>{document.pages.map((page,index)=><Fragment key={page.id}><Section page={page}>{renderPage(page)}</Section>{index===0&&<>{guest&&<header className="plain-invitation-guest"><span>Trân trọng kính mời</span><strong>{guest}</strong></header>}<InvitationPrelude document={document}/></>}</Fragment>)}<InvitationExtras document={document} guestName={guest} cloud={cloud}/><footer className="plain-invitation-footer">Cảm ơn bạn đã chung vui cùng chúng mình.</footer></div>;
}
