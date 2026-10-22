'use client';
import type {CSSProperties} from 'react';
import type {Features} from '../../lib/features';
import {useForeground} from './page-activity';

const palette=['#d6a6ae','#c6ae78','#a6b7a3','#e6d2b5','#ba919f'];
function Dove(){return <svg className="atmosphere-dove" viewBox="0 0 80 48" fill="none" aria-hidden="true"><g fill="currentColor" stroke="#8d9e8b" strokeWidth=".7" strokeLinejoin="round"><g className="dove-far-wing"><path d="M39 29C42 17 40 7 34 2C47 7 55 19 48 31Z"/></g><path d="M27 29C35 23 43 22 49 24C50 17 56 14 61 18C64 20 64 24 61 27L70 29L61 30C59 35 53 37 47 34L33 34L17 41L24 31Z"/><g className="dove-wing"><path d="M40 29C35 16 24 6 11 5C15 20 23 31 40 33Z"/><path d="M17 13Q28 26 37 29M21 10Q30 22 39 27" strokeOpacity=".4"/></g></g><circle cx="58" cy="23" r=".8" fill="#5f7162"/></svg>}
function BalloonShape(){return <svg className="atmosphere-balloon" viewBox="0 0 52 104" fill="none" aria-hidden="true"><path d="M26 3C10 3 3 15 6 29C8 41 19 51 26 55C33 51 44 41 46 29C49 15 42 3 26 3Z" fill="currentColor"/><path d="M17 10C10 14 10 24 13 28" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".55"/><path d="M26 53L22 59H30Z" fill="currentColor"/><path className="balloon-string" d="M26 59C15 71 39 78 26 90C22 94 23 99 27 102" stroke="currentColor" strokeWidth=".9" opacity=".8"/><path d="M7 28C11 42 20 49 26 51C32 49 40 42 45 29C40 43 32 51 26 55C20 51 11 43 7 28Z" fill="#5f4d38" opacity=".1"/></svg>}
function FallingHeart(){return <svg className="atmosphere-heart" viewBox="0 0 28 26" aria-hidden="true"><path d="M14 24C11 21 2 15 2 8A6.5 6.5 0 0 1 14 4A6.5 6.5 0 0 1 26 8C26 15 17 21 14 24Z" fill="currentColor"/><path d="M6 8C6 5 10 4 12 7" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity=".5"/></svg>}

export default function InvitationAtmosphere({effects,preview=false}:{effects:Features['effects'];preview?:boolean}){
 const foreground=useForeground();
 if(effects.kind==='none')return null;
 const kind=effects.kind,density=effects.density??18;
 // Larger silhouettes stay sparse; small falling details can be more plentiful.
 const count=kind==='birds'?Math.max(3,Math.round(density/3)):kind==='balloons'?Math.max(4,Math.round(density/2)):density;
 const symbol=kind==='hearts'?'♡':kind==='snow'?'❄':kind==='petals'?'❀':kind==='sparkles'?'✧':effects.symbol||'♡';
 return <div className={'invitation-effects effect-'+kind+(preview?' atmosphere-preview':'')} aria-hidden="true" data-paused={!foreground} key={kind}>
  {Array.from({length:count},(_,index)=>{
   const duration=kind==='confetti'?10+index%4*2:kind==='birds'?16+index%4*3:14+index%5*3;
   const size=kind==='birds'?26+index%3*5:kind==='balloons'?28+index%3*6:kind==='snow'?10+index%4*3:17+index%4*4;
   return <span key={index} style={{left:((index*37+7)%100)+'%','--particle-delay':-(index*3.7%duration)+'s','--particle-duration':duration+'s','--particle-size':size+'px','--particle-drift':((index%2?-1:1)*(16+index%4*10))+'px','--particle-top':((index*23+7)%92)+'%','--flight-top':(12+index*17%50)+'%','--particle-color':kind==='hearts-fall'?['#cc8b9f','#e1a9b2','#bf9a62'][index%3]:palette[index%palette.length],'--wing-time':(.75+index%3*.12)+'s'} as CSSProperties}>{kind==='birds'?<Dove/>:kind==='balloons'?<BalloonShape/>:kind==='hearts-fall'?<FallingHeart/>:kind==='confetti'?<i className="confetti-piece"/>:symbol}</span>
  })}
 </div>;
}
