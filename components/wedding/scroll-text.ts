'use client';
import {useEffect,type RefObject} from 'react';
import type {Features} from '../../lib/features';

// Observe stationary layout boxes; only their inner text moves. This avoids
// observer feedback at viewport edges and keeps the editor's coordinates intact.
export function useScrollText(root:RefObject<HTMLElement|null>,effects:Features['effects'],content:unknown){
 const {text='rise',repeat=true,duration=700}=effects;
 useEffect(()=>{
  const host=root.current;
  if(!host||text==='none'||typeof IntersectionObserver==='undefined')return;
  const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let observer:IntersectionObserver|undefined;
  let targets:HTMLElement[]=[];
  function clear(){observer?.disconnect();observer=undefined;for(const target of targets){target.classList.remove('text-reveal-target');target.removeAttribute('data-reveal-state');target.style.removeProperty('--reveal-offset')}targets=[];host!.removeAttribute('data-text-effect');host!.style.removeProperty('--text-duration')}
  function start(){
   clear();if(media?.matches)return;
   const scrollRoot=host!.closest<HTMLElement>('[data-invitation-scroll],.preview-overlay');
   const viewport=scrollRoot?.getBoundingClientRect();
   targets=Array.from(host!.querySelectorAll<HTMLElement>('.element.text,.readable-element.text,.reveal-line'));
   if(!targets.length)return;
   try{
    observer=new IntersectionObserver(entries=>{
     for(const entry of entries){const target=entry.target as HTMLElement;
      if(entry.isIntersecting){target.dataset.revealState='visible';if(!repeat)observer?.unobserve(target)}
      else if(repeat||target.dataset.revealState!=='visible'){target.style.setProperty('--reveal-offset',entry.boundingClientRect.bottom<=(entry.rootBounds?.top??0)?'-24px':'24px');target.dataset.revealState='waiting'}
     }
    },{root:scrollRoot,rootMargin:'-12px 0px',threshold:0});
    for(const target of targets){const box=target.getBoundingClientRect();target.style.setProperty('--reveal-offset',box.bottom<=(viewport?.top??0)?'-24px':'24px');target.classList.add('text-reveal-target');target.dataset.revealState='waiting';observer.observe(target)}
    host!.dataset.textEffect=text;host!.style.setProperty('--text-duration',duration+'ms');
   }catch{clear()}
  }
  start();media?.addEventListener?.('change',start);
  return()=>{media?.removeEventListener?.('change',start);clear()};
 },[root,text,repeat,duration,content]);
}
